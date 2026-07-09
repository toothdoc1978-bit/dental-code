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
  Widget build(BuildContext context) => const StandMap(allowPlacing: false);
}

/// Full-screen map: scent view (tap a stand → cone + hour slider) plus an
/// optional "Place stands" mode.
class MapFullScreen extends ConsumerWidget {
  const MapFullScreen({super.key});

  String? _firstUnplaced(Map<String, Offset> placed) {
    for (final s in kStands) {
      if (!placed.containsKey(s.code)) return s.code;
    }
    return null;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final placeMode = ref.watch(placeModeProvider);
    final placing = ref.watch(placingStandProvider);
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};

    return Scaffold(
      appBar: AppBar(title: const Text('Club Map')),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: placeMode ? Colors.green.shade700 : null,
        foregroundColor: placeMode ? Colors.white : null,
        icon: Icon(placeMode ? Icons.check : Icons.edit_location_alt),
        label: Text(placeMode ? 'Done' : 'Place stands'),
        onPressed: () {
          final on = !placeMode;
          ref.read(placeModeProvider.notifier).state = on;
          if (on) {
            ref.read(placingStandProvider.notifier).state =
                placing ?? _firstUnplaced(positions);
          }
        },
      ),
      body: Column(
        children: [
          const HighWaterBanner(),
          if (placeMode) _PlaceBar(),
          Expanded(
            child: Stack(
              children: [
                const StandMap(allowPlacing: true, scentView: true),
                if (!placeMode && positions.isEmpty) _EmptyHint(),
              ],
            ),
          ),
          if (!placeMode) _ScentPanel(),
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
    // the map is unmissable.
    final hunt = ref.watch(activeHuntsByCodeProvider)[code];
    final mine = hunt != null && hunt.userId == ref.watch(authUidProvider);
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

/// Centered hint shown before any pins exist.
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
                'No stands pinned yet.\nTap “Place stands”, then tap each '
                'stand’s spot on the photo.',
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

/// Instruction + selection bar shown while placing stands.
class _PlaceBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final placing = ref.watch(placingStandProvider);
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};
    final placedCount = positions.length;

    return Material(
      color: Colors.amber.shade100,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    placing == null
                        ? 'All stands placed 🎉'
                        : 'Placing: Stand $placing',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    placing == null
                        ? '$placedCount of ${kStands.length} placed'
                        : 'Tap its spot on the map · $placedCount of ${kStands.length} placed',
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
            if (placing != null && positions.containsKey(placing))
              TextButton(
                onPressed: () => ref
                    .read(firestoreServiceProvider)
                    .clearStandPosition(placing),
                child: const Text('Remove'),
              ),
            TextButton(
              onPressed: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                showDragHandle: true,
                builder: (_) => _StandPicker(),
              ),
              child: const Text('Pick stand'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Searchable list to choose which stand to place next.
class _StandPicker extends ConsumerStatefulWidget {
  @override
  ConsumerState<_StandPicker> createState() => _StandPickerState();
}

class _StandPickerState extends ConsumerState<_StandPicker> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};
    final list = kStands
        .where((s) =>
            _q.isEmpty || s.code.toLowerCase().contains(_q.toLowerCase()))
        .toList();
    return SafeArea(
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: TextField(
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Stand number (28, 12B)…',
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                onChanged: (v) => setState(() => _q = v),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: list.length,
                itemBuilder: (context, i) {
                  final s = list[i];
                  final done = positions.containsKey(s.code);
                  return ListTile(
                    leading: Icon(
                      done
                          ? Icons.check_circle
                          : Icons.radio_button_unchecked,
                      color: done ? Colors.green : Colors.grey,
                    ),
                    title: Text('Stand ${s.code}'),
                    subtitle: Text(s.bowOnly ? 'Bow-only' : 'Gold'),
                    onTap: () {
                      ref.read(placingStandProvider.notifier).state = s.code;
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
