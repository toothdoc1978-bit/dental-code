import 'dart:async';
import 'dart:ui' show Offset;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../config.dart';
import '../models/hunt.dart';
import '../models/member.dart';
import '../models/sos_alert.dart';
import '../models/stand.dart';
import '../utils/club_time.dart';

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
  ///
  /// Returns the new hunt's [id] immediately plus an [ack] future that
  /// completes on SERVER confirmation. Callers must NOT block success
  /// feedback on [ack] — offline it stays pending until signal returns while
  /// the write is safely queued. Race it with a short timeout instead.
  Future<({String id, Future<void> ack})> checkIn({
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
    // Guard queries are best-effort and time-bounded: offline (or with an
    // empty cache) they must degrade to the documented accepted race, never
    // block the check-in itself. get() falls back to cache when offline; if
    // even that fails or stalls, skip the guard.
    try {
      // One hunt per member, no matter which device started it.
      final mine = await _hunts
          .where('memberId', isEqualTo: member.id)
          .where('active', isEqualTo: true)
          .limit(1)
          .get()
          .timeout(const Duration(seconds: 4));
      if (mine.docs.isNotEmpty) {
        throw AlreadyCheckedInException(
            Hunt.fromDoc(mine.docs.first).standCode);
      }
    } on AlreadyCheckedInException {
      rethrow;
    } catch (_) {/* offline/no cache — accepted race */}

    try {
      final existing = await _hunts
          .where('standCode', isEqualTo: stand.code)
          .where('active', isEqualTo: true)
          .limit(1)
          .get()
          .timeout(const Duration(seconds: 4));
      if (existing.docs.isNotEmpty) {
        throw StandOccupiedException(stand.code);
      }
    } on StandOccupiedException {
      rethrow;
    } catch (_) {/* offline/no cache — accepted race */}

    final ref = _hunts.doc();
    final ack = ref.set({
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
    return (id: ref.id, ack: ack);
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

  /// Records deer counts on a hunt the 8 PM sweep already closed — the
  /// "I was still on the stand at 8" case. Rules allow this exactly once
  /// (only while the swept hunt's counts are still null).
  Future<void> backfillDeerCounts(
    String huntId, {
    required int doe,
    required int buck,
    required int fawn,
  }) {
    return _hunts.doc(huntId).update({
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
  /// NOTE: capped — season "totals" computed from this are totals over the
  /// most recent [limit] hunts; the summary card says so once near the cap.
  Stream<List<Hunt>> streamRecentHunts({int limit = 500}) {
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
  /// recent [hour]:00 **on the CLUB's clock** (US Central — see club_time.dart;
  /// a member's device in another timezone must not sweep the shared board at
  /// the wrong hour) AND the hunt started before that cutoff. A hunt begun
  /// after 8 PM survives until the next evening's sweep.
  static bool shouldAutoClose(DateTime checkInTime, DateTime now,
      {int hour = kAutoCheckoutHour}) {
    return clubTime(checkInTime).isBefore(_cutoffWall(now, hour));
  }

  /// The most recent [hour]:00 club-wall-time at or before [now], as a
  /// shifted club-wall DateTime (see club_time.dart).
  static DateTime _cutoffWall(DateTime now, int hour) {
    final nowClub = clubTime(now);
    var cutoff = DateTime.utc(nowClub.year, nowClub.month, nowClub.day, hour);
    if (nowClub.isBefore(cutoff)) cutoff = cutoff.subtract(const Duration(days: 1));
    return cutoff;
  }

  /// Closes every active hunt that's past the 8 PM cutoff ([force] closes all
  /// of them — the admin "clear the board" action). Deer counts stay null —
  /// forfeited by not checking out (a hunter who was still out can backfill
  /// them via [backfillDeerCounts]). Returns how many hunts were closed.
  Future<int> autoCheckoutSweep({bool force = false, DateTime? now}) async {
    final QuerySnapshot<Map<String, dynamic>> snap;
    try {
      snap = await _hunts.where('active', isEqualTo: true).get();
    } catch (_) {
      return 0; // offline — the next device to run will sweep
    }
    final n = now ?? DateTime.now();
    // Swept hunts get checkOutTime = the cutoff itself, not "whenever a
    // device finally ran the sweep" (often the next morning, since browser
    // timers freeze when phones are pocketed) — keeps logged durations honest.
    final cutoffUtc = clubWallToUtc(_cutoffWall(n, kAutoCheckoutHour));
    var closed = 0;
    for (final doc in snap.docs) {
      // Per-doc guard: one bad doc (or a race with another device's sweep)
      // must not abandon the rest of the run.
      try {
        final ci = (doc.data()['checkInTime'] as Timestamp?)?.toDate();
        if (force || (ci != null && shouldAutoClose(ci, n))) {
          await doc.reference.update({
            'active': false,
            'checkOutTime': force
                ? FieldValue.serverTimestamp()
                : Timestamp.fromDate(cutoffUtc),
            'autoClosed': true,
          });
          closed++;
        }
      } catch (_) {/* next sweep retries this one */}
    }
    return closed;
  }

  // --- SOS ---------------------------------------------------------------------

  CollectionReference<Map<String, dynamic>> get _sos => _db.collection('sos');

  /// Writes an SOS request. Returns the doc [id] IMMEDIATELY — the write is
  /// never awaited here, because with no signal a Firestore future stays
  /// pending until the server acks and an SOS must never wait on that. [ack]
  /// resolves/errors when the server eventually confirms; callers may listen
  /// but must not gate anything urgent on it.
  ({String id, Future<void> ack}) sendSos({
    required Member member,
    required String type,
    String note = '',
    double? lat,
    double? lng,
    double? accuracyM,
  }) {
    final ref = _sos.doc();
    final ack = ref.set({
      'memberId': member.id,
      'memberName': member.name,
      'memberPhone': member.phone,
      'type': type,
      'note': note,
      'lat': lat,
      'lng': lng,
      'accuracyM': accuracyM,
      'active': true,
      'createdAt': FieldValue.serverTimestamp(),
      'resolvedAt': null,
    });
    return (id: ref.id, ack: ack);
  }

  /// Marks an SOS handled. Anyone may resolve — the sender may be unable to.
  Future<void> resolveSos(String id) {
    return _sos.doc(id).update({
      'active': false,
      'resolvedAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<List<SosAlert>> streamActiveSos() {
    return _sos.where('active', isEqualTo: true).snapshots().map(
          (snap) => snap.docs.map(SosAlert.fromDoc).toList(),
        );
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
