import 'package:flutter/material.dart';

/// WHAT you're doing, chosen first at check-in.
const List<String> kActivities = [
  'Deer',
  'Duck',
  'Squirrel',
  'Hog',
  'Turkey',
  'Scouting',
  'Camera Service',
  'Other',
];

/// HOW you're doing it, chosen second (only the legal subset is offered —
/// see [allowedMethods]).
const List<String> kMethods = [
  'Rifle',
  'Suppressed Rifle',
  'Primitive Firearm',
  'Shotgun',
  'Bow',
  'Crossbow',
  'None',
];

/// Which methods are legal for each activity, before stand/high-water rules
/// are applied. EDIT ME each season if LDWF regulations or club rules change
/// — this is the one place that encodes them.
const Map<String, List<String>> kActivityMethods = {
  'Deer': ['Rifle', 'Suppressed Rifle', 'Primitive Firearm', 'Bow', 'Crossbow'],
  'Duck': ['Shotgun'],
  'Squirrel': ['Rifle', 'Shotgun', 'Bow'],
  'Hog': [
    'Rifle', 'Suppressed Rifle', 'Primitive Firearm', 'Shotgun', 'Bow',
    'Crossbow',
  ],
  'Turkey': ['Shotgun', 'Bow', 'Crossbow'],
  'Scouting': ['None'],
  'Camera Service': ['None'],
  'Other': kMethods,
};

/// Methods allowed on a bow-only stand. Squirrel is exempt (club rule: guns
/// allowed for squirrel hunters even in bow-only areas) — handled separately
/// in [allowedMethods], not via this set.
const Set<String> kBowOnlyMethods = {'Bow', 'Crossbow', 'None'};

/// Deer methods that survive the LDWF Area 1 high-water rule (archery only).
const Set<String> kHighWaterDeerMethods = {'Bow', 'Crossbow'};

/// The legal methods for [activity] on this stand right now. Bow-only stands
/// restrict to archery/none (except Squirrel, per the club's own exception);
/// high water further restricts Deer specifically to archery, leaving every
/// other activity untouched (the actual LDWF rule only restricts deer).
List<String> allowedMethods({
  required String activity,
  required bool bowOnly,
  bool highWater = false,
}) {
  var methods = kActivityMethods[activity] ?? kMethods;
  if (bowOnly && activity != 'Squirrel') {
    methods = methods.where((m) => kBowOnlyMethods.contains(m)).toList();
  }
  if (highWater && activity == 'Deer') {
    methods = methods.where((m) => kHighWaterDeerMethods.contains(m)).toList();
  }
  return methods;
}

/// The activities worth offering on this stand right now — excludes any
/// activity that would have zero legal methods (e.g. Duck on a bow-only
/// stand), so a member never picks an activity that leads to a dead end.
List<String> allowedActivities({required bool bowOnly, bool highWater = false}) {
  return kActivities
      .where((a) => allowedMethods(
              activity: a, bowOnly: bowOnly, highWater: highWater)
          .isNotEmpty)
      .toList();
}

/// Whether checking out of [activity] requires a deer count.
bool requiresDeerCount(String activity) => activity == 'Deer';

/// "Deer · Bow", but just "Scouting" when the method is 'None' (no weapon).
String huntLabel(String activity, String method) =>
    method == 'None' ? activity : '$activity · $method';

/// A small icon for each activity (decorative).
IconData activityIcon(String activity) {
  switch (activity) {
    case 'Deer':
      return Icons.gps_fixed;
    case 'Duck':
      return Icons.flutter_dash;
    case 'Squirrel':
      return Icons.pets;
    case 'Hog':
      return Icons.savings;
    case 'Turkey':
      return Icons.forest;
    case 'Scouting':
      return Icons.visibility;
    case 'Camera Service':
      return Icons.videocam;
    default:
      return Icons.more_horiz;
  }
}
