import 'dart:math' as math;
import '../models/forecast.dart';

/// The result of the scent-drift calculation for one hour.
///
///  * [angle]    — compass heading (0–360, clockwise from N) the scent travels TO.
///  * [length]   — cone length in logical pixels at the map's base scale.
///  * [widthDeg] — cone half-angle (spread) in degrees.
class ScentVector {
  final double angle;
  final double length;
  final double widthDeg;
  const ScentVector({
    required this.angle,
    required this.length,
    required this.widthDeg,
  });
}

// Cone size presets (logical px / degrees).
const double _long = 150;
const double _med = 95;
const double _short = 60;

/// Predicts where a hunter's scent drifts for the given hour.
///
/// Hunting physics (in order):
///  1. Wind is reported as the direction it comes FROM; scent travels the
///     opposite way, so we add 180°.
///  2. Wind dominance (> 5 mph): true wind wins — long, narrow cone straight
///     down the wind-to direction.
///  3. Evening thermals (calm + cooling): heavy air sinks and drains to low
///     ground; bias the vector heavily toward [drainageHeading]. Long, narrow.
///  4. Morning thermals (calm + warming): air lifts and disperses away from the
///     drainage; short, wide cone.
///  5. Slack air (calm, no temp change): follow the base scent, medium + wide.
ScentVector calculateScentVector(HourlyWeather h, {double drainageHeading = 90}) {
  final baseScent = (h.windDirDeg + 180) % 360;

  // 2 — wind dominance
  if (h.windMph > 5) {
    final length = math.min(_long * (1 + (h.windMph - 5) / 15), _long * 2);
    return ScentVector(angle: baseScent, length: length, widthDeg: 13);
  }

  // 3 — evening thermals (sinking → toward drainage)
  if (h.tempDelta < 0) {
    final angle = _blendHeadings(baseScent, 0.25, drainageHeading, 0.75);
    return ScentVector(angle: angle, length: _long, widthDeg: 15);
  }

  // 4 — morning thermals (rising → away from drainage, disperses)
  if (h.tempDelta > 0) {
    final anti = (drainageHeading + 180) % 360;
    final angle = _blendHeadings(baseScent, 0.25, anti, 0.75);
    return ScentVector(angle: angle, length: _short, widthDeg: 45);
  }

  // 5 — slack air
  return ScentVector(angle: baseScent, length: _med, widthDeg: 35);
}

/// Vector-adds two compass headings with weights and returns the resultant
/// heading (0–360, clockwise from north). Uses north-up unit vectors
/// (east = sin, north = cos) so [math.atan2](east, north) gives a compass heading.
double _blendHeadings(double a, double wa, double b, double wb) {
  final ar = a * math.pi / 180;
  final br = b * math.pi / 180;
  final east = wa * math.sin(ar) + wb * math.sin(br);
  final north = wa * math.cos(ar) + wb * math.cos(br);
  final deg = math.atan2(east, north) * 180 / math.pi;
  return (deg % 360 + 360) % 360;
}
