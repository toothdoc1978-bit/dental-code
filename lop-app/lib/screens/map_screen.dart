import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../widgets/stand_action_panel.dart';
import '../widgets/stand_list.dart';

/// Breakpoint: at or above this width we show the list as a side panel,
/// below it we use a draggable bottom sheet over the map.
const double _wideBreakpoint = 720;

/// Esri World Imagery — free aerial tiles, well suited to a hunting property.
const String _esriImagery =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final MapController _mapController = MapController();

  /// Ray-casting point-in-polygon test (longitude = x, latitude = y).
  bool _pointInPolygon(LatLng point, List<LatLng> polygon) {
    bool inside = false;
    final n = polygon.length;
    for (int i = 0, j = n - 1; i < n; j = i++) {
      final xi = polygon[i].longitude, yi = polygon[i].latitude;
      final xj = polygon[j].longitude, yj = polygon[j].latitude;
      final intersect = ((yi > point.latitude) != (yj > point.latitude)) &&
          (point.longitude <
              (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  void _handleMapTap(List<Stand> stands, LatLng latlng) {
    for (final stand in stands) {
      if (_pointInPolygon(latlng, stand.polygon)) {
        ref.read(selectedStandProvider.notifier).state = stand.id;
        return;
      }
    }
    // Tapped empty ground — clear selection.
    ref.read(selectedStandProvider.notifier).state = null;
  }

  /// Builds the styled polygons for every stand based on occupancy + selection.
  List<Polygon> _buildPolygons(
    List<Stand> stands,
    Set<int> occupied,
    int? selectedId,
  ) {
    return stands.map((stand) {
      final isSelected = stand.id == selectedId;
      final isOccupied = occupied.contains(stand.id);

      late Color border;
      late Color fill;
      late double width;

      if (isSelected) {
        border = Colors.red;
        fill = Colors.red.withOpacity(0.35);
        width = 4;
      } else if (isOccupied) {
        border = Colors.red;
        fill = Colors.red.withOpacity(0.15);
        width = 2;
      } else {
        border = Colors.green;
        fill = Colors.green.withOpacity(0.15);
        width = 2;
      }

      return Polygon(
        points: stand.polygon,
        color: fill,
        borderColor: border,
        borderStrokeWidth: width,
        label: 'Stand ${stand.id}',
        labelStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final standsAsync = ref.watch(standsProvider);

    // When the selection changes, fit the camera to that stand.
    ref.listen<int?>(selectedStandProvider, (prev, next) {
      if (next == null) return;
      final stands = ref.read(standsProvider).valueOrNull;
      if (stands == null) return;
      final stand = stands.firstWhereOrNull((s) => s.id == next);
      if (stand == null) return;
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: stand.bounds,
          padding: const EdgeInsets.all(80),
          maxZoom: 17,
        ),
      );
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lookout Point Stands'),
        actions: [
          // Quick legend.
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Row(
              children: const [
                _LegendDot(color: Colors.green, label: 'Open'),
                SizedBox(width: 10),
                _LegendDot(color: Colors.red, label: 'Taken'),
              ],
            ),
          ),
        ],
      ),
      body: standsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load stands:\n$e')),
        data: (stands) {
          return LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth >= _wideBreakpoint;
              final map = _buildMap(stands);

              if (isWide) {
                return Row(
                  children: [
                    SizedBox(
                      width: 320,
                      child: Material(
                        elevation: 2,
                        child: Column(
                          children: [
                            const Expanded(child: StandList()),
                            _SelectedStandSlot(),
                          ],
                        ),
                      ),
                    ),
                    Expanded(child: map),
                  ],
                );
              }

              // Narrow: map fills the screen, list lives in a bottom sheet,
              // and the selected-stand action card floats above the sheet.
              return Stack(
                children: [
                  Positioned.fill(child: map),
                  const _FloatingSelectedStand(),
                  DraggableScrollableSheet(
                    initialChildSize: 0.28,
                    minChildSize: 0.12,
                    maxChildSize: 0.85,
                    builder: (context, scrollController) {
                      return Material(
                        elevation: 8,
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(16)),
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          children: [
                            const SizedBox(height: 6),
                            Container(
                              width: 40,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.black26,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            Expanded(
                              child: StandList(
                                scrollController: scrollController,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildMap(List<Stand> stands) {
    final occupied = ref.watch(occupiedStandIdsProvider);
    final selectedId = ref.watch(selectedStandProvider);

    // Center the initial view on all stands.
    final allPoints = [for (final s in stands) ...s.polygon];
    final initialFit = allPoints.isEmpty
        ? null
        : CameraFit.bounds(
            bounds: LatLngBounds.fromPoints(allPoints),
            padding: const EdgeInsets.all(40),
          );

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: const LatLng(32.6215, -91.1804), // LOP, East Carroll Parish
        initialZoom: 14,
        initialCameraFit: initialFit,
        onTap: (_, latlng) => _handleMapTap(stands, latlng),
      ),
      children: [
        TileLayer(
          urlTemplate: _esriImagery,
          userAgentPackageName: 'com.lookoutpoint.lop_app',
          maxNativeZoom: 19,
        ),
        PolygonLayer(
          polygons: _buildPolygons(stands, occupied, selectedId),
        ),
      ],
    );
  }
}

/// Side-panel slot that shows the action panel for the selected stand.
class _SelectedStandSlot extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedId = ref.watch(selectedStandProvider);
    final stands = ref.watch(standsProvider).valueOrNull ?? const [];
    if (selectedId == null) return const SizedBox.shrink();
    final stand = stands.firstWhereOrNull((s) => s.id == selectedId);
    if (stand == null) return const SizedBox.shrink();
    return StandActionPanel(stand: stand);
  }
}

/// Narrow-screen floating action card, pinned just above the bottom sheet.
class _FloatingSelectedStand extends ConsumerWidget {
  const _FloatingSelectedStand();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedId = ref.watch(selectedStandProvider);
    final stands = ref.watch(standsProvider).valueOrNull ?? const [];
    if (selectedId == null) return const SizedBox.shrink();
    final stand = stands.firstWhereOrNull((s) => s.id == selectedId);
    if (stand == null) return const SizedBox.shrink();

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: StandActionPanel(stand: stand),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(radius: 6, backgroundColor: color),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 13)),
      ],
    );
  }
}
