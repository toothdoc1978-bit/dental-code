import 'package:cloud_firestore/cloud_firestore.dart';

/// Which way a gauge is heading over the next day or so.
enum RiverTrend { rising, falling, steady, unknown }

/// One gauge's current picture: the observed stage plus NOAA's forecast stage,
/// from which we derive a simple rising/falling/steady trend.
class GaugeStatus {
  final double? observedFt;
  final double? forecastFt;

  const GaugeStatus({this.observedFt, this.forecastFt});

  /// Rising/falling needs at least 0.2 ft of predicted movement — the river
  /// wobbles a tenth of a foot all day.
  RiverTrend get trend {
    final o = observedFt;
    final f = forecastFt;
    if (o == null || f == null) return RiverTrend.unknown;
    final d = f - o;
    if (d > 0.2) return RiverTrend.rising;
    if (d < -0.2) return RiverTrend.falling;
    return RiverTrend.steady;
  }

  Map<String, dynamic> toMap() => {
        'observedFt': observedFt,
        'forecastFt': forecastFt,
      };

  factory GaugeStatus.fromMap(Map<String, dynamic>? m) => GaugeStatus(
        observedFt: (m?['observedFt'] as num?)?.toDouble(),
        forecastFt: (m?['forecastFt'] as num?)?.toDouble(),
      );
}

/// The cached river snapshot (`riverStatus/current`): both Mississippi gauges,
/// shared by the whole club so one member's fetch serves everyone.
class RiverStatus {
  final DateTime fetchedAt;
  final GaugeStatus vicksburg;
  final GaugeStatus greenville;

  const RiverStatus({
    required this.fetchedAt,
    required this.vicksburg,
    required this.greenville,
  });

  Map<String, dynamic> toMap() => {
        'fetchedAt': Timestamp.fromDate(fetchedAt),
        'vicksburg': vicksburg.toMap(),
        'greenville': greenville.toMap(),
      };

  factory RiverStatus.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return RiverStatus(
      fetchedAt: (data['fetchedAt'] as Timestamp?)?.toDate() ??
          DateTime.fromMillisecondsSinceEpoch(0),
      vicksburg:
          GaugeStatus.fromMap((data['vicksburg'] as Map?)?.cast<String, dynamic>()),
      greenville: GaugeStatus.fromMap(
          (data['greenville'] as Map?)?.cast<String, dynamic>()),
    );
  }
}
