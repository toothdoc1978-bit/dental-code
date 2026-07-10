import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/data/hunt_types.dart';

void main() {
  group('allowedMethods', () {
    test('bow-only stands restrict to archery/none for most activities', () {
      expect(allowedMethods(activity: 'Deer', bowOnly: true),
          ['Bow', 'Crossbow']);
      expect(allowedMethods(activity: 'Scouting', bowOnly: true), ['None']);
    });

    test('squirrel is exempt from the bow-only restriction (club rule)', () {
      expect(allowedMethods(activity: 'Squirrel', bowOnly: true),
          ['Rifle', 'Shotgun', 'Bow']);
      expect(
        allowedMethods(activity: 'Squirrel', bowOnly: true),
        allowedMethods(activity: 'Squirrel', bowOnly: false),
      );
    });

    test('duck has no legal method on a bow-only stand (shotgun only)', () {
      expect(allowedMethods(activity: 'Duck', bowOnly: true), isEmpty);
      expect(allowedMethods(activity: 'Duck', bowOnly: false), ['Shotgun']);
    });

    test('high water strips deer firearms but leaves other activities alone',
        () {
      final deer =
          allowedMethods(activity: 'Deer', bowOnly: false, highWater: true);
      expect(deer, ['Bow', 'Crossbow']);

      for (final activity in ['Hog', 'Squirrel', 'Duck', 'Turkey']) {
        expect(
          allowedMethods(activity: activity, bowOnly: false, highWater: true),
          allowedMethods(activity: activity, bowOnly: false, highWater: false),
          reason: '$activity should be unaffected by high water',
        );
      }
    });

    test('high water + bow-only combine correctly for deer', () {
      expect(
        allowedMethods(activity: 'Deer', bowOnly: true, highWater: true),
        ['Bow', 'Crossbow'],
      );
    });

    test('unknown activity falls back to every method (fail-open, not shut)',
        () {
      expect(allowedMethods(activity: 'Nonexistent', bowOnly: false),
          kMethods);
    });
  });

  group('allowedActivities', () {
    test('every activity is offered on a gold stand', () {
      expect(allowedActivities(bowOnly: false), kActivities);
    });

    test('bow-only stands hide activities with no legal bow-only method',
        () {
      final activities = allowedActivities(bowOnly: true);
      expect(activities, isNot(contains('Duck'))); // shotgun-only
      // These all have a bow/crossbow/none path, so they stay offered.
      expect(activities,
          containsAll(['Deer', 'Squirrel', 'Hog', 'Turkey', 'Scouting']));
    });

    test('no activity is ever offered with zero legal methods', () {
      for (final bowOnly in [true, false]) {
        for (final highWater in [true, false]) {
          for (final a
              in allowedActivities(bowOnly: bowOnly, highWater: highWater)) {
            expect(
              allowedMethods(activity: a, bowOnly: bowOnly, highWater: highWater),
              isNotEmpty,
              reason: '$a (bowOnly=$bowOnly, highWater=$highWater)',
            );
          }
        }
      }
    });
  });

  test('only Deer requires a count at checkout', () {
    expect(requiresDeerCount('Deer'), isTrue);
    for (final a in ['Duck', 'Squirrel', 'Hog', 'Turkey', 'Scouting',
        'Camera Service', 'Other']) {
      expect(requiresDeerCount(a), isFalse, reason: a);
    }
  });

  group('huntLabel', () {
    test('shows activity + method', () {
      expect(huntLabel('Deer', 'Bow'), 'Deer · Bow');
    });

    test('drops the method entirely when it is None', () {
      expect(huntLabel('Scouting', 'None'), 'Scouting');
      expect(huntLabel('Camera Service', 'None'), 'Camera Service');
    });
  });
}
