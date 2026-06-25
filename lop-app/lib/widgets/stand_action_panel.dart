import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../services/firestore_service.dart';
import '../screens/check_out_sheet.dart';

/// Bottom action card for the currently-selected stand.
///
/// Shows the big context-aware button:
///   - "Check In"  — stand is free and I have no active hunt
///   - "Check Out" — this is my active hunt
///   - "Occupied"  — someone else holds it (disabled)
///   - "Finish your other stand first" — I'm checked in elsewhere (disabled)
class StandActionPanel extends ConsumerWidget {
  final Stand stand;
  const StandActionPanel({super.key, required this.stand});

  Future<void> _checkIn(BuildContext context, WidgetRef ref) async {
    final uid = ref.read(authUidProvider);
    if (uid == null) return;
    try {
      await ref
          .read(firestoreServiceProvider)
          .checkIn(standId: stand.id, userId: uid);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Checked in to Stand ${stand.id}')),
        );
      }
    } on StandOccupiedException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final occupied = ref.watch(occupiedStandIdsProvider);
    final myHunt = ref.watch(myActiveHuntProvider).valueOrNull;

    final isOccupied = occupied.contains(stand.id);

    Widget button;
    if (myHunt != null && myHunt.standId == stand.id) {
      // This is my active hunt — offer Check Out. (myHunt is promoted here.)
      final activeHunt = myHunt;
      button = FilledButton.icon(
        style: FilledButton.styleFrom(
          backgroundColor: Colors.red.shade700,
          minimumSize: const Size.fromHeight(56),
        ),
        icon: const Icon(Icons.logout),
        label: const Text('Check Out', style: TextStyle(fontSize: 18)),
        onPressed: () => showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          builder: (_) => CheckOutSheet(hunt: activeHunt),
        ),
      );
    } else if (isOccupied) {
      button = FilledButton.icon(
        style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(56)),
        icon: const Icon(Icons.block),
        label: const Text('Occupied', style: TextStyle(fontSize: 18)),
        onPressed: null,
      );
    } else if (myHunt != null) {
      // I'm checked in at a different stand — block until I finish there.
      button = FilledButton.icon(
        style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(56)),
        icon: const Icon(Icons.info_outline),
        label: Text('Finish Stand ${myHunt.standId} first',
            style: const TextStyle(fontSize: 16)),
        onPressed: null,
      );
    } else {
      button = FilledButton.icon(
        style: FilledButton.styleFrom(
          backgroundColor: Colors.green.shade700,
          minimumSize: const Size.fromHeight(56),
        ),
        icon: const Icon(Icons.login),
        label: const Text('Check In', style: TextStyle(fontSize: 18)),
        onPressed: () => _checkIn(context, ref),
      );
    }

    return Card(
      margin: const EdgeInsets.all(12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 8,
                  backgroundColor: isOccupied ? Colors.red : Colors.green,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    stand.label,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Clear selection',
                  onPressed: () =>
                      ref.read(selectedStandProvider.notifier).state = null,
                ),
              ],
            ),
            const SizedBox(height: 12),
            button,
          ],
        ),
      ),
    );
  }
}
