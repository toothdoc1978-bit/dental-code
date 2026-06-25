import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';

/// A searchable list of stands with live occupancy dots.
///
/// Shared by the wide-screen side panel and the narrow-screen bottom sheet.
/// Tapping a row sets [selectedStandProvider]; the map reacts to that.
class StandList extends ConsumerStatefulWidget {
  /// Optional scroll controller (supplied by DraggableScrollableSheet).
  final ScrollController? scrollController;

  const StandList({super.key, this.scrollController});

  @override
  ConsumerState<StandList> createState() => _StandListState();
}

class _StandListState extends ConsumerState<StandList> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final standsAsync = ref.watch(standsProvider);
    final occupied = ref.watch(occupiedStandIdsProvider);
    final selected = ref.watch(selectedStandProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              hintText: 'Search stand number…',
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            keyboardType: TextInputType.number,
            onChanged: (v) => setState(() => _query = v.trim()),
          ),
        ),
        Expanded(
          child: standsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Failed to load stands:\n$e')),
            data: (stands) {
              final filtered = _query.isEmpty
                  ? stands
                  : stands
                      .where((s) =>
                          s.id.toString().contains(_query) ||
                          (s.name?.toLowerCase() ?? '')
                              .contains(_query.toLowerCase()))
                      .toList();

              if (filtered.isEmpty) {
                return const Center(child: Text('No matching stands'));
              }

              return ListView.builder(
                controller: widget.scrollController,
                itemCount: filtered.length,
                itemBuilder: (context, i) {
                  final stand = filtered[i];
                  final isOccupied = occupied.contains(stand.id);
                  final isSelected = selected == stand.id;
                  return ListTile(
                    selected: isSelected,
                    selectedTileColor:
                        Theme.of(context).colorScheme.primary.withOpacity(0.08),
                    leading: CircleAvatar(
                      radius: 10,
                      backgroundColor:
                          isOccupied ? Colors.red : Colors.green,
                    ),
                    title: Text(
                      stand.label,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(isOccupied ? 'Occupied' : 'Available'),
                    trailing: isSelected
                        ? const Icon(Icons.my_location, size: 18)
                        : null,
                    onTap: () => ref
                        .read(selectedStandProvider.notifier)
                        .state = stand.id,
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
