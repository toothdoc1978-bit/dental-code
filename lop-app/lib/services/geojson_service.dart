import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import '../models/stand.dart';

/// Loads and parses the bundled stands GeoJSON into [Stand] objects.
class GeojsonService {
  static const String _assetPath = 'assets/stands.geojson';

  /// Reads `assets/stands.geojson`, parses the FeatureCollection, and returns
  /// every valid stand. Invalid / non-Polygon features are skipped.
  Future<List<Stand>> loadStands() async {
    final raw = await rootBundle.loadString(_assetPath);
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    final features = (decoded['features'] as List?) ?? const [];

    final stands = <Stand>[];
    for (final f in features) {
      final stand = Stand.fromFeature((f as Map).cast<String, dynamic>());
      if (stand != null) stands.add(stand);
    }
    // Keep a stable, predictable order by stand number.
    stands.sort((a, b) => a.id.compareTo(b.id));
    return stands;
  }
}
