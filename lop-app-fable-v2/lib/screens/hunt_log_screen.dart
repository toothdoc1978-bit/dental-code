import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/hunt_types.dart';
import '../models/hunt.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';

/// Season history: every completed hunt, newest first, grouped by day, with a
/// season-totals card on top (hunts, hours on stand, deer seen). "Mine" filter
/// shows just your own hunts. Read-only — the data was already being recorded
/// at every check-in/out; this screen finally shows it.
class HuntLogScreen extends ConsumerStatefulWidget {
  const HuntLogScreen({super.key});

  @override
  ConsumerState<HuntLogScreen> createState() => _HuntLogScreenState();
}

class _HuntLogScreenState extends ConsumerState<HuntLogScreen> {
  bool _mineOnly = false;

  @override
  Widget build(BuildContext context) {
    final huntsAsync = ref.watch(huntLogProvider);
    final uid = ref.watch(authUidProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hunt Log'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: FilterChip(
              label: const Text('Mine'),
              selected: _mineOnly,
              onSelected: (v) => setState(() => _mineOnly = v),
            ),
          ),
        ],
      ),
      body: huntsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load hunts:\n$e')),
        data: (all) {
          final hunts = _mineOnly
              ? all.where((h) => h.userId == uid).toList()
              : all;
          if (hunts.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  _mineOnly
                      ? 'No completed hunts of yours yet.\nCheck in, hunt, check out — it lands here.'
                      : 'No completed hunts yet.\nThe log fills in as members check out.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600, height: 1.4),
                ),
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              _SummaryCard(hunts: hunts, mineOnly: _mineOnly),
              ..._groupedByDay(hunts),
            ],
          );
        },
      ),
    );
  }

  /// Day headers ("Fri, Jul 4") with that day's hunts beneath.
  List<Widget> _groupedByDay(List<Hunt> hunts) {
    final out = <Widget>[];
    String? lastDay;
    for (final h in hunts) {
      final t = h.checkInTime;
      final day = t == null ? 'Unknown date' : fmtDate(t);
      if (day != lastDay) {
        lastDay = day;
        out.add(Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Text(day,
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.green.shade900)),
        ));
      }
      out.add(_HuntTile(hunt: h));
    }
    return out;
  }
}

/// Season totals across the listed hunts.
class _SummaryCard extends StatelessWidget {
  final List<Hunt> hunts;
  final bool mineOnly;
  const _SummaryCard({required this.hunts, required this.mineOnly});

  @override
  Widget build(BuildContext context) {
    var minutes = 0;
    var does = 0, bucks = 0, fawns = 0;
    for (final h in hunts) {
      final ci = h.checkInTime, co = h.checkOutTime;
      if (ci != null && co != null) minutes += co.difference(ci).inMinutes;
      does += h.doeSeen ?? 0;
      bucks += h.buckSeen ?? 0;
      fawns += h.fawnSeen ?? 0;
    }

    Widget stat(String value, String label) => Expanded(
          child: Column(
            children: [
              Text(value,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold)),
              Text(label,
                  style:
                      TextStyle(fontSize: 12, color: Colors.grey.shade700)),
            ],
          ),
        );

    return Card(
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(mineOnly ? 'My season' : 'Club season',
                style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Row(
              children: [
                stat('${hunts.length}', 'hunts'),
                stat(fmtDuration(Duration(minutes: minutes)), 'on stand'),
                stat('$bucks', 'bucks'),
                stat('$does', 'does'),
                stat('$fawns', 'fawns'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// One completed hunt: who, where, when, how long, what they saw, river stage.
class _HuntTile extends StatelessWidget {
  final Hunt hunt;
  const _HuntTile({required this.hunt});

  @override
  Widget build(BuildContext context) {
    final ci = hunt.checkInTime, co = hunt.checkOutTime;
    final times = [
      if (ci != null) fmtClock(ci),
      if (co != null) fmtClock(co),
    ].join(' – ');
    final dur = (ci != null && co != null)
        ? ' (${fmtDuration(co.difference(ci))})'
        : '';

    final deer = <String>[
      if (hunt.buckSeen != null) '${hunt.buckSeen} buck${hunt.buckSeen == 1 ? '' : 's'}',
      if (hunt.doeSeen != null) '${hunt.doeSeen} doe${hunt.doeSeen == 1 ? '' : 's'}',
      if (hunt.fawnSeen != null) '${hunt.fawnSeen} fawn${hunt.fawnSeen == 1 ? '' : 's'}',
    ].join(' · ');

    final river = <String>[
      if (hunt.riverVicksburgFt != null)
        'Vburg ${hunt.riverVicksburgFt!.toStringAsFixed(1)} ft',
      if (hunt.riverGreenvilleFt != null)
        'Gville ${hunt.riverGreenvilleFt!.toStringAsFixed(1)} ft',
    ].join(' · ');

    return ListTile(
      dense: true,
      leading: CircleAvatar(
        radius: 18,
        backgroundColor: Colors.green.shade700,
        child: Text(hunt.standCode,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
      ),
      title: Row(
        children: [
          Icon(huntTypeIcon(hunt.huntType),
              size: 15, color: Colors.grey.shade700),
          const SizedBox(width: 5),
          Expanded(
            child: Text('${hunt.memberName} · ${hunt.huntType}',
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (times.isNotEmpty)
            Text('$times$dur${hunt.autoClosed ? ' · auto 8 PM' : ''}'),
          if (deer.isNotEmpty)
            Text(deer, style: TextStyle(color: Colors.brown.shade700)),
          if (river.isNotEmpty)
            Text(river,
                style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 11)),
        ],
      ),
    );
  }
}
