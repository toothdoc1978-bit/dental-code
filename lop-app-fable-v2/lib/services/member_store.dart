import 'package:shared_preferences/shared_preferences.dart';
import '../models/member.dart';

/// Persists "who am I" on the device, so a member identifies themselves once
/// (first launch) and is remembered after that.
class MemberStore {
  static const _kId = 'member_id';
  static const _kName = 'member_name';
  static const _kPhone = 'member_phone';

  static Future<Member?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString(_kId);
    if (id == null) return null;
    return Member(
      id: id,
      name: prefs.getString(_kName) ?? '',
      phone: prefs.getString(_kPhone) ?? '',
    );
  }

  static Future<void> save(Member member) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kId, member.id);
    await prefs.setString(_kName, member.name);
    await prefs.setString(_kPhone, member.phone);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kId);
    await prefs.remove(_kName);
    await prefs.remove(_kPhone);
  }
}
