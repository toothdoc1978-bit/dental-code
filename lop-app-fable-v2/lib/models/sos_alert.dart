import 'package:cloud_firestore/cloud_firestore.dart';

/// The situations a member can flag. Must stay in sync BY HAND with the `sos`
/// create rule in firestore.rules (same caveat as kActivities/kMethods).
const List<String> kSosTypes = [
  'Stuck in the mud',
  'Injured',
  'Vehicle trouble',
  'Other',
];

/// One SOS request: a member needs help on the property. NOT a 911
/// replacement — the send screen leads with a Call 911 button and says so.
/// The in-app alert reaches whoever has the app open; the group-text fallback
/// reaches Board members over SMS (which often works on one bar of signal
/// where app data won't).
class SosAlert {
  final String id;
  final String memberId;
  final String memberName;
  final String memberPhone;
  final String type;
  final String note;

  /// GPS fix at send time. Null if the fix failed or was denied — the SOS
  /// still goes out (never block a call for help on a GPS timeout).
  final double? lat;
  final double? lng;
  final double? accuracyM;

  final bool active;
  final DateTime? createdAt;
  final DateTime? resolvedAt;

  const SosAlert({
    required this.id,
    required this.memberId,
    required this.memberName,
    required this.memberPhone,
    required this.type,
    this.note = '',
    this.lat,
    this.lng,
    this.accuracyM,
    this.active = true,
    this.createdAt,
    this.resolvedAt,
  });

  String get memberFirstName =>
      memberName.isEmpty ? 'Someone' : memberName.split(' ').first;

  bool get hasLocation => lat != null && lng != null;

  /// Tap-to-navigate link. Apple Maps URLs open natively on iOS and redirect
  /// to a working map elsewhere — the club is all-iPhone-leaning but this
  /// degrades fine on Android/desktop.
  String? get mapsUrl => hasLocation
      ? 'https://maps.apple.com/?ll=$lat,$lng&q=SOS'
      : null;

  /// Body for the prefilled group text to the Board.
  String get smsBody {
    final where = hasLocation
        ? 'My location: $mapsUrl'
        : 'GPS unavailable — last known: check the app for my stand.';
    final extra = note.isEmpty ? '' : ' $note.';
    return 'SOS from $memberName — $type.$extra $where';
  }

  /// The group-text URI. Built by hand because Dart's `Uri(queryParameters:)`
  /// form-encodes spaces as `+`, which iOS Messages does NOT decode — the
  /// prefilled body would arrive as `SOS+from+Chad+...`. `encodeComponent`
  /// uses `%20`, which Messages handles.
  static Uri smsUri(List<String> numbers, String body) =>
      Uri.parse('sms:${numbers.join(',')}?body=${Uri.encodeComponent(body)}');

  factory SosAlert.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return SosAlert(
      id: doc.id,
      memberId: data['memberId'] as String? ?? '',
      memberName: data['memberName'] as String? ?? '',
      memberPhone: data['memberPhone'] as String? ?? '',
      type: data['type'] as String? ?? 'Other',
      note: data['note'] as String? ?? '',
      lat: (data['lat'] as num?)?.toDouble(),
      lng: (data['lng'] as num?)?.toDouble(),
      accuracyM: (data['accuracyM'] as num?)?.toDouble(),
      active: data['active'] as bool? ?? false,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      resolvedAt: (data['resolvedAt'] as Timestamp?)?.toDate(),
    );
  }
}
