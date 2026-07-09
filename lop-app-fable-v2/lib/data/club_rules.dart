import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// CLUB RULES QUICK REFERENCE — 2023-24 season
//
// EDIT ME each August after the annual meeting: this one file is the whole
// rules screen. Plain wording on purpose — this is the "read it in the truck"
// version, not the legal document. The full PDF stays the official rules.
// ---------------------------------------------------------------------------

const String kRulesSeason = '2023–24 season';
const String kRulesDisclaimer =
    'Quick reference only — the full club rulebook is the official version. '
    'Updated after the annual meeting each August. When in doubt, ask a Board '
    'member BEFORE you shoot.';

/// The buck table — the thing guests get wrong. Kept separate so the screen
/// can style it as the centerpiece.
class BuckRule {
  final String title;
  final String allowance;
  final List<String> bullets;
  const BuckRule(this.title, this.allowance, this.bullets);
}

const List<BuckRule> kBuckRules = [
  BuckRule('Cull buck', '2 per membership (+ a bonus 3rd if the first two are legal)', [
    '3½ years old or older AND 7 points or fewer.',
    'An 8-point only counts as a cull if he is 4½+ years old AND scores UNDER 125".',
    'A 9-point is NEVER a cull — no exceptions.',
  ]),
  BuckRule('Management / trophy buck', '2 per membership', [
    '8-point: must score OVER 125" AND be 4½ years or older.',
    '9-point: must be 5½ years or older.',
  ]),
  BuckRule('Ten-point or better', '1 per membership', [
    'Must be 5½ years old or older. Age is the whole test — count points, then judge age.',
  ]),
  BuckRule('If you get it wrong', '', [
    '1st mistake: \$250 fine.',
    'Mistake on a management buck: you lose your next one (this season or next).',
    '3rd violation: loss of recreational rights for at least a year.',
  ]),
];

/// General sections, rendered in order.
class RuleSection {
  final String title;
  final IconData icon;
  final List<String> bullets;
  const RuleSection(this.title, this.icon, this.bullets);
}

const List<RuleSection> kRuleSections = [
  RuleSection('After the kill', Icons.checklist, [
    'Every buck is scored by 2 of the 6 club scorers — never score your own deer. A broken point still counts as a point.',
    'Pull the WHOLE lower jawbone before the deer leaves the property. Taking a buck off the property without it is a \$1,000 fine.',
    'Tag the jawbone and put it in the lockbox in the cooler (marked North or South property).',
    'Log everything in the DMAP book: sex, weight, antler measurements.',
    'Text a photo of every buck to the Board.',
    'Club biologists make the final age call.',
  ]),
  RuleSection('Does', Icons.female, [
    'Every membership starts the season with 2 doe tags.',
    'Log your harvest in the app/book to receive more tags (first come, first served from the club pool).',
    'Unused tags are collected around Dec 10 and redistributed.',
    'A lost or unreturned tag costs \$250.',
  ]),
  RuleSection('Stand times & the draw', Icons.schedule, [
    'Stand draws: 5:00 AM for morning hunts, 12:00 noon for evening hunts. Members draw before guests.',
    'Hunting all day (Yellow Tag)? Say so at the morning draw.',
    'Morning: be in your stand by daylight and STAY until 9:00 AM.',
    'Evening: be in your stand by 3:00 PM and stay until dark.',
    'Late to the stand = \$250 fine.',
    'Put your tag on the club map before you head out; take it down when you\'re back — that\'s how we know everyone came home safe.',
  ]),
  RuleSection('Getting around the property', Icons.directions_car, [
    'Stay on the main roads during hunting season.',
    'Park at least 200 yards from the nearest stand and out of sight of anyone\'s shooting lane.',
    'No cutting through someone else\'s hunting zone unless there is no other way.',
    'No off-road riding between 10 AM and 2 PM (except going to/from your hunting area).',
    'Night riding: main road only, 10 PM curfew (the sandbar is exempt). Coming back from an evening hunt, heading to a morning hunt, or retrieving a deer is always OK.',
    'Guns are completely UNLOADED in any vehicle or ATV. Under 18: cased too. A holstered handgun is OK for members.',
  ]),
  RuleSection('Guests', Icons.group, [
    'Max 2 guests per member, family included — 3 hunters total per membership in the woods (duck hunting counts).',
    'Your guest\'s deer count against YOUR totals.',
    'Everyone — member or guest — carries a valid Louisiana license.',
    'A guest caught trespassing beforehand is never welcome back.',
  ]),
  RuleSection('Plain don\'ts', Icons.block, [
    'No baiting. Trace mineral blocks and salt licks are the only exception. Bait found in a zone can close that zone.',
    'No cameras in hunting areas from Sept 1 to Feb 1.',
    'No shooting from any vehicle, ATV, or the main road. No shooting into the power-line food plot; stay 40 yards past the tree line off the main road.',
    'Never intentionally jump, drive, or chase deer or turkey (blood-trailing dogs for a wounded deer are OK).',
    'Bow-only areas (blue on the map): no guns except squirrel hunters. Zone 32 is a GUN area even though the map shades it blue.',
    'Duck hunting ends at 2 PM everywhere except the approved Mud Lake area (evening duck hunters wait until dark to come out).',
    'No littering — if you see it, pick it up. Game and fish remains go in the gut pit.',
    'Target practice only at the approved spot, 10 AM–2 PM during season.',
    'Minimum fine for any violation: \$250, due in 15 days.',
  ]),
];

/// "Judging a mature buck" — the field guide for guests and newer members.
/// Uses REAL club trail-cam photos (drop them in assets/rules/), never
/// AI-generated deer: generated images get antler and body details subtly
/// wrong and would teach the wrong cues.
const String kAgingIntro =
    'Our buck rules run on AGE, not just antlers. Before you shoot, judge the '
    'body first. This photo shows a 4½-year-old (left) next to a 5½-year-old '
    '(right) here on the property.';

const List<String> kAgingCues = [
  'Belly: a mature buck\'s belly line sags level with or below his chest. A young buck is trim like a doe.',
  'Neck: in the rut, a 4½+ buck\'s neck swells into his chest and brisket with no clear line between them.',
  'Back: older bucks look swayed in the back with a deeper mid-body; young bucks look flat and athletic.',
  'Legs: if his legs look long and lanky for his body, he\'s young. Mature bucks look short-legged because the body has caught up.',
  'Face/attitude: mature bucks have a Roman nose, squinty look, and walk stiff, like they own the place.',
  'Rule of thumb: if you\'re not SURE he\'s mature, he isn\'t. Let him walk — he\'ll be bigger next year.',
];
