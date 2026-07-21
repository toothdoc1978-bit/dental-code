import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import '../models/forecast.dart';

/// Fetches the Open-Meteo forecast (keyless, free) and caches it to the single
/// Firestore doc `forecast/today`, so the whole club reads one document.
///
/// Property location: East Carroll Parish, LA (lat 32.8, lon -91.1).
class WeatherService {
  WeatherService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> get _doc =>
      _db.collection('forecast').doc('today');

  static const double _lat = 32.8;
  static const double _lon = -91.1;

  /// Live stream of the cached forecast (null until first fetch).
  Stream<Forecast?> streamForecast() =>
      _doc.snapshots().map((s) => s.exists ? Forecast.fromDoc(s) : null);

  /// Re-fetches only if the cached doc is missing or older than 2 hours.
  /// Network/API failures are swallowed so the app still works offline.
  Future<void> ensureFreshForecast() async {
    try {
      final snap = await _doc.get();
      if (snap.exists) {
        final fetchedAt = (snap.data()?['fetchedAt'] as Timestamp?)?.toDate();
        if (fetchedAt != null &&
            DateTime.now().difference(fetchedAt) < const Duration(hours: 2)) {
          return; // still fresh
        }
      }
      final forecast = await fetchOpenMeteo();
      // Server-stamped fetchedAt: a device with a future-set clock would
      // otherwise freeze the shared cache club-wide (every reader computes
      // "still fresh" forever). Rules enforce fetchedAt <= request.time.
      final map = forecast.toMap()
        ..['fetchedAt'] = FieldValue.serverTimestamp();
      await _doc.set(map);
    } catch (_) {
      // Offline or API hiccup — keep whatever is already cached.
    }
  }

  /// Calls Open-Meteo and returns the next 24 hours with computed tempDelta.
  Future<Forecast> fetchOpenMeteo() async {
    final uri = Uri.parse(
      'https://api.open-meteo.com/v1/forecast'
      '?latitude=$_lat&longitude=$_lon'
      '&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover'
      '&temperature_unit=fahrenheit&wind_speed_unit=mph'
      '&forecast_days=2&timezone=auto',
    );
    final resp = await http.get(uri);
    if (resp.statusCode != 200) {
      throw Exception('Open-Meteo HTTP ${resp.statusCode}');
    }
    final data = jsonDecode(resp.body) as Map<String, dynamic>;
    final hourly = (data['hourly'] as Map).cast<String, dynamic>();
    final times = (hourly['time'] as List).cast<String>();
    final temps = (hourly['temperature_2m'] as List).cast<num>();
    final winds = (hourly['wind_speed_10m'] as List).cast<num>();
    final dirs = (hourly['wind_direction_10m'] as List).cast<num>();
    // cloud_cover may be absent if the API ever drops the field; default 50.
    final clouds = (hourly['cloud_cover'] as List?)?.cast<num>();

    // First index at or after the current hour.
    final now = DateTime.now();
    final hourStart = DateTime(now.year, now.month, now.day, now.hour);
    var start = 0;
    for (var i = 0; i < times.length; i++) {
      if (!DateTime.parse(times[i]).isBefore(hourStart)) {
        start = i;
        break;
      }
    }

    final end = (start + 24) <= times.length ? start + 24 : times.length;
    final hours = <HourlyWeather>[];
    for (var i = start; i < end; i++) {
      final temp = temps[i].toDouble();
      // Delta vs the actual previous hour in the raw series.
      final prev = i > 0 ? temps[i - 1].toDouble() : temp;
      hours.add(HourlyWeather(
        time: DateTime.parse(times[i]),
        tempF: temp,
        windMph: winds[i].toDouble(),
        windDirDeg: dirs[i].toDouble(),
        tempDelta: temp - prev,
        cloudCoverPct: (i < (clouds?.length ?? 0)) ? clouds![i].toDouble() : 50,
      ));
    }
    return Forecast(fetchedAt: DateTime.now(), hours: hours);
  }
}
