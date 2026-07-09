import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../models/club_status.dart';
import '../models/forecast.dart';
import '../models/river_status.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import '../utils/format.dart';

/// Everything about today's conditions in one place: current weather + scent
/// behavior, the next 24 hours, and the Mississippi River stages. Moved off
/// the home screen (member feedback: river stages were too prominent there).
class ConditionsScreen extends ConsumerWidget {
  const ConditionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final forecast = ref.watch(forecastProvider).valueOrNull;
    final river = ref.watch(riverStatusProvider).valueOrNull;

    final highWater = ref.watch(highWaterProvider);
    final member = ref.watch(currentMemberProvider);
    final isAdmin = member != null && kAdminMemberIds.contains(member.id);

    return Scaffold(
      appBar: AppBar(title: const Text('Conditions')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
        children: [
          _NowCard(forecast: forecast),
          const SizedBox(height: 12),
          _RiverCard(river: river, highWater: highWater),
          if (isAdmin) ...[
            const SizedBox(height: 12),
            const _AdminCard(),
          ],
          if (forecast != null && forecast.hours.isNotEmpty) ...[
            const SizedBox(height: 12),
            _HourlyCard(forecast: forecast),
          ],
          const SizedBox(height: 16),
          Center(
            child: Text('Lookout Point app $kAppVersion',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}

/// Admin-only: control how the high-water archery rule is decided.
class _AdminCard extends ConsumerWidget {
  const _AdminCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(clubStatusProvider).valueOrNull;
    final mode = status?.mode ?? HighWaterMode.auto;
    final active = status?.archeryOnly ?? false;

    return Card(
      color: Colors.amber.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.admin_panel_settings, size: 18),
                SizedBox(width: 6),
                Text('Admin — high-water archery rule',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              active
                  ? 'Rule is ACTIVE — deer hunting is archery only.'
                  : 'Rule is not active — all methods allowed.',
              style: TextStyle(
                  color: active ? Colors.red.shade800 : Colors.green.shade800,
                  fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            SegmentedButton<HighWaterMode>(
              segments: const [
                ButtonSegment(
                    value: HighWaterMode.auto, label: Text('Auto (gauge)')),
                ButtonSegment(
                    value: HighWaterMode.forceOn, label: Text('Force ON')),
                ButtonSegment(
                    value: HighWaterMode.forceOff, label: Text('Force OFF')),
              ],
              selected: {mode},
              onSelectionChanged: (sel) =>
                  ref.read(riverServiceProvider).setHighWaterMode(sel.first),
            ),
            const SizedBox(height: 8),
            Text(
              'Auto follows the Vicksburg gauge: ON at ${kHighWaterOnFt.toStringAsFixed(1)} ft, '
              'back OFF below ${kHighWaterOffFt.toStringAsFixed(1)} ft.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

/// Current hour: temp, wind, clouds, and what the scent is doing.
class _NowCard extends StatelessWidget {
  final Forecast? forecast;
  const _NowCard({required this.forecast});

  @override
  Widget build(BuildContext context) {
    final hours = forecast?.hours ?? const <HourlyWeather>[];
    if (hours.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Loading forecast…'),
        ),
      );
    }
    final h = hours[forecast!.indexForNow()];
    final v = calculateScentVector(h, drainageHeading: kDrainageHeading);

    return Card(
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Right now',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Text('${h.tempF.round()}°F',
                    style: const TextStyle(
                        fontSize: 34, fontWeight: FontWeight.bold)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                          'Wind ${cardinal(h.windDirDeg)} ${h.windMph.round()} mph'),
                      Text('${h.cloudCoverPct.round()}% cloud cover'),
                      Text('Scent drifts ${cardinal(v.angle)}',
                          style:
                              const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(_regime(h.windMph, h.tempDelta),
                style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  String _regime(double windMph, double tempDelta) {
    final w = thermalWeight(windMph);
    if (w == 0) return 'True wind dominates — trust the wind direction.';
    final thermal = tempDelta < 0
        ? 'cooling air is sinking and draining toward the river'
        : tempDelta > 0
            ? 'warming air is rising and dispersing'
            : 'slack air';
    return w == 1
        ? 'Thermal conditions — $thermal.'
        : 'Wind + thermal mix — $thermal.';
  }
}

/// Mississippi River stages + water temperature + high-water rule status.
class _RiverCard extends StatelessWidget {
  final RiverStatus? river;
  final bool highWater;
  const _RiverCard({required this.river, this.highWater = false});

  @override
  Widget build(BuildContext context) {
    final r = river;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Mississippi River',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            if (r == null)
              const Text('Loading river data…')
            else ...[
              _gaugeRow('Vicksburg', r.vicksburg),
              const SizedBox(height: 6),
              _gaugeRow('Greenville', r.greenville),
              if (r.waterTempF != null) ...[
                const SizedBox(height: 6),
                Text('Water temperature: ${r.waterTempF!.round()}°F'),
              ],
              const SizedBox(height: 10),
              if (highWater)
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    'HIGH WATER RULE ACTIVE — deer hunting is archery only '
                    'east of US-65 until Vicksburg drops below '
                    '${kHighWaterOffFt.toStringAsFixed(1)} ft.',
                    style: TextStyle(
                        color: Colors.red.shade800,
                        fontWeight: FontWeight.bold,
                        fontSize: 12),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    'LDWF rule: deer hunting east of US-65 goes archery-only '
                    'if Vicksburg reaches ${kHighWaterOnFt.toStringAsFixed(1)} ft '
                    '(back to normal below ${kHighWaterOffFt.toStringAsFixed(1)} ft).',
                    style:
                        TextStyle(color: Colors.grey.shade600, fontSize: 12),
                  ),
                ),
              Text(
                'Stages are recorded automatically on every check-in — see the '
                'Hunt Log to compare hunts against river levels.',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _gaugeRow(String name, GaugeStatus g) {
    final stage = g.observedFt;
    final (arrow, word) = switch (g.trend) {
      RiverTrend.rising => ('↗', 'rising'),
      RiverTrend.falling => ('↘', 'falling'),
      RiverTrend.steady => ('→', 'steady'),
      RiverTrend.unknown => ('', ''),
    };
    return Row(
      children: [
        SizedBox(width: 92, child: Text(name)),
        Text(
          stage == null ? '—' : '${stage.toStringAsFixed(1)} ft',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        if (word.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: Text('$arrow $word',
                style: TextStyle(color: Colors.blueGrey.shade600)),
          ),
      ],
    );
  }
}

/// Compact hour-by-hour table for the next 24 hours.
class _HourlyCard extends StatelessWidget {
  final Forecast forecast;
  const _HourlyCard({required this.forecast});

  @override
  Widget build(BuildContext context) {
    final now = forecast.indexForNow();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Next 24 hours',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            for (var i = now; i < forecast.hours.length; i++)
              _hourRow(forecast.hours[i], i == now),
          ],
        ),
      ),
    );
  }

  Widget _hourRow(HourlyWeather h, bool isNow) {
    final style = TextStyle(
      fontSize: 13,
      fontWeight: isNow ? FontWeight.bold : FontWeight.normal,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(width: 58, child: Text(_fmtHour(h.time), style: style)),
          SizedBox(width: 44, child: Text('${h.tempF.round()}°', style: style)),
          SizedBox(
            width: 82,
            child: Text('${cardinal(h.windDirDeg)} ${h.windMph.round()} mph',
                style: style),
          ),
          Expanded(
            child: Text('${h.cloudCoverPct.round()}% clouds',
                style: style.copyWith(color: Colors.grey.shade600)),
          ),
        ],
      ),
    );
  }

  String _fmtHour(DateTime dt) {
    final local = dt.toLocal();
    var hr = local.hour % 12;
    if (hr == 0) hr = 12;
    return '$hr ${local.hour >= 12 ? 'PM' : 'AM'}';
  }
}
