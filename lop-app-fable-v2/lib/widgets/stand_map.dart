import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/stands_data.dart';
import '../models/hunt.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import 'scent_cone_painter.dart';
import 'stand_detail_sheet.dart';

/// Aspect ratio of assets/lop_map.jpg (1536 x 1344).
const double kMapAspect = 1536 / 1344;

/// The club aerial with live status pins and (in scent view) the scent cone.
///
/// Green = open, red = in use, solid green pill = my stand. In scent view,
/// tapping a pin selects it and draws its predicted scent cone; otherwise
/// tapping a pin opens the check-in/out sheet. (Pin placement was retired
/// once all 130 stands were set — positions are read-only club data.)
class StandMap extends ConsumerWidget {
  final bool scentView;
  const StandMap({super.key, this.scentView = false});

  /// Computes the cone (fractional tip + vector) for the selected stand, or null.
  /// Returned as a final record so it promotes to non-null inside the
  /// LayoutBuilder closure below.
  ({Offset tipFrac, ScentVector vector})? _coneData(
    WidgetRef ref,
    Map<String, Offset> positions,
  ) {
    if (!scentView) return null;
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
    final cone = _coneData(ref, positions);

    return InteractiveViewer(
      minScale: 0.8,
      maxScale: 12,
      child: AspectRatio(
        aspectRatio: kMapAspect,
        child: LayoutBuilder(
          builder: (ctx, c) {
            final w = c.maxWidth;
            final h = c.maxHeight;
            return Stack(
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
                      hunt: byCode[entry.key],
                    ),
              ],
            );
          },
        ),
      ),
    );
  }

  /// A compact colored-number badge: green = open, red = in use, solid green
  /// pill = MY stand. Sized relative to the map so phone screens aren't
  /// swamped (the old rings were a fixed 26 px).
  Widget _pin(
    BuildContext ctx,
    WidgetRef ref,
    String code,
    Offset frac,
    double w,
    double h, {
    required Hunt? hunt,
  }) {
    final uid = ref.watch(authUidProvider);
    final mine = hunt != null && hunt.userId == uid;
    final inUse = hunt != null;
    final selected = scentView && ref.watch(selectedStandProvider) == code;

    final fontSize = (w * 0.014).clamp(7.0, 12.0);
    final fg = inUse ? Colors.red.shade700 : Colors.green.shade800;

    void openSheet() => showModalBottomSheet(
          context: ctx,
          isScrollControlled: true,
          showDragHandle: true,
          builder: (_) => StandDetailSheet(stand: standByCode(code)!),
        );

    return Positioned(
      left: frac.dx * w,
      top: frac.dy * h,
      child: FractionalTranslation(
        translation: const Offset(-0.5, -0.5),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            if (scentView && mine) {
              // Your own stand: go straight to check-out.
              openSheet();
            } else if (scentView) {
              ref.read(selectedStandProvider.notifier).state = code;
              // Start the slider at the hour containing "now", not the
              // (possibly stale) first cached hour.
              ref.read(selectedHourProvider.notifier).state =
                  ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
            } else {
              openSheet();
            }
          },
          // Transparent padding keeps a finger-sized tap target around the
          // small label.
          child: Padding(
            padding: const EdgeInsets.all(6),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
              decoration: BoxDecoration(
                color: mine
                    ? Colors.green.shade700
                    : Colors.white.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(6),
                border: selected
                    ? Border.all(color: Colors.amber.shade800, width: 1.5)
                    : null,
              ),
              child: Text(
                code,
                style: TextStyle(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                  color: mine ? Colors.white : fg,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

}
