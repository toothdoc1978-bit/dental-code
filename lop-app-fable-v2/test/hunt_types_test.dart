import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/data/hunt_types.dart';

void main() {
  test('bow-only stands allow only bow, crossbow, scouting', () {
    expect(allowedHuntTypes(bowOnly: true), ['Bow', 'Crossbow', 'Scouting']);
  });

  test('gold stands allow every hunt type', () {
    expect(allowedHuntTypes(bowOnly: false), kHuntTypes);
  });

  test('every deer method requires a count; non-deer methods do not', () {
    for (final t in ['Rifle', 'Suppressed Rifle', 'Muzzleloader', 'Bow', 'Crossbow']) {
      expect(requiresDeerCount(t), isTrue, reason: t);
    }
    for (final t in ['Squirrel', 'Duck', 'Hog', 'Scouting', 'Other']) {
      expect(requiresDeerCount(t), isFalse, reason: t);
    }
  });

  test('every deer type is a valid hunt type', () {
    for (final t in kDeerTypes) {
      expect(kHuntTypes, contains(t));
    }
  });
}
