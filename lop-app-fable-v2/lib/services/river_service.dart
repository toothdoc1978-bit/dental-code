import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import '../config.dart';
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
      final results = await Future.wait([
        _gauge(kVicksburgGaugeLid),
        _gauge(kGreenvilleGaugeLid),
      ]);
      // Don't clobber a good cache with a failed fetch.
      if (results[0].observedFt == null && results[1].observedFt == null) {
        return;
      }
      await _doc.set(RiverStatus(
        fetchedAt: DateTime.now(),
        vicksburg: results[0],
        greenville: results[1],
      ).toMap());
    } catch (_) {
      // Offline or API hiccup — keep whatever is already cached.
    }
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
