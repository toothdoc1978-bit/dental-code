import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

/// A hunting stand parcel loaded from the GeoJSON FeatureCollection.
///
/// The GeoJSON contract:
///   - `properties.stand_id` is an integer (the stand number members know it by)
///   - `geometry` is a Polygon whose coordinates are `[longitude, latitude]`
///     pairs (GeoJSON order), which we convert to `LatLng(lat, lng)`.
class Stand {
  /// The stand number (e.g. 12). Unique within the club.
  final int id;

  /// The outer ring of the parcel as map points, ready for flutter_map.
  final List<LatLng> polygon;

  /// Any extra GeoJSON properties (name, acreage, etc.) kept verbatim.
  final Map<String, dynamic> properties;

  const Stand({
    required this.id,
    required this.polygon,
    required this.properties,
  });

  /// Optional human-friendly name from the GeoJSON, if present.
  String? get name => properties['name'] as String?;

  /// A short label for lists and markers, e.g. "Stand 12" or "Stand 12 · River Bend".
  String get label =>
      name == null ? 'Stand $id' : 'Stand $id · $name';

  /// Geometric centroid (simple vertex average) — good enough for labels
  /// and as a zoom target.
  LatLng get centroid {
    double lat = 0, lng = 0;
    for (final p in polygon) {
      lat += p.latitude;
      lng += p.longitude;
    }
    final n = polygon.length;
    return LatLng(lat / n, lng / n);
  }

  /// Bounding box of the parcel, used to fit the map camera to the stand.
  LatLngBounds get bounds => LatLngBounds.fromPoints(polygon);

  /// Builds a [Stand] from a single GeoJSON Feature map.
  ///
  /// Returns `null` if the feature is missing a valid integer `stand_id`
  /// or is not a Polygon — callers should skip nulls defensively.
  static Stand? fromFeature(Map<String, dynamic> feature) {
    final props = (feature['properties'] as Map?)?.cast<String, dynamic>() ?? {};
    final geometry = feature['geometry'] as Map?;
    if (geometry == null) return null;
    if (geometry['type'] != 'Polygon') return null;

    final rawId = props['stand_id'];
    final id = rawId is int ? rawId : int.tryParse('$rawId');
    if (id == null) return null;

    // coordinates: [ [ [lng, lat], [lng, lat], ... ] ]  (only the outer ring)
    final coords = geometry['coordinates'] as List?;
    if (coords == null || coords.isEmpty) return null;
    final outerRing = coords.first as List;

    final points = <LatLng>[];
    for (final pair in outerRing) {
      final list = pair as List;
      final lng = (list[0] as num).toDouble();
      final lat = (list[1] as num).toDouble();
      points.add(LatLng(lat, lng));
    }
    if (points.length < 3) return null;

    return Stand(id: id, polygon: points, properties: props);
  }
}
