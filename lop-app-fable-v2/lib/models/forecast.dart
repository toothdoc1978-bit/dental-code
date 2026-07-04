import 'package:cloud_firestore/cloud_firestore.dart';

/// One hour of forecast for the property.
class HourlyWeather {
  final DateTime time;
  final double tempF;
  final double windMph;
  final double windDirDeg; // direction the wind comes FROM (compass degrees)
  final double tempDelta; // this hour's temp minus the previous hour's

  const HourlyWeather({
    required this.time,
    required this.tempF,
    required this.windMph,
    required this.windDirDeg,
    required this.tempDelta,
  });

  Map<String, dynamic> toMap() => {
        'time': time.toIso8601String(),
        'tempF': tempF,
        'windMph': windMph,
        'windDirDeg': windDirDeg,
        'tempDelta': tempDelta,
      };

  factory HourlyWeather.fromMap(Map<String, dynamic> m) => HourlyWeather(
        time: DateTime.parse(m['time'] as String),
        tempF: (m['tempF'] as num).toDouble(),
        windMph: (m['windMph'] as num).toDouble(),
        windDirDeg: (m['windDirDeg'] as num).toDouble(),
        tempDelta: (m['tempDelta'] as num).toDouble(),
      );
}

/// The cached forecast document (`forecast/today`): when it was fetched plus the
/// next 24 hours. Stored as one lightweight doc to minimize Firestore reads.
class Forecast {
  final DateTime fetchedAt;
  final List<HourlyWeather> hours;

  const Forecast({required this.fetchedAt, required this.hours});

  /// Index of the hour containing [now] (the cached forecast can be up to two
  /// hours old, so `hours.first` may already be in the past). Falls back to 0.
  int indexForNow({DateTime? now}) {
    final n = now ?? DateTime.now();
    for (var i = hours.length - 1; i >= 0; i--) {
      if (!hours[i].time.isAfter(n)) return i;
    }
    return 0;
  }

  Map<String, dynamic> toMap() => {
        'fetchedAt': Timestamp.fromDate(fetchedAt),
        'hours': hours.map((h) => h.toMap()).toList(),
      };

  factory Forecast.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    final raw = (data['hours'] as List?) ?? const [];
    return Forecast(
      fetchedAt: (data['fetchedAt'] as Timestamp?)?.toDate() ??
          DateTime.fromMillisecondsSinceEpoch(0),
      hours: raw
          .map((e) => HourlyWeather.fromMap((e as Map).cast<String, dynamic>()))
          .toList(),
    );
  }
}
