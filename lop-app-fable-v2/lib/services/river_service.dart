import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/club_status.dart';
import '../models/river_status.dart';

/// Mississippi River stage from NOAA's National Water Prediction Service
/// (keyless, free) for the Vicksburg and Greenville gauges.
///
/// Two jobs:
///  * [currentLevels] — fresh observed stages recorded on each check-in.
///  * [ensureFreshStatus]/[streamStatus] — a club-shared snapshot (observed +
///    forecast stage → rising/falling trend) cached to `riverStatus/current`
///    so one member's fetch serves everyone, same pattern as the weather doc.
///
/// API: GET https://api.water.noaa.gov/nwps/v1/gauges/{LID}
///      -> json['status']['observed']['primary'] (number, ft)
///      -> json['status']['forecast']['primary'] (number, ft — may be absent)
class RiverService {
  RiverService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> get _doc =>
      _db.collection('riverStatus').doc('current');

  DocumentReference<Map<String, dynamic>> get _clubDoc =>
      _db.collection('clubStatus').doc('current');

  /// Returns both gauges' observed stage in feet, or null for either on any
  /// failure (offline, timeout, API hiccup) so check-in is never blocked.
  Future<({double? vicksburgFt, double? greenvilleFt})> currentLevels() async {
    final results = await Future.wait([
      _gauge(kVicksburgGaugeLid),
      _gauge(kGreenvilleGaugeLid),
    ]);
    return (
      vicksburgFt: results[0].observedFt,
      greenvilleFt: results[1].observedFt,
    );
  }

  /// Live stream of the cached river snapshot (null until first fetch).
  Stream<RiverStatus?> streamStatus() =>
      _doc.snapshots().map((s) => s.exists ? RiverStatus.fromDoc(s) : null);

  /// Re-fetches only if the cached doc is missing or older than 1 hour.
  /// Failures are swallowed so the app still works offline.
  Future<void> ensureFreshStatus() async {
    try {
      final snap = await _doc.get();
      if (snap.exists) {
        final fetchedAt = (snap.data()?['fetchedAt'] as Timestamp?)?.toDate();
        if (fetchedAt != null &&
            DateTime.now().difference(fetchedAt) < const Duration(hours: 1)) {
          return; // still fresh
        }
      }
      final gauges = await Future.wait([
        _gauge(kVicksburgGaugeLid),
        _gauge(kGreenvilleGaugeLid),
      ]);
      final waterTempF = await _waterTempF();
      // Don't clobber a good cache with a failed fetch.
      if (gauges[0].observedFt == null &&
          gauges[1].observedFt == null &&
          waterTempF == null) {
        return;
      }
      // Server-stamped fetchedAt (see weather_service.dart for why).
      final map = RiverStatus(
        fetchedAt: DateTime.now(),
        vicksburg: gauges[0],
        greenville: gauges[1],
        waterTempF: waterTempF,
      ).toMap()
        ..['fetchedAt'] = FieldValue.serverTimestamp();
      await _doc.set(map);
      await _updateHighWater(gauges[0].observedFt);
    } catch (_) {
      // Offline or API hiccup — keep whatever is already cached.
    }
  }

  // --- LDWF high-water archery rule ------------------------------------------

  /// Live stream of the club status doc (null until it first exists).
  Stream<ClubStatus?> streamClubStatus() =>
      _clubDoc.snapshots().map((s) => s.exists ? ClubStatus.fromDoc(s) : null);

  /// Admin override: force the high-water rule on/off, or return to auto.
  Future<void> setHighWaterMode(HighWaterMode mode) async {
    await _clubDoc.set({
      'highWaterMode': mode.name,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
    // Returning to auto: recompute NOW from the cached gauge. While an
    // override was active the stored auto flag stopped tracking the river,
    // so without this the rule can read stale (wrongly off during a legal
    // archery-only stage) for up to an hour until the next TTL refetch.
    if (mode == HighWaterMode.auto) {
      try {
        final snap = await _doc.get();
        final vburg = ((snap.data()?['vicksburg'] as Map?)?['observedFt']
                as num?)
            ?.toDouble();
        await _updateHighWater(vburg);
      } catch (_) {/* offline — next refetch recomputes */}
    }
  }

  /// Applies the gauge reading to the automatic high-water state. Only writes
  /// when the mode is auto and the answer actually changed.
  Future<void> _updateHighWater(double? vicksburgFt) async {
    final snap = await _clubDoc.get();
    final prev = snap.exists ? ClubStatus.fromDoc(snap) : null;
    if (prev != null && prev.mode != HighWaterMode.auto) return;
    final was = prev?.highWaterArchery ?? false;
    final now = resolveHighWater(was, vicksburgFt);
    if (now == was && snap.exists) return;
    if (now == was && !snap.exists && !now) return; // nothing worth creating
    await _clubDoc.set({
      'highWaterArchery': now,
      'highWaterMode': HighWaterMode.auto.name,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  /// The LDWF hysteresis: ON at >= [kHighWaterOnFt] (43.0), OFF below
  /// [kHighWaterOffFt] (41.0), unchanged in between or with no reading.
  /// Pure and static so it's unit-testable.
  static bool resolveHighWater(bool previous, double? vicksburgStageFt) {
    final s = vicksburgStageFt;
    if (s == null) return previous;
    if (s >= kHighWaterOnFt) return true;
    if (s < kHighWaterOffFt) return false;
    return previous;
  }

  Future<GaugeStatus> _gauge(String lid) async {
    try {
      final uri = Uri.parse('https://api.water.noaa.gov/nwps/v1/gauges/$lid');
      final resp = await http.get(uri).timeout(const Duration(seconds: 4));
      if (resp.statusCode != 200) return const GaugeStatus();
      return parseGauge(jsonDecode(resp.body) as Map<String, dynamic>);
    } catch (_) {
      return const GaugeStatus();
    }
  }

  /// Mississippi water temperature (°F) from the USGS instantaneous-values
  /// API, or null on any failure.
  Future<double?> _waterTempF() async {
    try {
      final uri = Uri.parse(
        'https://waterservices.usgs.gov/nwis/iv/'
        '?sites=$kWaterTempUsgsSite&parameterCd=00010&format=json',
      );
      final resp = await http.get(uri).timeout(const Duration(seconds: 4));
      if (resp.statusCode != 200) return null;
      return waterTempFFrom(jsonDecode(resp.body) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  /// Pulls the latest water temperature (°C in the feed, returned as °F) out
  /// of a USGS IV response. Pure and static so it's unit-testable.
  static double? waterTempFFrom(Map<String, dynamic> json) {
    try {
      final series = ((json['value'] as Map)['timeSeries'] as List);
      if (series.isEmpty) return null;
      final values =
          (((series.first as Map)['values'] as List).first as Map)['value']
              as List;
      if (values.isEmpty) return null;
      final c = double.tryParse((values.first as Map)['value'] as String);
      // Sanity bounds; USGS uses sentinel values for bad readings.
      if (c == null || c < -5 || c > 45) return null;
      return c * 9 / 5 + 32;
    } catch (_) {
      return null;
    }
  }

  /// Pulls observed + forecast stage out of an NWPS gauge response.
  /// Pure and static so it's unit-testable against a JSON fixture.
  static GaugeStatus parseGauge(Map<String, dynamic> json) {
    final status = json['status'] as Map?;
    double? read(String key) {
      final v = (status?[key] as Map?)?['primary'];
      // NWPS uses sentinel values like -999 for "no data".
      return (v is num && v > -100) ? v.toDouble() : null;
    }

    return GaugeStatus(observedFt: read('observed'), forecastFt: read('forecast'));
  }
}
