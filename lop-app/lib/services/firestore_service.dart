import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/hunt.dart';

/// Thrown when a check-in is attempted on a stand someone else already holds.
class StandOccupiedException implements Exception {
  final int standId;
  StandOccupiedException(this.standId);
  @override
  String toString() => 'Stand $standId is already occupied.';
}

/// All Firestore reads/writes for hunts live here.
///
/// Data model — collection `hunts`, one doc per check-in:
///   standId: int, userId: string, checkInTime: Timestamp,
///   checkOutTime: Timestamp?, active: bool,
///   doeSeen/fawnSeen/buckSeen: int? (filled at checkout),
///   createdAt: serverTimestamp
class FirestoreService {
  FirestoreService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _hunts =>
      _db.collection('hunts');

  /// Checks the current user into [standId].
  ///
  /// Guards against double-occupancy: if an active hunt already exists for the
  /// stand, throws [StandOccupiedException]. Returns the new hunt's doc id.
  Future<String> checkIn({
    required int standId,
    required String userId,
  }) async {
    final existing = await _hunts
        .where('standId', isEqualTo: standId)
        .where('active', isEqualTo: true)
        .limit(1)
        .get();
    if (existing.docs.isNotEmpty) {
      throw StandOccupiedException(standId);
    }

    final ref = await _hunts.add({
      'standId': standId,
      'userId': userId,
      'active': true,
      'checkInTime': FieldValue.serverTimestamp(),
      'checkOutTime': null,
      'doeSeen': null,
      'fawnSeen': null,
      'buckSeen': null,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /// Completes an active hunt: records checkout time and the sightings.
  Future<void> checkOut({
    required String huntId,
    required int doe,
    required int fawn,
    required int buck,
  }) async {
    await _hunts.doc(huntId).update({
      'active': false,
      'checkOutTime': FieldValue.serverTimestamp(),
      'doeSeen': doe,
      'fawnSeen': fawn,
      'buckSeen': buck,
    });
  }

  /// Live stream of every currently-active hunt (drives occupancy on the map).
  Stream<List<Hunt>> streamActiveHunts() {
    return _hunts.where('active', isEqualTo: true).snapshots().map(
          (snap) => snap.docs.map(Hunt.fromDoc).toList(),
        );
  }

  /// Live stream of the signed-in user's own active hunt, or null if none.
  ///
  /// Drives the Check In vs. Check Out button state.
  Stream<Hunt?> streamMyActiveHunt(String userId) {
    return _hunts
        .where('userId', isEqualTo: userId)
        .where('active', isEqualTo: true)
        .limit(1)
        .snapshots()
        .map((snap) => snap.docs.isEmpty ? null : Hunt.fromDoc(snap.docs.first));
  }
}
