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

## Follow-up 4: high-water law, club rules screen, logo, version stamp
- **LDWF Area 1 high-water rule** (`clubStatus/current` doc): when Vicksburg
  hits ≥ 43.0 ft, deer hunting east of US-65 goes archery-only until the stage
  drops below 41.0 ft. Implemented with hysteresis
  (`RiverService.resolveHighWater`, pure/tested) driven by the existing hourly
  gauge fetch; Rifle/Suppressed Rifle/Muzzleloader disappear from check-in
  everywhere while active; amber banner on home + map; note in Conditions.
  **Admin override (Chad, member m27 — `kAdminMemberIds`)**: Auto / Force ON /
  Force OFF segmented control in Conditions. Honest note: with anonymous auth,
  admin gating is app-level, appropriate for a trusted club.
- **Club Rules screen**: quick-reference distilled from the 2023-24 rules PDF
  at ~10th-grade reading level — buck criteria (cull vs management vs 10-pt),
  post-kill protocol, does, stand times/draws, riding, guests, don'ts, fines.
  Content in one editable file (`lib/data/club_rules.dart`, refresh each
  August). Reached from the home overflow menu and a link on the member picker
  (guests can read before picking a name).
- **Judging-a-mature-buck section**: included (the buck rules hinge on aging);
  uses REAL club trail-cam photos (drop-in `assets/rules/buck_45_55.jpg`),
  deliberately NOT AI-generated imagery — generated deer get anatomy subtly
  wrong and would teach wrong cues.
- **Logo** (`assets/lop_logo.png`, drop-in): member picker + rules headers.
- **Version stamp** `kAppVersion` (member picker + Conditions footer) so a
  stale web deploy is instantly identifiable — this diagnosed the "old circles
  still showing" report (stale hosting deploy, not a code regression).

## Follow-up 5: "Place stands" feature retired
All 130 pins are placed, so the placement FAB/mode/picker were removed from
home, the map screen, and the map widget (plus the two placement providers and
the two Firestore write methods). `standPositions` is now **read-only in the
security rules** — pins can't be moved or deleted by any client; corrections
go through the Firebase console. Note: older installed builds (the original
iPad app) still contain the placement UI, but the read-only rules make it
inert once published.

## Follow-up 6: member-identity ownership, 8 PM auto-checkout, admin clear (v2.3)
- **Ownership bug fix**: "mine" was keyed to the device's anonymous auth uid,
  so a hunt started on one device looked like a stranger's on another (no
  banner, no checkout, could double-check-in). Now keyed to the chosen
  member id everywhere (`myActiveHuntProvider`, list rows, map pins, panel,
  detail sheet), and `checkIn()` blocks a member who already has an active
  hunt on ANY device (`AlreadyCheckedInException`). Rules: hunts update drops
  the device-owner check (member identity is self-declared under anon auth
  anyway) but keeps one-way active→false + field whitelist + count bounds.
- **8 PM auto-checkout**: client-side sweep (`shouldAutoClose` pure +
  `autoCheckoutSweep`), run at startup and every 15 min; closes hunts past
  the most recent 8 PM cutoff with `autoClosed: true` (deer counts forfeited).
  Hunts started after 8 PM survive until the next evening. Forgot-to-check-out
  members get a dismissible amber notice on home (per-hunt ack in
  SharedPreferences); hunt-log rows show "· auto 8 PM". In-app notice chosen
  over push (free, no Blaze); FCM push is the future upgrade path.
- **Admin "End all active hunts now"** in the Conditions admin card (confirm
  dialog) — clears test data or a stuck board in one tap.

## Follow-up 7: field-testing feedback (v2.4)
Chad tested v2.3 in the field and reported five things (see conversation for
his full write-up and my point-by-point response). Researched with three
parallel Explore agents before designing, then a Plan-agent design review
that caught a real bug in the initial fix for #2 before it shipped.

- **Hunt Log ownership bug (confirmed, fixed)**: `hunt_log_screen.dart` was
  the one screen still checking `hunt.userId == uid` (device id) instead of
  `hunt.memberId == member.id` (person id) — missed in the v2.3 migration.
  A hunt started on one device wasn't showing as "mine" in Hunt Log on
  another. One-line fix.
- **Non-blocking check-in**: check-in used to `await` two live 4s-timeout
  HTTPS calls to NOAA before writing anything, and on a timeout recorded the
  hunt with NO river data even if a good cached reading existed. Now reads
  the already-cached `riverStatus/current` value synchronously — zero network
  calls, and more reliable (a momentary NOAA outage can't null out a fresh
  cache read). **Bug caught by design review before shipping**: Riverpod
  `StreamProvider`s only start their subscription on first read — if
  check-in were the first thing to ever read `riverStatusProvider` in a
  session, it would've gotten `null` (worse than the old blocking call).
  Fixed by eagerly `ref.watch`-ing it in `HomeScreen.build()` so it's warm
  before anyone can reach a stand. `Hunt` gained `riverObservedAt` (the
  cached reading's timestamp) so the UI can show "reading was 47m old at
  check-in" instead of implying a live-exact read; kept both
  `riverVicksburgFt`/`riverGreenvilleFt` as separate fields per the original
  dual-gauge spec, rather than collapsing to one field as first proposed.
  The existing 15-min auto-checkout timer now also re-nudges the
  weather/river caches (each a no-op unless its own TTL expired).
- **Activity + Method split**: `huntType` (one flat string mixing species and
  weapon) is now two fields — `activity` (Deer/Duck/Squirrel/Hog/Turkey/
  Scouting/Camera Service/Other) and `method` (Rifle/Suppressed Rifle/
  Primitive Firearm/Shotgun/Bow/Crossbow/None) — see `data/hunt_types.dart`
  for the full legality matrix. This finally implements the club's own
  written squirrel exception (guns allowed on bow-only stands for squirrel
  hunters) which the old flat list couldn't express, and scopes the
  high-water archery restriction to Deer specifically rather than to
  weapon-words in general. Check-in UI is a two-stage picker (Activity, then
  only the legal Methods for that activity/stand/high-water combo); an
  activity is never offered if it has zero legal methods on the current
  stand (e.g. Duck is hidden on bow-only stands, shotgun-only). Firestore
  rules validate both fields against fixed lists server-side (tighter than
  the old `is string, size<=30`) and now also validate `memberId` presence
  (a gap in the old rules). Clean cutover, no dual-write — `Hunt.fromDoc`
  defaults to `'Other'/'None'` for any pre-migration doc so nothing crashes.
  **Deployed the same session as the rules publish** — not pre-published —
  because this migration removes a field older builds still write, and an
  offline-queued check-in from a stale build syncing after the rules go out
  would be permanently rejected.
- **All-day / "Yellow Tag"**: `Hunt.allDay` (bool), a switch at check-in,
  and an amber badge everywhere occupancy shows (list row, map pin border,
  detail sheet, a home status-bar count). Uses the club's own term — the
  rules text already says "Hunting all day (Yellow Tag)? Say so at the
  morning draw." Deliberately informational only: no GPS/road data exists in
  this app to enforce "don't drive past," just to make it easy to see.
- **Guest/party visibility** (scoped to visibility-only per Chad's decision —
  hunter-safety certification, firearm counts, and formal rules-
  acknowledgement explicitly deferred): `Hunt.guestNames` (free text, no
  accounts — guest harvests already count toward the sponsoring member per
  club rules) and `Hunt.responsibleAdultMemberId`/`responsibleAdultName`
  (picked from the full roster, not just active hunters, so it's available
  at the very first check-in of the day). Both collapse behind an "Add a
  guest" expander in the check-in sheet. No age field exists on `Member`, so
  "responsible adult" is a label, not an enforced filter — stated as such.
  Regular teenage/family hunters get individual roster entries (same pattern
  as existing Son/Wife/Grandson/Proxy rows), not the guest-name path.

## Verification log
- Baseline: analyze 0 errors / 11 infos; 9/9 tests pass.
- After feature work: analyze **0 issues**; **35/35 tests pass**
  (units + widget smoke tests).
- v2.4: analyze **0 issues**; **76/76 tests pass**.
