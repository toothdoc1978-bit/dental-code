import 'package:flutter/material.dart';

/// Hunt types a member can pick at check-in.
const List<String> kHuntTypes = [
  'Rifle',
  'Suppressed Rifle',
  'Muzzleloader',
  'Bow',
  'Crossbow',
  'Squirrel',
  'Duck',
  'Hog',
  'Scouting',
  'Other',
];

/// On a bow-only stand, only these are allowed.
const List<String> kBowOnlyTypes = ['Bow', 'Crossbow', 'Scouting'];

/// Deer-hunting methods. Checking out of one of these REQUIRES entering a deer
/// count (does / bucks / fawns) before the member can finish.
const Set<String> kDeerTypes = {
  'Rifle',
  'Suppressed Rifle',
  'Muzzleloader',
  'Bow',
  'Crossbow',
};

/// The hunt types allowed on a stand of the given kind.
List<String> allowedHuntTypes({required bool bowOnly}) =>
    bowOnly ? kBowOnlyTypes : kHuntTypes;

/// Whether checking out of [huntType] requires a deer count.
bool requiresDeerCount(String huntType) => kDeerTypes.contains(huntType);

/// A small icon for each hunt type (decorative).
IconData huntTypeIcon(String type) {
  switch (type) {
    case 'Rifle':
    case 'Suppressed Rifle':
      return Icons.gps_fixed;
    case 'Muzzleloader':
      return Icons.whatshot;
    case 'Bow':
    case 'Crossbow':
      return Icons.arrow_outward;
    case 'Squirrel':
      return Icons.pets;
    case 'Duck':
      return Icons.flutter_dash;
    case 'Hog':
      return Icons.savings;
    case 'Scouting':
      return Icons.visibility;
    default:
      return Icons.more_horiz;
  }
}
