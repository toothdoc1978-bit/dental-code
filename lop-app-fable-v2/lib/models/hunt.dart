import 'package:cloud_firestore/cloud_firestore.dart';

/// A single hunt record: one document in the `hunts` collection.
///
/// Created at check-in (records exact time via [checkInTime] plus the
/// Mississippi River stage at Vicksburg & Greenville) and closed at check-out
/// (deer counts for deer-hunting methods). Member name + phone are denormalized
/// so any member can see who's hunting — and text them — without a join.
class Hunt {
  final String id;
  final String standCode;

  /// WHAT (Deer/Duck/Squirrel/Hog/Turkey/Scouting/Camera Service/Other) and
  /// HOW (Rifle/Suppressed Rifle/Primitive Firearm/Shotgun/Bow/Crossbow/None)
  /// — kept as two fields, not one, so the app can enforce bow-only areas,
  /// the squirrel exception, and the high-water archery rule precisely
  /// instead of guessing from a mixed string. See `data/hunt_types.dart`.
  final String activity;
  final String method;
  final String memberId;
  final String memberName;
  final String memberPhone;
  final String userId;
  final bool active;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;

  /// Deer seen, recorded at check-out for deer-hunting methods. Null otherwise.
  final int? doeSeen;
  final int? buckSeen;
  final int? fawnSeen;

  /// Mississippi River stage (ft) at check-in time, from the shared cache
  /// (not a live read — check-in never blocks on network). Null if the cache
  /// hadn't loaded yet.
  final double? riverVicksburgFt;
  final double? riverGreenvilleFt;

  /// When the river reading above was actually observed (the cache's
  /// timestamp, not check-in time) — lets the UI say "as of 47 min before
  /// check-in" instead of implying a live-exact read.
  final DateTime? riverObservedAt;

  /// True when the hunt was ended by the 8 PM sweep (or an admin clear)
  /// instead of the hunter checking out.
  final bool autoClosed;

  /// "Yellow Tag" — the hunter plans to be in this stand all day. Club
  /// etiquette: don't drive past a yellow-tag stand unnecessarily,
  /// especially 9 AM–3 PM. Purely informational (no GPS/road data exists in
  /// this app to enforce it) — this just makes it easy to see who's out.
  final bool allDay;

  /// Guest name(s) the sponsoring member brought (free text, no accounts —
  /// guest harvests already count toward the member per club rules).
  final List<String> guestNames;

  /// Optional: another checked-in-or-roster member acting as the responsible
  /// adult for a youth/guest hunter, for whereabouts/safety visibility only.
  /// NOT a hunter-safety certification or legal/compliance record — there's
  /// no age field on Member, so this can't be enforced as actually-an-adult.
  final String? responsibleAdultMemberId;
  final String? responsibleAdultName;

  const Hunt({
    required this.id,
    required this.standCode,
    required this.activity,
    required this.method,
    required this.memberId,
    required this.memberName,
    required this.memberPhone,
    required this.userId,
    required this.active,
    this.checkInTime,
    this.checkOutTime,
    this.doeSeen,
    this.buckSeen,
    this.fawnSeen,
    this.riverVicksburgFt,
    this.riverGreenvilleFt,
    this.riverObservedAt,
    this.autoClosed = false,
    this.allDay = false,
    this.guestNames = const [],
    this.responsibleAdultMemberId,
    this.responsibleAdultName,
  });

  String get memberFirstName =>
      memberName.isEmpty ? 'Someone' : memberName.split(' ').first;

  factory Hunt.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return Hunt(
      id: doc.id,
      standCode: data['standCode'] as String? ?? '',
      // Clean-cutover default: any leftover pre-migration test doc without
      // activity/method renders as "Other"/"None" instead of crashing.
      activity: data['activity'] as String? ?? 'Other',
      method: data['method'] as String? ?? 'None',
      memberId: data['memberId'] as String? ?? '',
      memberName: data['memberName'] as String? ?? '',
      memberPhone: data['memberPhone'] as String? ?? '',
      userId: data['userId'] as String? ?? '',
      active: data['active'] as bool? ?? false,
      checkInTime: (data['checkInTime'] as Timestamp?)?.toDate(),
      checkOutTime: (data['checkOutTime'] as Timestamp?)?.toDate(),
      doeSeen: (data['doeSeen'] as num?)?.toInt(),
      buckSeen: (data['buckSeen'] as num?)?.toInt(),
      fawnSeen: (data['fawnSeen'] as num?)?.toInt(),
      riverVicksburgFt: (data['riverVicksburgFt'] as num?)?.toDouble(),
      riverGreenvilleFt: (data['riverGreenvilleFt'] as num?)?.toDouble(),
      riverObservedAt: (data['riverObservedAt'] as Timestamp?)?.toDate(),
      autoClosed: data['autoClosed'] as bool? ?? false,
      allDay: data['allDay'] as bool? ?? false,
      guestNames: (data['guestNames'] as List?)?.cast<String>() ?? const [],
      responsibleAdultMemberId: data['responsibleAdultMemberId'] as String?,
      responsibleAdultName: data['responsibleAdultName'] as String?,
    );
  }
}
