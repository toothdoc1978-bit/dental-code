import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/stands_data.dart';
import '../providers/app_providers.dart';
import '../services/member_store.dart';
import '../utils/format.dart';
import '../widgets/high_water_banner.dart';
import '../widgets/map_reference.dart';
import '../widgets/stand_detail_sheet.dart';
import '../widgets/stand_list.dart';
import 'conditions_screen.dart';
import 'hunt_log_screen.dart';
import 'rules_screen.dart';

/// Main screen: my-hunt banner + club map + live stand list.
///
/// Wide screens (iPad) get map | list side-by-side; narrow screens stack a map
/// thumbnail above the list. (Stand-pin placement was retired once all 130
/// pins were set — positions are read-only club data now.)
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  /// Opens the full-screen map. If I'm checked in and nothing else is selected,
  /// pre-select my stand so my scent cone appears immediately, at the forecast
  /// hour containing "now".
  void _openMap(BuildContext context, WidgetRef ref) {
    final myHunt = ref.read(myActiveHuntProvider).valueOrNull;
    if (myHunt != null && ref.read(selectedStandProvider) == null) {
      ref.read(selectedStandProvider.notifier).state = myHunt.standCode;
      ref.read(selectedHourProvider.notifier).state =
          ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
    }
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MapFullScreen()),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final member = ref.watch(currentMemberProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lookout Point'),
        actions: [
          IconButton(
            tooltip: 'Conditions',
            icon: const Icon(Icons.cloud_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ConditionsScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Hunt log',
            icon: const Icon(Icons.history),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HuntLogScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Open map',
            icon: const Icon(Icons.map_outlined),
            onPressed: () => _openMap(context, ref),
          ),
          if (member != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text(member.firstName,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'rules') {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const RulesScreen()),
                );
              } else if (v == 'change') {
                MemberStore.clear();
                ref.read(currentMemberProvider.notifier).state = null;
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'rules', child: Text('Club rules')),
              PopupMenuItem(value: 'change', child: Text('Change hunter')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          const HighWaterBanner(),
          const _MyHuntBanner(),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 720;
                if (wide) {
                  return Row(
                    children: [
                      Expanded(flex: 3, child: _wideMapPane(context, ref)),
                      const VerticalDivider(width: 1),
                      SizedBox(
                        width: 400,
                        child: Column(
                          children: [
                            _StatusBar(),
                            _SearchAndFilter(),
                            const Expanded(child: StandList()),
                          ],
                        ),
                      ),
                    ],
                  );
                }
                return Column(
                  children: [
                    _mapThumbnail(context, ref),
                    _StatusBar(),
                    _SearchAndFilter(),
                    const Expanded(child: StandList()),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Wide layout: interactive map with a clear button to open full-screen.
  Widget _wideMapPane(BuildContext context, WidgetRef ref) {
    return Stack(
      children: [
        const Positioned.fill(child: MapReference()),
        Positioned(
          right: 12,
          top: 12,
          child: FilledButton.tonalIcon(
            onPressed: () => _openMap(context, ref),
            icon: const Icon(Icons.open_in_full),
            label: const Text('Full screen'),
          ),
        ),
      ],
    );
  }

  Widget _mapThumbnail(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => _openMap(context, ref),
          child: SizedBox(
            height: 170,
            width: double.infinity,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/lop_map.jpg',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stack) => Container(
                    color: const Color(0xFFEAF1E6),
                    child: Center(
                      child: Text(
                        'Add assets/lop_map.jpg\nto show the club map',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.green.shade900),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.zoom_out_map, size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text('Tap to open',
                            style:
                                TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Persistent "you're checked in" bar with one-tap Check Out. Re-renders every
/// minute so the elapsed time keeps ticking during a long sit.
class _MyHuntBanner extends ConsumerStatefulWidget {
  const _MyHuntBanner();

  @override
  ConsumerState<_MyHuntBanner> createState() => _MyHuntBannerState();
}

class _MyHuntBannerState extends ConsumerState<_MyHuntBanner> {
  Timer? _tick;

  @override
  void initState() {
    super.initState();
    _tick = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tick?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hunt = ref.watch(myActiveHuntProvider).valueOrNull;
    if (hunt == null) return const SizedBox.shrink();
    final stand = standByCode(hunt.standCode);

    final since = fmtClock(hunt.checkInTime);
    final elapsed = fmtElapsed(hunt.checkInTime);
    final detail = [
      if (since.isNotEmpty) 'since $since',
      if (elapsed.isNotEmpty) elapsed,
    ].join(' · ');

    return Material(
      color: Colors.green.shade700,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
        child: Row(
          children: [
            const Icon(Icons.gps_fixed, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "You're on Stand ${hunt.standCode} · ${hunt.huntType}",
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  if (detail.isNotEmpty)
                    Text(detail,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.green.shade800,
              ),
              onPressed: stand == null
                  ? null
                  : () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        showDragHandle: true,
                        builder: (_) => StandDetailSheet(stand: stand),
                      ),
              child: const Text('Check Out'),
            ),
          ],
        ),
      ),
    );
  }
}

/// "X open · Y in use" summary strip + a Conditions button. Weather and river
/// details live on the Conditions screen (member feedback: keep home clean).
class _StatusBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final total = ref.watch(standsProvider).length;
    final inUse = ref.watch(activeHuntsByCodeProvider).length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: Wrap(
        spacing: 8,
        runSpacing: 6,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _chip('${total - inUse} open', Colors.green.shade100,
              Colors.green.shade900),
          _chip('$inUse in use', Colors.grey.shade300, Colors.grey.shade800),
          ActionChip(
            avatar: Icon(Icons.cloud_outlined,
                size: 16, color: Colors.blue.shade900),
            label: Text('Conditions',
                style: TextStyle(
                    color: Colors.blue.shade900,
                    fontWeight: FontWeight.w600)),
            backgroundColor: Colors.blue.shade50,
            side: BorderSide.none,
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ConditionsScreen()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(text,
          style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
    );
  }
}

/// Search box + All / Gold / Bow-only filter chips.
class _SearchAndFilter extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(standFilterProvider);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
          child: TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              hintText: 'Search stand number (e.g. 28 or 12B)…',
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              _filterChip(ref, 'All', StandFilter.all, filter),
              const SizedBox(width: 8),
              _filterChip(ref, 'Gold', StandFilter.gold, filter),
              const SizedBox(width: 8),
              _filterChip(ref, 'Bow-only', StandFilter.bowOnly, filter),
            ],
          ),
        ),
      ],
    );
  }

  Widget _filterChip(
      WidgetRef ref, String label, StandFilter value, StandFilter current) {
    return ChoiceChip(
      label: Text(label),
      selected: current == value,
      onSelected: (_) => ref.read(standFilterProvider.notifier).state = value,
    );
  }
}
