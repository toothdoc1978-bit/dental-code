import 'package:shared_preferences/shared_preferences.dart';

/// Remembers (on this device) which auto-closed hunt the member has already
/// dismissed the "you forgot to check out" notice for.
class AckStore {
  static const _key = 'ackedAutoClosedHuntId';

  static Future<String?> lastAcked() async =>
      (await SharedPreferences.getInstance()).getString(_key);

  static Future<void> ack(String huntId) async =>
      (await SharedPreferences.getInstance()).setString(_key, huntId);
}
