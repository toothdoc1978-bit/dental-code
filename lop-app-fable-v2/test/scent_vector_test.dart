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

  test('blowout ramp: thermals fade linearly between 4 and 10 mph', () {
    expect(thermalWeight(3), 1.0);
    expect(thermalWeight(4), 1.0);
    expect(thermalWeight(7), closeTo(0.5, 0.001));
    expect(thermalWeight(10), 0.0);
    expect(thermalWeight(14), 0.0);
  });

  test('above 10 mph, cooling no longer bends the cone at all', () {
    final v = calculateScentVector(_hw(wind: 12, dir: 0, delta: -3));
    expect(v.angle, closeTo(180, 0.5)); // pure downwind despite the temp drop
    expect(v.widthDeg, closeTo(13, 0.5));
  });

  test('mid-range breeze: cone mostly downwind, nudged toward the river', () {
    // 7 mph from N (base scent 180), cooling. Thermal weight 0.5 -> 2 mph
    // pull toward 90 vs 7 mph toward 180: a modest eastward bend.
    final v = calculateScentVector(_hw(wind: 7, dir: 0, delta: -2));
    expect(v.angle, greaterThan(150));
    expect(v.angle, lessThan(180));
  });

  test('a 4 mph breeze bends the cone more than a 1 mph breath', () {
    // Same cooling thermal toward 90; ambient toward 180.
    final light = calculateScentVector(_hw(wind: 1, dir: 0, delta: -2));
    final fresh = calculateScentVector(_hw(wind: 4, dir: 0, delta: -2));
    // Stronger ambient wind drags the resultant closer to 180 (downwind).
    expect(fresh.angle, greaterThan(light.angle));
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
