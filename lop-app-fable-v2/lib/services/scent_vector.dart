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

/// Strongest thermal drift on the property, in mph-equivalent. Flat delta
/// ground caps out well below the ~4 mph a steep slope can generate, but 4
/// keeps thermals decisive against light breezes, matching field experience.
const double _maxThermalMph = 4.0;

/// How much the thermal engine contributes at [windMph]: full effect at or
/// below 4 mph, blown out entirely at or above 10 mph, linear in between.
/// (Replaces the old hard 5 mph cliff so the cone swings smoothly as the
/// breeze builds instead of snapping between regimes.)
double thermalWeight(double windMph) {
  if (windMph <= 4) return 1.0;
  if (windMph >= 10) return 0.0;
  return 1.0 - (windMph - 4) / 6.0;
}

/// Predicts where a hunter's scent drifts for the given hour.
///
/// Hunting physics:
///  1. Wind is reported as the direction it comes FROM; scent travels the
///     opposite way (+180°).
///  2. Thermals ride the temperature trend: cooling air sinks and drains
///     toward [drainageHeading] (the river); warming air lifts and disperses
///     the other way; no trend, no thermal.
///  3. The ambient wind (at its real mph) and the thermal (up to
///     [_maxThermalMph], tapered by [thermalWeight]) are summed as vectors —
///     so a 4 mph breeze bends the cone far more than a 1 mph breath, and by
///     10 mph the true wind owns the cone outright.
///  4. Shape follows the mix: wind-driven cones are long and narrow; sinking
///     evening air stays long and narrow toward the drainage; rising morning
///     air is short and wide (dispersion); slack air is medium and wide.
ScentVector calculateScentVector(HourlyWeather h, {double drainageHeading = 90}) {
  final baseScent = (h.windDirDeg + 180) % 360;
  final w = thermalWeight(h.windMph);

  // Thermal component (none in slack air).
  final cooling = h.tempDelta < 0;
  final warming = h.tempDelta > 0;
  final thermalDir = cooling
      ? drainageHeading
      : warming
          ? (drainageHeading + 180) % 360
          : baseScent; // slack: direction irrelevant at 0 strength
  final thermalMph = (cooling || warming) ? _maxThermalMph * w : 0.0;

  // Speed-weighted vector sum of the two movement (TO-direction) vectors.
  final angle = _blendHeadings(baseScent, h.windMph, thermalDir, thermalMph);

  // Shape: interpolate between the pure-wind cone and the thermal-regime cone
  // by how much say the thermals actually have.
  final windLength =
      math.min(_long * (1 + math.max(0, h.windMph - 5) / 15), _long * 2);
  const windWidth = 13.0;
  final (thermalLength, thermalWidth) = cooling
      ? (_long, 15.0) // sinking: long, narrow drain toward the river
      : warming
          ? (_short, 45.0) // rising: short, wide dispersion
          : (_med, 35.0); // slack air

  return ScentVector(
    angle: angle,
    length: _lerp(windLength, thermalLength, w),
    widthDeg: _lerp(windWidth, thermalWidth, w),
  );
}

double _lerp(double a, double b, double t) => a + (b - a) * t;

/// Vector-adds two compass headings with weights and returns the resultant
/// heading (0–360, clockwise from north). Uses north-up unit vectors
/// (east = sin, north = cos) so [math.atan2](east, north) gives a compass
/// heading. If both weights are ~0, falls back to [a].
double _blendHeadings(double a, double wa, double b, double wb) {
  final ar = a * math.pi / 180;
  final br = b * math.pi / 180;
  final east = wa * math.sin(ar) + wb * math.sin(br);
  final north = wa * math.cos(ar) + wb * math.cos(br);
  if (east.abs() < 1e-9 && north.abs() < 1e-9) return a;
  final deg = math.atan2(east, north) * 180 / math.pi;
  return (deg % 360 + 360) % 360;
}
