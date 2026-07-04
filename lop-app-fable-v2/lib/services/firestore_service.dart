import 'dart:ui' show Offset;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/hunt.dart';
import '../models/member.dart';
import '../models/stand.dart';

/// Thrown when a check-in is attempted on a stand someone else already holds.
class StandOccupiedException implements Exception {
  final String standCode;
  StandOccupiedException(this.standCode);
  @override
  String toString() => 'Stand $standCode is already taken.';
}

/// All Firestore reads/writes live here.
///
/// `hunts` — one doc per check-in: standCode/huntType/member* strings, userId,
/// active, checkInTime/checkOutTime, doeSeen/buckSeen/fawnSeen (deer hunts),
/// riverVicksburgFt/riverGreenvilleFt (river stage at check-in).
/// `standPositions` — doc id == stand code, x/y fractions of the map image.
class FirestoreService {
  FirestoreService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _hunts =>
      _db.collection('hunts');
  CollectionReference<Map<String, dynamic>> get _positions =>
      _db.collection('standPositions');

  /// Checks [member] into [stand] for [huntType], recording the exact time and
  /// the Mississippi River stage (ft) at Vicksburg & Greenville (null if offline).
  Future<String> checkIn({
    required Stand stand,
    required String huntType,
    required Member member,
    required String userId,
    double? riverVicksburgFt,
    double? riverGreenvilleFt,
  }) async {
    final existing = await _hunts
        .where('standCode', isEqualTo: stand.code)
        .where('active', isEqualTo: true)
        .limit(1)
        .get();
    if (existing.docs.isNotEmpty) {
      throw StandOccupiedException(stand.code);
    }

    final ref = await _hunts.add({
      'standCode': stand.code,
      'huntType': huntType,
      'memberId': member.id,
      'memberName': member.name,
      'memberPhone': member.phone,
      'userId': userId,
      'active': true,
      'checkInTime': FieldValue.serverTimestamp(),
      'checkOutTime': null,
      'doeSeen': null,
      'buckSeen': null,
      'fawnSeen': null,
      'riverVicksburgFt': riverVicksburgFt,
      'riverGreenvilleFt': riverGreenvilleFt,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /// Closes an active hunt: records checkout time and (for deer hunts) counts.
  Future<void> checkOut(
    String huntId, {
    int? doe,
    int? buck,
    int? fawn,
  }) {
    return _hunts.doc(huntId).update({
      'active': false,
      'checkOutTime': FieldValue.serverTimestamp(),
      'doeSeen': doe,
      'buckSeen': buck,
      'fawnSeen': fawn,
    });
  }

  Stream<List<Hunt>> streamActiveHunts() {
    return _hunts.where('active', isEqualTo: true).snapshots().map(
          (snap) => snap.docs.map(Hunt.fromDoc).toList(),
        );
  }

  /// Recent completed hunts, newest first, for the hunt log. Ordered by a
  /// single field then filtered client-side so no composite index is needed.
  Stream<List<Hunt>> streamRecentHunts({int limit = 200}) {
    return _hunts
        .orderBy('checkInTime', descending: true)
        .limit(limit)
        .snapshots()
        .map((snap) =>
            snap.docs.map(Hunt.fromDoc).where((h) => !h.active).toList());
  }

  Stream<Hunt?> streamMyActiveHunt(String userId) {
    return _hunts
        .where('userId', isEqualTo: userId)
        .where('active', isEqualTo: true)
        .limit(1)
        .snapshots()
        .map((snap) => snap.docs.isEmpty ? null : Hunt.fromDoc(snap.docs.first));
  }

  // --- Stand pin positions (shared) ------------------------------------------

  Stream<Map<String, Offset>> streamStandPositions() {
    return _positions.snapshots().map((snap) {
      final out = <String, Offset>{};
      for (final doc in snap.docs) {
        final data = doc.data();
        final x = (data['x'] as num?)?.toDouble();
        final y = (data['y'] as num?)?.toDouble();
        if (x != null && y != null) out[doc.id] = Offset(x, y);
      }
      return out;
    });
  }

  Future<void> setStandPosition(String code, double x, double y) {
    return _positions.doc(code).set({'x': x, 'y': y});
  }

  Future<void> clearStandPosition(String code) => _positions.doc(code).delete();
}
