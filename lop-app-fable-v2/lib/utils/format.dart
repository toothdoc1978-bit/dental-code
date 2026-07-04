// Small shared formatting helpers.

/// "5:42 AM" style clock, local time. Empty string if [dt] is null.
String fmtClock(DateTime? dt) {
  if (dt == null) return '';
  final l = dt.toLocal();
  var h = l.hour % 12;
  if (h == 0) h = 12;
  final m = l.minute.toString().padLeft(2, '0');
  return '$h:$m ${l.hour >= 12 ? 'PM' : 'AM'}';
}

/// "2h 15m" elapsed since [since]. Empty string if null.
String fmtElapsed(DateTime? since) {
  if (since == null) return '';
  final d = DateTime.now().difference(since.toLocal());
  if (d.inMinutes < 1) return 'just now';
  if (d.inMinutes < 60) return '${d.inMinutes}m';
  return '${d.inHours}h ${d.inMinutes % 60}m';
}

/// "3h 28m" for a known duration. "0m" floor so short hunts still read.
String fmtDuration(Duration d) {
  if (d.inMinutes < 60) return '${d.inMinutes}m';
  return '${d.inHours}h ${d.inMinutes % 60}m';
}

const List<String> _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const List<String> _weekdays = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
];

/// "Fri, Jul 4" style date, local time.
String fmtDate(DateTime dt) {
  final l = dt.toLocal();
  return '${_weekdays[l.weekday - 1]}, ${_months[l.month - 1]} ${l.day}';
}

const List<String> _dirs = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/// Compass degrees -> 16-point cardinal ("NNE").
String cardinal(double deg) {
  final idx = (((deg % 360) + 360) % 360 / 22.5).round() % 16;
  return _dirs[idx];
}
