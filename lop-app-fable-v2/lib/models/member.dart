/// A club member (or a member's family/proxy who also hunts). The roster is a
/// static list (see `data/members.dart`); each carries a phone so others can
/// text them, plus optional [role] and [shares] for display.
class Member {
  final String id;
  final String name;

  /// Display phone, e.g. "318-555-0101". Use [digits] for tel/sms URIs.
  final String phone;

  /// e.g. "Member", "Board", "Son", "Proxy". Optional.
  final String role;

  /// Share(s) held in the undivided interest, e.g. "12" or "3,4". Optional.
  final String shares;

  const Member({
    required this.id,
    required this.name,
    required this.phone,
    this.role = '',
    this.shares = '',
  });

  String get firstName => name.split(' ').first;

  /// Phone reduced to digits only, for building `sms:`/`tel:` URIs.
  String get digits => phone.replaceAll(RegExp(r'[^0-9]'), '');
}
