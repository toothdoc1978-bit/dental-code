// Tunable constants for the scent-drift feature, river gauges, high-water
// rule, and admin access.

/// Shown in-app so you can tell at a glance which build is deployed.
const String kAppVersion = 'v2.5';

/// Every active hunt is auto-checked-out daily at this hour (24h clock).
/// Enforced client-side: the first running app past the hour sweeps the board.
const int kAutoCheckoutHour = 20; // 8 PM

/// Members who see Admin controls (high-water override). UI-level gating —
/// fine for a trusted club on anonymous auth.
const Set<String> kAdminMemberIds = {'m27'}; // Chad Gardner

/// LDWF Area 1 high-water rule: when the Mississippi at Vicksburg reaches
/// 43.0 ft during deer season, land east of US-65 (all of Lookout Point)
/// becomes ARCHERY ONLY for deer. Normal methods resume once the stage drops
/// below 41.0 ft. The gap between the two numbers (hysteresis) stops the app
/// from flip-flopping while the river hovers near the line.
const double kHighWaterOnFt = 43.0;
const double kHighWaterOffFt = 41.0;

/// Degrees to rotate scent headings to match the aerial photo's orientation.
/// 0 = the photo is north-up (the Eagle Forestry aerial's compass points up).
const double kMapNorthOffsetDegrees = 0;

/// Default drainage heading (compass degrees) — the direction heavy, sinking
/// evening air drains toward. 90° = East, toward the Mississippi River.
const double kDrainageHeading = 90;

/// NOAA NWPS river-gauge IDs recorded at each check-in (observed stage, ft).
/// Vicksburg, MS and Greenville, MS on the Mississippi River.
const String kVicksburgGaugeLid = 'VCKM6';
const String kGreenvilleGaugeLid = 'GEEM6';

/// USGS station for Mississippi water temperature (parameter 00010). The
/// Vicksburg/Greenville gauges don't report temperature; Baton Rouge is the
/// nearest station that does, and lower-river water temp changes slowly along
/// the reach, so it's a fair proxy for the water off Lookout Point.
const String kWaterTempUsgsSite = '07374000';

/// Stands whose ground borders the Mississippi River (east + south property
/// lines on the aerial). Only these get the water-temperature thermal
/// adjustment — warm water strengthens the evening drain toward the river;
/// cold water can push a light river breeze inland on warm afternoons.
///
/// EDIT ME: seeded from reading the Eagle Forestry aerial; Chad should
/// add/remove codes to match the ground truth.
const Set<String> kRiverEdgeStandCodes = {
  // North/east boundary, top of the map down the east side.
  '1', '2', '3',
  '1B', '3B', '4B', '5B', '6B', '7B', '12B', '13B', '17B',
  // East/southeast boundary below the bow-only block.
  '41', '42', '43', '44', '45', '46',
  // South boundary along the river bend.
  '31B', '32B', '33B', '34B', '35B',
  // Southwest block along the lower river bend.
  '71', '74', '85', '86', '87', '88', '89', '90',
};
