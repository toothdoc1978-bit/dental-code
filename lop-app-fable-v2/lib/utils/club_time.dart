// The property is in East Carroll Parish, LA — US Central Time. Anything that
// implements a CLUB rule tied to a wall-clock hour (the 8 PM auto-checkout)
// must use the CLUB's clock, not the device's: one member leaving the app
// open in another timezone (or with a wrong clock date) would otherwise sweep
// the whole shared board at the wrong moment for everyone.
//
// No timezone package: US Central is UTC-6, or UTC-5 during DST (second
// Sunday of March 2:00 → first Sunday of November 2:00). That rule has been
// fixed in US law since 2007; if Congress ever changes it, update here.

/// [any] (any zone) as the club's wall-clock time. The result is a shifted
/// UTC-flagged DateTime — compare/do calendar math on it, but don't feed it
/// back into APIs expecting a real instant (use [clubWallToUtc] for that).
DateTime clubTime(DateTime any) {
  final utc = any.toUtc();
  return utc.subtract(Duration(hours: _isCentralDst(utc) ? 5 : 6));
}

/// The real UTC instant for a club wall-clock time built with DateTime.utc().
/// During the one repeated hour of fall-back the earlier (CDT) reading wins —
/// immaterial for an 8 PM cutoff.
DateTime clubWallToUtc(DateTime wall) {
  final cdt = wall.add(const Duration(hours: 5));
  if (_isCentralDst(cdt)) return cdt;
  return wall.add(const Duration(hours: 6));
}

/// Whether US Central DST (CDT, UTC-5) is in effect at UTC instant [utc]:
/// 2:00 CST second Sunday of March (08:00 UTC) until 2:00 CDT first Sunday
/// of November (07:00 UTC).
bool _isCentralDst(DateTime utc) {
  final start = _nthSundayUtc(utc.year, 3, 2).add(const Duration(hours: 8));
  final end = _nthSundayUtc(utc.year, 11, 1).add(const Duration(hours: 7));
  return !utc.isBefore(start) && utc.isBefore(end);
}

DateTime _nthSundayUtc(int year, int month, int n) {
  final first = DateTime.utc(year, month, 1);
  final firstSunday = first.add(Duration(days: (7 - first.weekday) % 7));
  return firstSunday.add(Duration(days: 7 * (n - 1)));
}
