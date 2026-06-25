import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/stand.dart';

void main() {
  group('Stand.fromFeature', () {
    test('parses a valid Polygon feature with an int stand_id', () {
      final feature = {
        'type': 'Feature',
        'properties': {'stand_id': 12, 'name': 'River Bend'},
        'geometry': {
          'type': 'Polygon',
          'coordinates': [
            [
              [-91.18, 32.62],
              [-91.17, 32.62],
              [-91.17, 32.61],
              [-91.18, 32.61],
              [-91.18, 32.62],
            ]
          ]
        }
      };

      final stand = Stand.fromFeature(feature);
      expect(stand, isNotNull);
      expect(stand!.id, 12);
      expect(stand.name, 'River Bend');
      expect(stand.polygon.length, greaterThanOrEqualTo(4));
      // GeoJSON [lng, lat] must become LatLng(lat, lng).
      expect(stand.polygon.first.latitude, 32.62);
      expect(stand.polygon.first.longitude, -91.18);
    });

    test('returns null for non-Polygon geometry', () {
      final feature = {
        'properties': {'stand_id': 1},
        'geometry': {
          'type': 'Point',
          'coordinates': [-91.18, 32.62]
        }
      };
      expect(Stand.fromFeature(feature), isNull);
    });

    test('returns null when stand_id is missing', () {
      final feature = {
        'properties': {'name': 'No id'},
        'geometry': {
          'type': 'Polygon',
          'coordinates': [
            [
              [-91.18, 32.62],
              [-91.17, 32.62],
              [-91.17, 32.61],
              [-91.18, 32.62],
            ]
          ]
        }
      };
      expect(Stand.fromFeature(feature), isNull);
    });
  });

  test('bundled assets/stands.geojson has 5 valid stands', () {
    // Read the real asset directly from disk (test runs from project root).
    final raw = File('assets/stands.geojson').readAsStringSync();
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    final features = decoded['features'] as List;

    final stands = features
        .map((f) => Stand.fromFeature((f as Map).cast<String, dynamic>()))
        .whereType<Stand>()
        .toList();

    expect(stands.length, 5);
    for (final s in stands) {
      expect(s.id, isA<int>());
      expect(s.polygon.length, greaterThanOrEqualTo(4));
    }
    // Unique stand numbers.
    expect(stands.map((s) => s.id).toSet().length, 5);
  });
}
