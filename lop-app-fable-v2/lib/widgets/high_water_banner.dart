import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/app_providers.dart';

/// Amber strip shown everywhere it matters while the LDWF Area 1 high-water
/// rule is in effect: Vicksburg >= 43.0 ft means archery only for deer east
/// of US-65 until the stage drops below 41.0 ft.
class HighWaterBanner extends ConsumerWidget {
  const HighWaterBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!ref.watch(highWaterProvider)) return const SizedBox.shrink();
    return Material(
      color: Colors.amber.shade700,
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.water, color: Colors.black87, size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'HIGH WATER — archery only for deer (LDWF rule, '
                'Vicksburg ≥ 43 ft)',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.black87),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
