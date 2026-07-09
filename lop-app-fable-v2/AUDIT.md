# Fable improvement pass — audit & change log

Expert review of the LOP app performed on branch `fable-improved-v1`, in the
isolated copy `lop-app-fable-v2/` (the original `lop-app/` folder is untouched).
Every change below was verified with `flutter analyze` (0 issues) and
`flutter test` (35 tests, all passing) after each stage.

## Audit

### Strengths (kept as-is)
- Clean layering: models / data / services / providers / screens / widgets.
- Zero-cost integrations: keyless Open-Meteo + NOAA NWPS, cached to single
  shared Firestore docs so one member's fetch serves the whole club.
- Firestore offline persistence → check-in works with no signal in the field.
- Denormalized hunt docs (member name/phone inline) → zero-join reads.
- Scent physics isolated in a pure, unit-tested function.
- Hollow-ring map pins keep the printed stand numbers visible.

### Issues found (and what was done)
| # | Finding | Action |
|---|---------|--------|
| 1 | Wind/scent chip used `hours.first` — up to 2h stale after a cache refresh window | Added `Forecast.indexForNow()`; used by the chip, the map hour slider default, and list→map jumps |
| 2 | Hunt data (deer counts, river stages, times) was recorded but never shown anywhere | New **Hunt Log** screen: season totals + per-day history, "Mine" filter |
| 3 | River levels invisible until after you checked in | New shared `riverStatus/current` cache (1h TTL) + home chip with rising/falling arrows (observed vs NOAA forecast stage) |
| 4 | "elapsed" in the my-hunt banner froze at its first render | Banner now re-renders every minute |
| 5 | Search couldn't find *people*, only stand numbers | Search now matches occupant names too |
| 6 | No way to jump from the list to a stand's spot on the map | Map button on every list row → full map with that stand's scent cone selected |
| 7 | Opening the map while checked in showed nothing selected | Auto-selects *your* stand (cone appears immediately) |
| 8 | Firestore rules let any signed-in device rewrite anyone's hunt, out-of-range pins, arbitrary cache blobs | Tightened: owner-only checkout-field-only hunt updates, immutable history, pin coords bounded 0–1 with stand-code doc IDs, cache docs shape-checked |
| 9 | Check-in/out gave no tactile confirmation | Haptic feedback on success |
| 10 | Deprecated `withOpacity`, unused imports, dangling doc comments | Cleaned; `flutter analyze` is now 0 issues (min Flutter raised to 3.27) |
| 11 | Repo didn't compile standalone (`firebase_options.dart` missing) | Clearly-marked placeholder added; `flutterfire configure` overwrites it |
| 12 | Only 9 tests, no UI coverage | 35 tests now: format/hunt-type/forecast-index/river-parse units + 5 widget smoke tests that pump the real screens with faked providers |

### Deliberately NOT changed (with reasons)
- **Check-in race** (two hunters submitting for the same stand in the same
  second): the query-then-write pattern is kept because a Firestore transaction
  would **break offline check-in**, which matters more in the field than a
  race that's vanishingly rare in a 36-member club. Documented trade-off.
- **Stripe/payment flows**: recommend against — collecting dues in-app drags in
  App Store IAP rules and PCI questions; a Venmo/check stays simpler for a
  private club.
- **Cloud Functions**: still avoided; everything stays on the free Spark plan.

### MCP servers — honest status
- **GitHub MCP**: connected (scoped to `toothdoc1978-bit/dental-code`, which is
  where this branch lives) — used for the draft PR.
- **Playwright MCP**: not connected in this environment, and Playwright drives
  browsers — it cannot exercise a native Flutter iOS/Android app. Equivalent
  coverage implemented as Flutter **widget smoke tests** (`test/ui_smoke_test.dart`),
  run after every change.
- **Supabase/Firestore-connector MCP**: not connected; schema/rules changes
  validated by review + the rules comments. Deploy rules from the Firebase console.
- **Stripe MCP**: not connected; feature declined (see above).

## Follow-up: thermal engine upgrade (from Chad's TypeScript prototype)
A proposed `thermals.ts` microclimate engine was reviewed. Rejected as-is:
inverted thermal vector sign (its own unit test fails against its math — the
"7 mph north" case actually computes 1 mph south), a phase clock that labels
peak-heating afternoon (12:00–18:00) as "evening down draft," and slope/aspect/
canopy inputs that don't exist for flat delta ground. Two ideas were genuinely
better than our physics and were ported into `scent_vector.dart`:
1. **Smooth 4–10 mph thermal "blowout" ramp** (`thermalWeight()`) replacing the
   hard 5 mph cliff — the cone now swings gradually as the breeze builds.
2. **Speed-weighted vector summation** — ambient wind at its real mph vs a
   thermal of up to 4 mph, replacing the fixed 25/75 blend, so a 4 mph breeze
   bends the cone far more than a 1 mph breath.
Temperature-trend-driven phases (better than any clock) and the drainage
heading (the flat-ground "aspect") were kept. All 6 original physics tests
pass unchanged; 4 new tests cover the ramp, blowout, and blend behavior.

## Follow-up 2: cloud cover + river water temperature
- **Cloud cover** (hourly, same free Open-Meteo call): thermals are radiative,
  so a `skyFactor` throttles thermal strength from 100% (clear) to 30%
  (overcast). Cached forecast docs written before the field existed default to
  a neutral 50%.
- **River water temperature** (river-edge stands only): the Vicksburg and
  Greenville gauges don't report water temp (verified — empty USGS 00010
  series), so it comes from Baton Rouge (USGS 07374000), the nearest reporting
  station; lower-river water temp varies slowly along the reach. Cached in the
  same `riverStatus/current` doc. Physics: water >2°F warmer than the air adds
  up to 2 mph of extra drain toward the river during cooling/slack hours; water
  >2°F colder adds up to 2 mph of inland river breeze during warming hours.
  Wind blowout still applies; clouds do not (water-driven, not sun-driven).
- **River-edge stands** are listed in `kRiverEdgeStandCodes` (config.dart),
  seeded by reading the aerial (river wraps the east + south boundaries) —
  flagged for Chad to correct. The scent panel shows "river-edge (water NN°F)"
  when the adjustment is active so mislabeled stands are easy to spot.
- Tests: 46 total; all 10 pre-existing physics tests pass unchanged.

## Follow-up 3: usability pass from member feedback (web launch)
- **Map pins → colored numbers**: the fixed 26 px rings swamped iPhone screens.
  Pins are now compact stand-number badges — green (open) / red (in use) /
  orange (placing) on a translucent white pill, sized relative to map width
  (clamped 7–12 px font) with a padded finger-size tap target. *My* stand is a
  solid green pill with white text; the scent-selected stand gets an amber
  outline.
- **Check-out made obvious**: my stand-list row shows a red **Check Out**
  button; the map scent panel's button turns into a bold red **Check Out** when
  the selected stand is mine; tapping my own stand on the map opens the
  check-out sheet directly. (Banner unchanged — it already had one.)
- **Conditions screen** (`lib/screens/conditions_screen.dart`): wind/scent and
  river chips are gone from the home status row (member feedback: too
  prominent). Home now shows open/in-use counts + a "Conditions" chip (and a
  cloud icon in the app bar) leading to: current temp/wind/clouds/scent
  behavior, an hour-by-hour 24 h table, and the river card (stages, trends,
  water temp). No new data fetches — it reads the same cached providers.
- Tests: 48 total (Conditions screen render, check-out button row, home
  chip changes).

## Verification log
- Baseline: analyze 0 errors / 11 infos; 9/9 tests pass.
- After feature work: analyze **0 issues**; **35/35 tests pass**
  (units + widget smoke tests).
