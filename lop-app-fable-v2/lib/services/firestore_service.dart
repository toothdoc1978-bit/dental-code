import 'dart:ui' show Offset;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../config.dart';
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

/// Thrown when a member who already has an active hunt (possibly started on
/// another device) tries to check in somewhere else.
class AlreadyCheckedInException implements Exception {
  final String standCode;
  AlreadyCheckedInException(this.standCode);
  @override
  String toString() =>
      "You're already checked in at Stand $standCode. Check out there first.";
}

/// All Firestore reads/writes live here.
///
/// `hunts` — one doc per check-in: standCode/activity/method/member* strings,
/// userId, active, checkInTime/checkOutTime, doeSeen/buckSeen/fawnSeen (deer
/// hunts), riverVicksburgFt/riverGreenvilleFt/riverObservedAt (cached river
/// reading at check-in), allDay, guestNames, responsibleAdult*.
/// `standPositions` — doc id == stand code, x/y fractions of the map image.
class FirestoreService {
  FirestoreService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _hunts =>
      _db.collection('hunts');
  CollectionReference<Map<String, dynamic>> get _positions =>
      _db.collection('standPositions');

  /// Checks [member] into [stand] for [activity]/[method], recording the
  /// exact time plus whatever Mississippi River reading was already cached
  /// client-side (never fetched live here — check-in must never block on
  /// network).
  Future<String> checkIn({
    required Stand stand,
    required String activity,
    required String method,
    required Member member,
    required String userId,
    double? riverVicksburgFt,
    double? riverGreenvilleFt,
    DateTime? riverObservedAt,
    bool allDay = false,
    List<String> guestNames = const [],
    Member? responsibleAdult,
  }) async {
    // One hunt per member, no matter which device started it.
    final mine = await _hunts
        .where('memberId', isEqualTo: member.id)
        .where('active', isEqualTo: true)
        .limit(1)
        .get();
    if (mine.docs.isNotEmpty) {
      throw AlreadyCheckedInException(Hunt.fromDoc(mine.docs.first).standCode);
    }

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
      'activity': activity,
      'method': method,
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
      'riverObservedAt':
          riverObservedAt == null ? null : Timestamp.fromDate(riverObservedAt),
      'allDay': allDay,
      'guestNames': guestNames,
      'responsibleAdultMemberId': responsibleAdult?.id,
      'responsibleAdultName': responsibleAdult?.name,
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

  /// The member's active hunt from ANY device — ownership is keyed to the
  /// chosen member identity, not the device's anonymous auth id.
  Stream<Hunt?> streamMyActiveHunt(String memberId) {
    return _hunts
        .where('memberId', isEqualTo: memberId)
        .where('active', isEqualTo: true)
        .limit(1)
        .snapshots()
        .map((snap) => snap.docs.isEmpty ? null : Hunt.fromDoc(snap.docs.first));
  }

  // --- 8 PM daily auto-checkout ----------------------------------------------

  /// Whether an active hunt should be swept: true once [now] is past the most
  /// recent [hour]:00 AND the hunt started before that cutoff. A hunt begun
  /// AFTER 8 PM survives until the next evening's sweep.
  static bool shouldAutoClose(DateTime checkInTime, DateTime now,
      {int hour = kAutoCheckoutHour}) {
    var cutoff = DateTime(now.year, now.month, now.day, hour);
    if (now.isBefore(cutoff)) cutoff = cutoff.subtract(const Duration(days: 1));
    return checkInTime.isBefore(cutoff);
  }

  /// Closes every active hunt that's past the 8 PM cutoff ([force] closes all
  /// of them — the admin "clear the board" action). Deer counts stay null —
  /// forfeited by not checking out. Returns how many hunts were closed;
  /// failures are swallowed (the next device to run will retry).
  Future<int> autoCheckoutSweep({bool force = false, DateTime? now}) async {
    try {
      final snap = await _hunts.where('active', isEqualTo: true).get();
      final n = now ?? DateTime.now();
      var closed = 0;
      for (final doc in snap.docs) {
        final ci = (doc.data()['checkInTime'] as Timestamp?)?.toDate();
        if (force || (ci != null && shouldAutoClose(ci, n))) {
          await doc.reference.update({
            'active': false,
            'checkOutTime': FieldValue.serverTimestamp(),
            'autoClosed': true,
          });
          closed++;
        }
      }
      return closed;
    } catch (_) {
      return 0;
    }
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

}
