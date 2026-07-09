import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';
import 'map_reference.dart';
import 'stand_detail_sheet.dart';

/// The searchable, filterable list of all stands with live status.
/// Open (green) vs. in-use (grey, with who + what + since when). Tapping a row
/// opens [StandDetailSheet]; the little map button jumps to that stand on the
/// full-screen map with its scent cone selected. Search matches stand numbers
/// AND hunter names ("who's on 28?" or "where's Danny?").
class StandList extends ConsumerWidget {
  const StandList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stands = ref.watch(standsProvider);
    final byCode = ref.watch(activeHuntsByCodeProvider);
    final uid = ref.watch(authUidProvider);
    final query = ref.watch(searchQueryProvider).trim().toLowerCase();
    final filter = ref.watch(standFilterProvider);

    final filtered = stands.where((s) {
      if (filter == StandFilter.gold && s.bowOnly) return false;
      if (filter == StandFilter.bowOnly && !s.bowOnly) return false;
      if (query.isNotEmpty) {
        final occupant = byCode[s.code]?.memberName.toLowerCase() ?? '';
        if (!s.code.toLowerCase().contains(query) &&
            !occupant.contains(query)) {
          return false;
        }
      }
      return true;
    }).toList();

    if (filtered.isEmpty) {
      return const Center(child: Text('No matching stands'));
    }

    return ListView.separated(
      itemCount: filtered.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final stand = filtered[i];
        final hunt = byCode[stand.code];
        final mine = hunt != null && hunt.userId == uid;

        final Color dotColor = hunt != null
            ? (mine ? Colors.green.shade700 : Colors.grey.shade500)
            : (stand.bowOnly ? Colors.brown.shade600 : Colors.green.shade700);

        final String? sinceLabel =
            (hunt != null && hunt.checkInTime != null)
                ? ' · since ${fmtClock(hunt.checkInTime)}'
                : null;

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: dotColor,
            child: Text(
              stand.code,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          title: Row(
            children: [
              Text('Stand ${stand.code}',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              if (stand.bowOnly) ...[
                const SizedBox(width: 6),
                Icon(Icons.arrow_outward,
                    size: 14, color: Colors.brown.shade600),
              ],
            ],
          ),
          subtitle: hunt != null
              ? Text(
                  '${mine ? 'You' : hunt.memberFirstName} · ${hunt.huntType}'
                  '${sinceLabel ?? ''}',
                  style: TextStyle(color: Colors.grey.shade700),
                )
              : Text(
                  stand.bowOnly ? 'Open · bow-only' : 'Open',
                  style: TextStyle(color: Colors.green.shade700),
                ),
          // My row: the whole trailing slot is one compact red Check Out
          // button (the priority action). Other rows: map jump + status.
          trailing: mine
              ? FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.red.shade700,
                    visualDensity: VisualDensity.compact,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    textStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  onPressed: () => _openSheet(context, stand),
                  child: const Text('Check Out'),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      tooltip: 'Show on map',
                      icon: Icon(Icons.map_outlined,
                          size: 20, color: Colors.green.shade800),
                      visualDensity: VisualDensity.compact,
                      onPressed: () => _jumpToMap(context, ref, stand),
                    ),
                    if (hunt != null)
                      Chip(
                        label: const Text('In use'),
                        visualDensity: VisualDensity.compact,
                        backgroundColor: Colors.grey.shade300,
                        side: BorderSide.none,
                      )
                    else
                      const Icon(Icons.chevron_right),
                  ],
                ),
          onTap: () => _openSheet(context, stand),
        );
      },
    );
  }

  /// Opens the full-screen map with [stand] selected (scent cone + panel up)
  /// at the forecast hour containing "now".
  void _jumpToMap(BuildContext context, WidgetRef ref, Stand stand) {
    ref.read(selectedStandProvider.notifier).state = stand.code;
    ref.read(selectedHourProvider.notifier).state =
        ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MapFullScreen()),
    );
  }

  void _openSheet(BuildContext context, Stand stand) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => StandDetailSheet(stand: stand),
    );
  }
}
