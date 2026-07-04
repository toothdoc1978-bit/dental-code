import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/forecast.dart';

HourlyWeather _hour(DateTime t) => HourlyWeather(
    time: t, tempF: 70, windMph: 5, windDirDeg: 0, tempDelta: 0);

void main() {
  group('Forecast.indexForNow', () {
    final base = DateTime(2026, 7, 4, 6); // hours 6 AM .. 5 AM next day
    final forecast = Forecast(
      fetchedAt: base,
      hours: [for (var i = 0; i < 24; i++) _hour(base.add(Duration(hours: i)))],
    );

    test('now inside the window picks the containing hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 6, 10)), 0);
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 8, 59)), 2);
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 17, 30)), 11);
    });

    test('now before the window falls back to the first hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 3)), 0);
    });

    test('now after the window clamps to the last hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 6)), 23);
    });

    test('empty hours falls back to 0', () {
      final empty = Forecast(fetchedAt: DateTime(2026), hours: const []);
      expect(empty.indexForNow(now: DateTime(2026, 7, 4)), 0);
    });
  });
}
