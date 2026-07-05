import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/stands_data.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import 'scent_cone_painter.dart';
import 'stand_detail_sheet.dart';

/// Aspect ratio of assets/lop_map.jpg (1536 x 1344).
const double kMapAspect = 1536 / 1344;

/// The club aerial with live status pins and (in scent view) the scent cone.
///
/// Green ring = open, red ring = in use. In place mode, tap the map to pin the
/// selected stand. In scent view, tapping a pin selects it and draws its
/// predicted scent cone; otherwise tapping a pin opens the check-in/out sheet.
class StandMap extends ConsumerWidget {
  final bool allowPlacing;
  final bool scentView;
  const StandMap({super.key, this.allowPlacing = false, this.scentView = false});

  /// Computes the cone (fractional tip + vector) for the selected stand, or null.
  /// Returned as a final record so it promotes to non-null inside the
  /// LayoutBuilder closure below.
  ({Offset tipFrac, ScentVector vector})? _coneData(
    WidgetRef ref,
    Map<String, Offset> positions,
    bool placeMode,
  ) {
    if (!scentView || placeMode) return null;
    final selected = ref.watch(selectedStandProvider);
    final forecast = ref.watch(forecastProvider).valueOrNull;
    final hour = ref.watch(selectedHourProvider);
    if (selected == null ||
        !positions.containsKey(selected) ||
        forecast == null ||
        forecast.hours.isEmpty) {
      return null;
    }
    final i = hour.clamp(0, forecast.hours.length - 1);
    final river = ref.watch(riverStatusProvider).valueOrNull;
    return (
      tipFrac: positions[selected]!,
      vector: calculateScentVector(
        forecast.hours[i],
        drainageHeading: kDrainageHeading,
        waterTempF: river?.waterTempF,
        riverEdge: kRiverEdgeStandCodes.contains(selected),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};
    final byCode = ref.watch(activeHuntsByCodeProvider);
    final placeMode = allowPlacing && ref.watch(placeModeProvider);
    final placing = ref.watch(placingStandProvider);
    final cone = _coneData(ref, positions, placeMode);

    return InteractiveViewer(
      minScale: 0.8,
      maxScale: 12,
      child: AspectRatio(
        aspectRatio: kMapAspect,
        child: LayoutBuilder(
          builder: (ctx, c) {
            final w = c.maxWidth;
            final h = c.maxHeight;
            return GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTapUp: (placeMode && placing != null)
                  ? (details) {
                      final x = (details.localPosition.dx / w).clamp(0.0, 1.0);
                      final y = (details.localPosition.dy / h).clamp(0.0, 1.0);
                      ref
                          .read(firestoreServiceProvider)
                          .setStandPosition(placing, x, y);
                      final placed = positions.keys.toSet()..add(placing);
                      ref.read(placingStandProvider.notifier).state =
                          _nextUnplaced(placed);
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(
                          duration: const Duration(milliseconds: 800),
                          content: Text('Placed Stand $placing'),
                        ),
                      );
                    }
                  : null,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Image.asset(
                      'assets/lop_map.jpg',
                      fit: BoxFit.fill,
                      errorBuilder: (c, e, s) => Container(
                        color: const Color(0xFFEAF1E6),
                        alignment: Alignment.center,
                        child: const Text('Add assets/lop_map.jpg'),
                      ),
                    ),
                  ),
                  if (cone != null)
                    Positioned.fill(
                      child: CustomPaint(
                        painter: ScentConePainter(
                          tip: Offset(cone.tipFrac.dx * w, cone.tipFrac.dy * h),
                          vector: cone.vector,
                          northOffset: kMapNorthOffsetDegrees,
                        ),
                      ),
                    ),
                  for (final entry in positions.entries)
                    if (standByCode(entry.key) != null)
                      _pin(
                        ctx,
                        ref,
                        entry.key,
                        entry.value,
                        w,
                        h,
                        byCode.containsKey(entry.key),
                        placeMode,
                        placing == entry.key,
                      ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _pin(
    BuildContext ctx,
    WidgetRef ref,
    String code,
    Offset frac,
    double w,
    double h,
    bool inUse,
    bool placeMode,
    bool isPlacing,
  ) {
    const double size = 26;
    final base = inUse ? Colors.red : Colors.green;
    final ring = isPlacing ? Colors.orange : base;
    // Hollow ring so the stand number printed on the map stays visible.
    return Positioned(
      left: frac.dx * w - size / 2,
      top: frac.dy * h - size / 2,
      child: GestureDetector(
        onTap: () {
          if (placeMode) {
            ref.read(placingStandProvider.notifier).state = code;
          } else if (scentView) {
            ref.read(selectedStandProvider.notifier).state = code;
            // Start the slider at the hour containing "now", not the (possibly
            // stale) first cached hour.
            ref.read(selectedHourProvider.notifier).state =
                ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
          } else {
            showModalBottomSheet(
              context: ctx,
              isScrollControlled: true,
              showDragHandle: true,
              builder: (_) => StandDetailSheet(stand: standByCode(code)!),
            );
          }
        },
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color:
                inUse ? Colors.red.withValues(alpha: 0.30) : Colors.transparent,
            border: Border.all(color: ring, width: 3),
          ),
        ),
      ),
    );
  }

  String? _nextUnplaced(Set<String> placed) {
    for (final s in kStands) {
      if (!placed.contains(s.code)) return s.code;
    }
    return null;
  }
}
