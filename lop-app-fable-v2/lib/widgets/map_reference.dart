import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/stands_data.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import 'high_water_banner.dart';
import 'stand_detail_sheet.dart';
import 'stand_map.dart';

/// Read-only club map for the home pane (pan/zoom + live status pins).
class MapReference extends StatelessWidget {
  const MapReference({super.key});

  @override
  Widget build(BuildContext context) => const StandMap();
}

/// Full-screen map: scent view (tap a stand → cone + hour slider).
class MapFullScreen extends ConsumerWidget {
  const MapFullScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};

    return Scaffold(
      appBar: AppBar(title: const Text('Club Map')),
      body: Column(
        children: [
          const HighWaterBanner(),
          Expanded(
            child: Stack(
              children: [
                const StandMap(scentView: true),
                if (positions.isEmpty) _EmptyHint(),
              ],
            ),
          ),
          _ScentPanel(),
        ],
      ),
    );
  }
}

/// Bottom panel showing the selected stand's wind/scent readout + hour slider.
class _ScentPanel extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(selectedStandProvider);
    if (selected == null) {
      return Container(
        width: double.infinity,
        color: Colors.green.shade50,
        padding: const EdgeInsets.all(12),
        child: const Text('Tap a stand to see its predicted scent cone.',
            textAlign: TextAlign.center),
      );
    }

    final forecast = ref.watch(forecastProvider).valueOrNull;
    final hours = forecast?.hours ?? const [];
    if (hours.isEmpty) {
      return _wrap(
        context,
        ref,
        selected,
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Text('Loading forecast…'),
        ),
      );
    }

    final i = ref.watch(selectedHourProvider).clamp(0, hours.length - 1);
    final h = hours[i];
    final riverEdge = kRiverEdgeStandCodes.contains(selected);
    final waterTempF =
        ref.watch(riverStatusProvider).valueOrNull?.waterTempF;
    final v = calculateScentVector(
      h,
      drainageHeading: kDrainageHeading,
      waterTempF: waterTempF,
      riverEdge: riverEdge,
    );

    return _wrap(
      context,
      ref,
      selected,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_fmtHour(h.time)} · wind ${_cardinal(h.windDirDeg)} '
            '${h.windMph.round()} mph · scent → ${_cardinal(v.angle)}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(
            '${h.tempF.round()}°F · ${h.cloudCoverPct.round()}% clouds · '
            '${_regime(h.windMph, h.tempDelta)}'
            '${riverEdge && waterTempF != null ? ' · river-edge (water ${waterTempF.round()}°F)' : ''}',
            style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
          ),
          if (hours.length > 1)
            Slider(
              value: i.toDouble(),
              min: 0,
              max: (hours.length - 1).toDouble(),
              divisions: hours.length - 1,
              label: _fmtHour(h.time),
              onChanged: (val) => ref
                  .read(selectedHourProvider.notifier)
                  .state = val.round(),
            ),
        ],
      ),
    );
  }

  Widget _wrap(
      BuildContext context, WidgetRef ref, String code, Widget body) {
    // "Check Out" (red) when the selected stand is mine, so ending a hunt from
    // the map is unmissable. "Mine" = my member identity, any device.
    final hunt = ref.watch(activeHuntsByCodeProvider)[code];
    final mine =
        hunt != null && hunt.memberId == ref.watch(currentMemberProvider)?.id;
    return Container(
      width: double.infinity,
      color: Colors.green.shade50,
      padding: const EdgeInsets.fromLTRB(14, 8, 8, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Stand $code — scent forecast',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              TextButton(
                style: mine
                    ? TextButton.styleFrom(
                        foregroundColor: Colors.red.shade700,
                        textStyle:
                            const TextStyle(fontWeight: FontWeight.bold),
                      )
                    : null,
                onPressed: () {
                  final stand = standByCode(code);
                  if (stand != null) {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      showDragHandle: true,
                      builder: (_) => StandDetailSheet(stand: stand),
                    );
                  }
                },
                child: Text(mine ? 'Check Out' : 'Check in / out'),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                tooltip: 'Hide cone',
                onPressed: () =>
                    ref.read(selectedStandProvider.notifier).state = null,
              ),
            ],
          ),
          body,
        ],
      ),
    );
  }

  String _regime(double windMph, double tempDelta) {
    final w = thermalWeight(windMph);
    if (w == 0) return 'true wind dominates';
    final thermal = tempDelta < 0
        ? 'sinking toward drainage'
        : tempDelta > 0
            ? 'rising & dispersing'
            : 'slack air';
    if (tempDelta == 0 && w == 1) return 'slack air';
    return w == 1 ? 'thermal — $thermal' : 'wind + thermal mix — $thermal';
  }

  String _fmtHour(DateTime dt) {
    final local = dt.toLocal();
    var hr = local.hour % 12;
    if (hr == 0) hr = 12;
    final ampm = local.hour >= 12 ? 'PM' : 'AM';
    return '$hr $ampm';
  }

  static const _dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];

  String _cardinal(double deg) {
    final idx = (((deg % 360) + 360) % 360 / 22.5).round() % 16;
    return _dirs[idx];
  }
}

/// Centered notice if the shared pin data hasn't loaded (or is missing).
class _EmptyHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Center(
        child: Card(
          color: Colors.black.withValues(alpha: 0.72),
          child: const Padding(
            padding: EdgeInsets.all(18),
            child: SizedBox(
              width: 240,
              child: Text(
                'No stand pins found.\nCheck your connection — pin positions '
                'load from the club database.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, height: 1.3),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
