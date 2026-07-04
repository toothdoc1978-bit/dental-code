import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/services/scent_vector.dart';

HourlyWeather _hw({
  required double wind,
  required double dir,
  required double delta,
}) =>
    HourlyWeather(
      time: DateTime(2026, 1, 1, 12),
      tempF: 50,
      windMph: wind,
      windDirDeg: dir,
      tempDelta: delta,
    );

void main() {
  test('wind dominance: N wind reverses to due south, long & narrow', () {
    final v = calculateScentVector(_hw(wind: 10, dir: 0, delta: 0));
    expect(v.angle, closeTo(180, 0.5));
    expect(v.widthDeg, lessThan(20));
    expect(v.length, greaterThanOrEqualTo(150));
  });

  test('180 reversal: NE (45) wind blows scent SW (225)', () {
    final v = calculateScentVector(_hw(wind: 8, dir: 45, delta: 0));
    expect(v.angle, closeTo(225, 0.5));
  });

  test('evening sinking: calm + cooling pulls heavily toward drainage (90 E)',
      () {
    final v = calculateScentVector(_hw(wind: 2, dir: 0, delta: -2)); // base 180
    expect(v.angle, greaterThan(90));
    expect(v.angle, lessThan(135)); // ~108, biased toward 90
    expect(v.length, greaterThanOrEqualTo(150));
    expect(v.widthDeg, lessThan(20));
  });

  test('morning rising: calm + warming drifts away from drainage, short & wide',
      () {
    final v = calculateScentVector(_hw(wind: 2, dir: 0, delta: 2)); // anti=270
    expect(v.angle, greaterThan(180));
    expect(v.angle, lessThan(270)); // ~252, toward 270
    expect(v.length, lessThanOrEqualTo(80));
    expect(v.widthDeg, greaterThan(35));
  });

  test('slack air: calm + no temp change follows base scent', () {
    final v = calculateScentVector(_hw(wind: 1, dir: 0, delta: 0));
    expect(v.angle, closeTo(180, 0.5));
    expect(v.length, closeTo(95, 0.5));
  });

  test('custom drainage heading is respected', () {
    final v = calculateScentVector(
      _hw(wind: 2, dir: 0, delta: -2),
      drainageHeading: 270,
    );
    expect(v.angle, greaterThan(180));
    expect(v.angle, lessThan(270)); // pulled toward 270 instead of 90
  });
}
