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
  final String huntType;
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

  /// Mississippi River stage (ft) at check-in time. Null if offline.
  final double? riverVicksburgFt;
  final double? riverGreenvilleFt;

  const Hunt({
    required this.id,
    required this.standCode,
    required this.huntType,
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
  });

  String get memberFirstName =>
      memberName.isEmpty ? 'Someone' : memberName.split(' ').first;

  factory Hunt.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return Hunt(
      id: doc.id,
      standCode: data['standCode'] as String? ?? '',
      huntType: data['huntType'] as String? ?? '',
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
    );
  }
}
