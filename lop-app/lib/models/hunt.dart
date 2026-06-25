import 'package:cloud_firestore/cloud_firestore.dart';

/// A single hunt record: one document in the `hunts` collection.
///
/// Created at check-in (`active == true`, no checkout time / sightings yet) and
/// completed at check-out (`active == false`, checkout time + sightings filled).
class Hunt {
  final String id;
  final int standId;
  final String userId;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final bool active;

  /// Sightings, populated at checkout. Null while the hunt is active.
  final int? doeSeen;
  final int? fawnSeen;
  final int? buckSeen;

  const Hunt({
    required this.id,
    required this.standId,
    required this.userId,
    required this.active,
    this.checkInTime,
    this.checkOutTime,
    this.doeSeen,
    this.fawnSeen,
    this.buckSeen,
  });

  /// Builds a [Hunt] from a Firestore document snapshot.
  factory Hunt.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return Hunt(
      id: doc.id,
      standId: (data['standId'] as num?)?.toInt() ?? -1,
      userId: data['userId'] as String? ?? '',
      active: data['active'] as bool? ?? false,
      checkInTime: (data['checkInTime'] as Timestamp?)?.toDate(),
      checkOutTime: (data['checkOutTime'] as Timestamp?)?.toDate(),
      doeSeen: (data['doeSeen'] as num?)?.toInt(),
      fawnSeen: (data['fawnSeen'] as num?)?.toInt(),
      buckSeen: (data['buckSeen'] as num?)?.toInt(),
    );
  }

  /// Total animals seen (0 if not yet checked out).
  int get totalSeen => (doeSeen ?? 0) + (fawnSeen ?? 0) + (buckSeen ?? 0);
}
