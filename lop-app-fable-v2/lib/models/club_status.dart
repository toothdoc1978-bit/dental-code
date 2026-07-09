import 'package:cloud_firestore/cloud_firestore.dart';

/// How the high-water archery rule is being decided.
enum HighWaterMode {
  /// Follow the Vicksburg gauge automatically (the default).
  auto,

  /// Admin forced the rule ON regardless of the gauge.
  forceOn,

  /// Admin forced the rule OFF regardless of the gauge.
  forceOff,
}

/// Club-wide state (`clubStatus/current`): whether the LDWF Area 1 high-water
/// archery-only rule is in effect, and whether that's automatic (from the
/// Vicksburg gauge, with hysteresis) or an admin override.
class ClubStatus {
  /// The gauge-driven answer, maintained automatically with hysteresis.
  final bool highWaterArchery;

  final HighWaterMode mode;
  final DateTime? updatedAt;

  const ClubStatus({
    required this.highWaterArchery,
    this.mode = HighWaterMode.auto,
    this.updatedAt,
  });

  /// The answer the rest of the app obeys: an admin override wins; otherwise
  /// the automatic gauge-driven state.
  bool get archeryOnly => switch (mode) {
        HighWaterMode.forceOn => true,
        HighWaterMode.forceOff => false,
        HighWaterMode.auto => highWaterArchery,
      };

  Map<String, dynamic> toMap() => {
        'highWaterArchery': highWaterArchery,
        'highWaterMode': mode.name,
        'updatedAt': updatedAt == null
            ? FieldValue.serverTimestamp()
            : Timestamp.fromDate(updatedAt!),
      };

  factory ClubStatus.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return ClubStatus(
      highWaterArchery: data['highWaterArchery'] as bool? ?? false,
      mode: HighWaterMode.values.asNameMap()[data['highWaterMode']] ??
          HighWaterMode.auto,
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }
}
