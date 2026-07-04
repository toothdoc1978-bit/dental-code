import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';

import '../services/scent_vector.dart';

/// Draws a single scent cone whose tip is anchored at [tip] (pixel coordinates
/// in the map's transformed space) and which points in the [ScentVector.angle]
/// compass heading, fading from semi-opaque at the tip to transparent at the
/// wide end.
///
/// This is the Flutter equivalent of an SVG `<polygon>` with `transform-origin`
/// at the tip plus `transform="rotate(angle, cx, cy)"`: we translate the canvas
/// origin to the tip, then rotate, then draw an up-pointing cone.
class ScentConePainter extends CustomPainter {
  final Offset tip;
  final ScentVector vector;
  final double northOffset;
  final Color color;

  ScentConePainter({
    required this.tip,
    required this.vector,
    this.northOffset = 0,
    this.color = const Color(0xFFFF6D00), // amber-orange, reads over green
  });

  @override
  void paint(Canvas canvas, Size size) {
    final len = vector.length;
    final halfWidth = len * math.tan(vector.widthDeg * math.pi / 180);

    canvas.save();
    canvas.translate(tip.dx, tip.dy);
    // 0 rad = cone points up (north). Positive rotation is clockwise in Flutter,
    // matching compass bearings on a north-up image.
    canvas.rotate((vector.angle - northOffset) * math.pi / 180);

    // Up-pointing cone: tip at origin, base edge at y = -len.
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(-halfWidth, -len)
      ..lineTo(halfWidth, -len)
      ..close();

    final shader = ui.Gradient.linear(
      const Offset(0, 0),
      Offset(0, -len),
      [color.withValues(alpha: 0.45), color.withValues(alpha: 0.0)],
    );
    canvas.drawPath(path, Paint()..shader = shader);

    // Faint center line for direction clarity.
    canvas.drawLine(
      const Offset(0, 0),
      Offset(0, -len),
      Paint()
        ..color = color.withValues(alpha: 0.35)
        ..strokeWidth = 1.5,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant ScentConePainter old) =>
      old.tip != tip ||
      old.northOffset != northOffset ||
      old.color != color ||
      old.vector.angle != vector.angle ||
      old.vector.length != vector.length ||
      old.vector.widthDeg != vector.widthDeg;
}
