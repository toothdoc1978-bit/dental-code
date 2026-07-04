// Tunable constants for the scent-drift feature and river gauges.

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
