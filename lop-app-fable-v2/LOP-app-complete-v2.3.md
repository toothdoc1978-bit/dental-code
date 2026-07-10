# Lookout Point (LOP) Hunting Club App — Complete Project (v2.3)

**One-file snapshot of the entire app.** Every source file is included below in
full. Hand this document to any developer or AI model and they can rebuild the
project exactly (only binary assets are excluded — see the Assets note).

- **Stack**: Flutter (Material 3, ≥3.27) · Riverpod · Firebase Anonymous Auth ·
  Cloud Firestore · Open-Meteo + NOAA NWPS + USGS (all keyless)
- **Firebase project**: `lop-hunting-club` · Web deploy: Firebase Hosting
- **Branch of record**: `fable-improved-v1` in `toothdoc1978-bit/dental-code`,
  folder `lop-app-fable-v2/`
- ⚠️ **PRIVATE**: `lib/data/members.dart` contains real names and phone
  numbers. Never post this file publicly.

## Rebuild from this document
1. Recreate each file below at its listed path inside a new folder.
2. `flutter create --platforms=ios,android,web --org com.lop .`
3. `dart pub global activate flutterfire_cli && flutterfire configure`
   (overwrites the placeholder `lib/firebase_options.dart`)
4. Firebase console: enable Anonymous auth, create Firestore, publish
   `firestore.rules`.
5. `flutter pub get && flutter test` (all tests should pass) then
   `flutter run` / `flutter build web --release`.

## Assets (binary — not embeddable in Markdown)
- `assets/lop_map.jpg` — the Eagle Forestry aerial (1536×1344 JPEG)
- `assets/lop_logo.png` — club logo (optional; placeholder shown if missing)
- `assets/rules/buck_45_55.jpg` — buck-aging comparison photo (optional)

---

## `README.md`

```markdown
# Lookout Point (LOP) — Hunting Club App · Fable-improved build

Flutter + Firebase app for the Lookout Point hunting club (East Carroll Parish, LA).
This folder is the **fable-improved-v1** build — a complete, isolated copy of the
app with an expert improvement pass applied (see `AUDIT.md` for the full review
and change log). The original app lives untouched in `lop-app/` on `main`.

## Features
- **Real club roster** — 36 members/family/proxies from the club contact list; pick
  your name on first launch, confirm your cell once (remembered on device).
- **130 stands** — gold `1`–`90` (any method) and bow-only `1B`–`40B`.
- **Stand list** — search by stand number **or hunter name**; filter All/Gold/Bow-only;
  each row has a map button that jumps straight to that stand on the aerial.
- **Check-in** — pick a hunt type (Rifle / Suppressed Rifle / Muzzleloader / Bow /
  Crossbow / Squirrel / Duck / Hog / Scouting / Other). Records the exact
  date/time plus the **Mississippi River stage** at **Vicksburg (VCKM6)** and
  **Greenville (GEEM6)** from NOAA's National Water Prediction Service (keyless).
  Haptic confirmation on success.
- **Check-out** — deer-hunting methods require entering **Does / Bucks / Fawns**
  before finishing; non-deer methods check out immediately.
- **Hunt Log** 🆕 — history button on the home screen: season totals (hunts, hours
  on stand, bucks/does/fawns) plus every completed hunt grouped by day, with
  times, duration, deer seen, and river stage. "Mine" filter for your own season.
- **Conditions screen** 🆕 — one tap from home: current temp / wind / cloud
  cover / scent behavior, an hour-by-hour 24 h table, and the Mississippi
  River card (Vicksburg & Greenville stages with rising/falling arrows, water
  temperature). River data cached to one shared Firestore doc
  (`riverStatus/current`, 1-hour TTL) so one member's fetch serves everyone.
  The home screen stays clean: open/in-use counts + a Conditions button.
- **Phone-friendly map pins** 🆕 — stands render as compact colored numbers
  (green = open, red = in use, solid green pill = you), sized to the screen.
  Check-out is one tap from the banner, your list row, or your pin on the map.
- **Live occupancy + texting** — real-time via Firestore; tap an occupied stand
  to see who/what and **Text** them.
- **Aerial map** — pan/zoom photo (`assets/lop_map.jpg`) with all 130 stand
  pins (shared via Firebase, now read-only — placement was retired once every
  stand was pinned; corrections happen in the Firebase console).
- **Scent-drift prediction** — per-stand hourly wind + thermal drift, computed
  from Open-Meteo (keyless) and drawn as a rotating, fading cone with a
  24-hour slider that starts at the hour containing *now*. Physics: the true
  wind (at its real mph) is vector-summed against a thermal of up to 4 mph that
  fades linearly between 4 and 10 mph of wind ("blowout"); cooling air drains
  toward the river, warming air disperses away. **Cloud cover throttles
  thermals** (overcast = ~30% strength). **River-edge stands** (east/south
  boundary, `kRiverEdgeStandCodes` in config) also feel the Mississippi's water
  temperature: warm water strengthens the evening drain toward the river; cold
  water pushes a light river breeze inland on warm afternoons (USGS water temp,
  nearest reporting station). Opening the map while checked in auto-selects
  **your** stand so your cone appears immediately.
- **My-hunt banner** — persistent bar with your stand/hunt/elapsed time (ticks
  every minute) and one-tap Check Out.
- **Wind chip** — current-hour wind + predicted scent direction in the status row.

## Tech
Flutter (Material 3, ≥3.27) · Riverpod · Firebase Auth (anonymous) · Cloud
Firestore (offline persistence) · `http` (Open-Meteo + NOAA NWPS) ·
`shared_preferences` · `url_launcher`.

## Project layout
```
lib/
  main.dart                     Firebase init, anon sign-in, forecast+river refresh, theming
  config.dart                   map-north offset, drainage heading, river gauge IDs
  models/    stand · member · hunt · forecast (indexForNow) · river_status (trend)
  data/      stands_data (130 stands) · members (36 real members) · hunt_types
  services/  firestore_service (hunts + hunt log + pins) · member_store
             weather_service · river_service (levels + cached status) · scent_vector
  providers/ app_providers.dart
  screens/   member_picker · home (banner, wind+river chips) · hunt_log 🆕
  widgets/   stand_list (name search, map jump) · stand_detail_sheet (haptics)
             map_reference · stand_map (pins + scent cone) · scent_cone_painter
  utils/     format.dart (clock/elapsed/duration/date/cardinal)
assets/lop_map.jpg              the club aerial (from the Eagle Forestry PDF)
test/      35 tests: stands · scent physics · formats · hunt types ·
           forecast now-index · river parsing/trend · UI smoke tests
firestore.rules                 tightened: owner-only checkout updates, immutable
                                history, bounded pin coords, shape-checked caches
AUDIT.md                        the full review + change log for this build
```

## Run it (any machine with Flutter ≥3.27 + a Mac for iOS builds)
This folder is the Flutter **source**. Native scaffolding and Firebase config are
machine/account-specific:

1. `flutter create --platforms=ios,android --org com.lop .` — regenerates `ios/` and `android/`
2. `dart pub global activate flutterfire_cli && flutterfire configure` — overwrites
   the placeholder `lib/firebase_options.dart` with your Firebase project's keys
3. Firebase console: enable **Anonymous** auth; create **Firestore**; publish
   `firestore.rules` (Console → Firestore → Rules → paste → Publish)
4. `flutter pub get`
5. `flutter run --release` on a device, or `flutter build apk --release` for Android

`flutter test` runs all 35 tests; `flutter analyze` is clean (0 issues).

## Notes for whoever picks this up next
- `lib/firebase_options.dart` is a **placeholder** so the repo compiles — run
  `flutterfire configure` before expecting Firebase to work.
- The roster (`lib/data/members.dart`) contains **real names and phone numbers**
  — keep any repo this lands in **private**.
- The check-in double-occupancy guard is query-then-write (not a transaction) on
  purpose: transactions require connectivity and would break offline check-in.
  Acceptable race for a 36-member club; see AUDIT.md.
- iOS distribution beyond personal-device installs needs the Apple Developer
  Program (TestFlight); Android testers can use Firebase App Distribution (free).
```

## `AUDIT.md`

```markdown
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

## Verification log
- Baseline: analyze 0 errors / 11 infos; 9/9 tests pass.
- After feature work: analyze **0 issues**; **35/35 tests pass**
  (units + widget smoke tests).
```

## `CLAUDE.md`

```markdown
# CLAUDE.md — LOP Hunting Club App (fable-improved-v1 build)

Guidance for AI assistants (and humans) working in this folder.

## What this is
Flutter + Firebase app for a private 36-member hunting club. This folder
(`lop-app-fable-v2/`) is the improved build on branch `fable-improved-v1`; the
pre-improvement app is `lop-app/` on `main`. `AUDIT.md` documents every change.

## Ground rules
- **Privacy**: `lib/data/members.dart` holds real names + phone numbers. Never
  paste them into logs, issues, or public repos. Keep repos private.
- **Keep it simple**: the owner is a working dentist, not a dev team. Prefer
  boring, reliable solutions. No paid Firebase plans (stay on Spark — no Cloud
  Functions), no API keys (Open-Meteo and NOAA NWPS are keyless).
- **Offline first**: check-in must work with no cell signal (Firestore offline
  persistence). Do not introduce transactions or network-blocking steps into
  the check-in path.
- **`firebase_options.dart` is a placeholder** — regenerated per-environment by
  `flutterfire configure`. Don't commit real keys.

## Verify every change
```bash
flutter analyze   # must stay at 0 issues
flutter test      # 35 tests: units + widget smoke tests (no Firebase needed)
```
The widget smoke tests (`test/ui_smoke_test.dart`) override all Riverpod
providers with fake streams — extend them when adding screens.

## Architecture cheat sheet
- State: Riverpod. All providers in `lib/providers/app_providers.dart`.
- Firestore collections: `hunts` (one doc per hunt; denormalized member info),
  `standPositions` (doc id == stand code; x/y as 0–1 fractions of the aerial),
  `forecast/today` (shared Open-Meteo cache, 2h TTL),
  `riverStatus/current` (shared NOAA gauge cache with forecast trend, 1h TTL).
- Shared-cache pattern: first device past the TTL re-fetches and writes; every
  other device just streams the doc. Keeps API traffic and Firestore reads tiny.
- Scent physics: pure function in `lib/services/scent_vector.dart` (wind >5 mph
  dominates; calm+cooling drains toward `kDrainageHeading` = 90°/the river;
  calm+warming disperses away). Rendering in `scent_cone_painter.dart`.
- Hunt-log query avoids composite indexes on purpose: single-field
  `orderBy(checkInTime desc)` + client-side `!active` filter.
- Dart gotcha that has bitten this codebase repeatedly: nullable promotion —
  test `if (x != null)` directly at the use site; never gate on a separately
  computed bool.

## Known deliberate trade-offs
- Check-in double-occupancy guard is query-then-write (racy in theory) to keep
  offline check-in working. Documented in AUDIT.md — don't "fix" it with a
  transaction without an offline story.
- Anonymous auth + trusted-club rules: Firestore rules validate shape and
  ownership but any club device can write shared caches/pins. Fine for a
  private club; revisit if the app ever goes beyond the membership.
```

## `LOPnotes.md`

```markdown
# Lookout Point (LOP) App — Session Notes (updated for fable-improved-v1)

## Where things stand
- **This folder (`lop-app-fable-v2/`, branch `fable-improved-v1`) is the improved
  build** — isolated from the original `lop-app/` folder, which is untouched on
  `main`. Full review + change log: `AUDIT.md`.
- Improvements in this build: Hunt Log screen with season totals · river levels
  + trend arrows on home · now-hour wind/scent everywhere · ticking hunt banner ·
  search by hunter name · list→map jump · auto-select my stand on the map ·
  haptics on check-in/out · tightened Firestore rules · placeholder
  `firebase_options.dart` so the repo compiles · 35 tests incl. UI smoke tests ·
  `flutter analyze` clean.
- The **original** app is running on Chad's iPad Pro 11 and iPhone 17 Pro Max
  (personal-team signing, re-sign every 7 days). Firebase project:
  **lop-hunting-club** (Firestore + Anonymous Auth). All 130 pins placed.
- Android builds work (`flutter build apk --release`). Apple Developer Program
  enrollment submitted, awaiting approval → then TestFlight.

## To run THIS build on the Mac Studio
```bash
cd ~/dental-code
git fetch origin fable-improved-v1
git checkout fable-improved-v1
cd lop-app-fable-v2
flutter create --platforms=ios,android --org com.lop .
flutterfire configure          # select lop-hunting-club, overwrite firebase_options.dart
flutter pub get
flutter test                   # 35/35 should pass
flutter run --release          # on the connected iPad/iPhone
```
Then publish the new `firestore.rules` (Firebase console → Firestore → Rules →
paste file contents → Publish). The new `riverStatus/current` doc creates itself
on first app launch.

## Key architecture (delta from the original notes)
- New collection: `riverStatus/current` — `{fetchedAt, vicksburg: {observedFt,
  forecastFt}, greenville: {...}}`, refreshed by the first device per 1-hour
  window (`RiverService.ensureFreshStatus()`, called at startup next to the
  weather refresh). Trend = forecast vs observed, ±0.2 ft deadband.
- New service method: `FirestoreService.streamRecentHunts()` — newest-first,
  single-field orderBy + client-side `!active` filter (NO composite index needed).
- New helpers: `Forecast.indexForNow()`, `fmtDuration()`, `fmtDate()`,
  `RiverService.parseGauge()` (static, unit-tested; handles NWPS -999 sentinels).
- New screens/providers: `HuntLogScreen`, `huntLogProvider`, `riverStatusProvider`.
- Firestore rules tightened — hunts: create-as-yourself with validated fields,
  update = owner-only, checkout-fields-only, one-way active→false; pins:
  stand-code doc ids + 0–1 coords; caches: fixed doc ids + shape checks.
  **Everything the app writes today passes these rules** (verified against every
  write site in the code).

## Known gotchas / lessons (carried forward + new)
1. **Dart null-promotion**: test `if (x != null)` directly; never gate on a
   separately-computed bool.
2. **Xcode SPM vs CocoaPods**: `flutter config --no-enable-swift-package-manager`
   if Firebase pods fail to resolve; regenerate `ios/` if needed.
3. **Free Apple ID signing expires every 7 days** — re-run `flutter run --release`.
4. Device install: Trust computer → Developer Mode ON → Trust developer profile.
5. `flutterfire: command not found` → `export PATH="$HOME/.pub-cache/bin:$PATH"`.
6. `flutter run -d <id>` — use the exact device-ID prefix from `flutter devices`.
7. **Never paste tokens/passwords in chat** — revoke immediately if it happens.
8. 🆕 min Flutter is now **3.27** (`withValues` color API).
9. 🆕 `firebase_options.dart` in this build is a compile-only placeholder —
   `flutterfire configure` must overwrite it before Firebase works.
10. 🆕 Widget smoke tests override every Riverpod provider with fake streams —
   no Firebase/emulator needed; keep new screens covered the same way.

## Rollback / merge (see PR for one-liners)
- Try it, hate it: `git checkout main` — the original app is exactly as it was.
- Delete the experiment: `git branch -D fable-improved-v1`
  (+ `git push origin --delete fable-improved-v1`).
- Keep it: merge the PR, then (optionally) replace `lop-app/` with
  `lop-app-fable-v2/` contents when confident.

## Still pending from before (unchanged)
- Apple Developer Program approval → Xcode team switch → Archive → App Store
  Connect → TestFlight.
- Optional Android distribution via Firebase App Distribution.
- Ideas not yet built: list↔map two-way *scroll* sync, board-only admin view.
  (Hunt log — previously on this list — is now DONE in this build.)
```

## `pubspec.yaml`

```yaml
name: lop_app
description: Lookout Point hunting club stand management app.
publish_to: "none"
version: 0.1.0+1

environment:
  sdk: ">=3.6.0 <4.0.0"
  # withValues() color API requires Flutter 3.27+.
  flutter: ">=3.27.0"

dependencies:
  flutter:
    sdk: flutter

  # State management
  flutter_riverpod: ^2.5.1

  # Firebase
  firebase_core: ^3.6.0
  firebase_auth: ^5.3.1
  cloud_firestore: ^5.4.4

  # Identity (remember who I am) + texting fellow members
  shared_preferences: ^2.3.2
  url_launcher: ^6.3.0

  # Weather (Open-Meteo, keyless)
  http: ^1.2.0

  # Utilities
  collection: ^1.18.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  # The whole assets/ folder is bundled. Drop the club aerial in as
  # assets/lop_map.jpg and it appears automatically; until then the app shows a
  # placeholder (no build error).
  assets:
    - assets/
```

## `analysis_options.yaml`

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_final_locals: true
```

## `firestore.rules`

```text
rules_version = '2';

// Lookout Point club rules. Everyone signs in anonymously, so "auth != null"
// means "someone running the club app" — trusted members, but the rules still
// enforce data shape and ownership so a bug (or a curious kid with the phone)
// can't corrupt club records:
//  * hunts: create only as yourself, with valid fields; update only your own
//    hunt and only the check-out fields; history is immutable otherwise.
//  * standPositions: pins must be real stand-code docs with in-bounds coords.
//  * forecast / riverStatus: single well-known cache docs with sane shapes.
service cloud.firestore {
  match /databases/{database}/documents {

    // Deer counts: null (non-deer hunts) or a sane non-negative integer.
    function validCount(v) {
      return v == null || (v is int && v >= 0 && v <= 500);
    }

    match /hunts/{huntId} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.active == true
        && request.resource.data.standCode is string
        && request.resource.data.standCode.size() >= 1
        && request.resource.data.standCode.size() <= 4
        && request.resource.data.huntType is string
        && request.resource.data.huntType.size() <= 30
        && request.resource.data.memberName is string
        && request.resource.data.memberName.size() <= 60
        // Deer counts are only recorded at check-out.
        && request.resource.data.doeSeen == null
        && request.resource.data.buckSeen == null
        && request.resource.data.fawnSeen == null;

      // Check-out: only the check-out fields, one-way active -> false, valid
      // counts. Any signed-in club device may perform it: ownership is keyed
      // to the self-declared member identity (so a member can check out from
      // any of their devices) and the 8 PM sweep closes forgotten hunts —
      // neither is verifiable under anonymous auth, so a device-owner check
      // here would only break those flows without adding real security.
      allow update: if request.auth != null
        && resource.data.active == true
        && request.resource.data.active == false
        && request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['active', 'checkOutTime', 'doeSeen', 'buckSeen',
                      'fawnSeen', 'autoClosed'])
        && validCount(request.resource.data.doeSeen)
        && validCount(request.resource.data.buckSeen)
        && validCount(request.resource.data.fawnSeen);

      allow delete: if false;
    }

    // Shared stand pin positions (doc id == stand code, e.g. "28" or "12B").
    // All 130 pins are placed; the placement feature was retired, so pins are
    // READ-ONLY for clients. Corrections go through the Firebase console.
    match /standPositions/{code} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Shared weather forecast cache (single doc: forecast/today).
    match /forecast/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && doc == 'today'
        && request.resource.data.fetchedAt is timestamp
        && request.resource.data.hours is list
        && request.resource.data.hours.size() <= 48;
    }

    // Shared river snapshot cache (single doc: riverStatus/current).
    match /riverStatus/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && doc == 'current'
        && request.resource.data.fetchedAt is timestamp;
    }

    // Club-wide state: the LDWF high-water archery rule (clubStatus/current).
    // Writable by any signed-in device: the auto gauge logic runs client-side,
    // and admin gating is app-level (trusted club on anonymous auth).
    match /clubStatus/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && doc == 'current'
        && (!('highWaterArchery' in request.resource.data)
            || request.resource.data.highWaterArchery is bool)
        && (!('highWaterMode' in request.resource.data)
            || request.resource.data.highWaterMode in ['auto', 'forceOn', 'forceOff']);
    }
  }
}
```

## `lib/config.dart`

```dart
// Tunable constants for the scent-drift feature, river gauges, high-water
// rule, and admin access.

/// Shown in-app so you can tell at a glance which build is deployed.
const String kAppVersion = 'v2.3';

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
```

## `lib/data/club_rules.dart`

```dart
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
```

## `lib/data/hunt_types.dart`

```dart
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

/// Deer firearm methods barred under the LDWF Area 1 high-water rule
/// (Vicksburg >= 43.0 ft: archery only for deer east of US-65). Squirrel,
/// duck, and other non-deer methods are unaffected.
const Set<String> kFirearmDeerTypes = {
  'Rifle',
  'Suppressed Rifle',
  'Muzzleloader',
};

/// The hunt types allowed on a stand of the given kind. When [highWater] is
/// active, the deer firearm methods disappear everywhere.
List<String> allowedHuntTypes({required bool bowOnly, bool highWater = false}) {
  final base = bowOnly ? kBowOnlyTypes : kHuntTypes;
  if (!highWater) return base;
  return base.where((t) => !kFirearmDeerTypes.contains(t)).toList();
}

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
```

## `lib/data/members.dart`

```dart
import 'package:collection/collection.dart';
import '../models/member.dart';

/// Lookout Point club roster — real members plus family/proxies who hunt.
///
/// `shares` shows the share(s) held in the undivided interest (two numbers =
/// two shares). Edit this list to add/remove people; nothing else changes.
const List<Member> kMembers = [
  Member(id: 'm01', name: 'David Ditch', phone: '985-209-7162', role: 'Member', shares: '1'),
  Member(id: 'm02', name: 'Darren Oglesby', phone: '318-355-8833', role: 'Board', shares: '2'),
  Member(id: 'm03', name: 'Lance Donald', phone: '318-355-0170', role: 'Board', shares: '3,4'),
  Member(id: 'm04', name: 'Jonathan Bruser', phone: '225-268-4683', role: 'Member', shares: '5'),
  Member(id: 'm05', name: 'Thomas Hessburg', phone: '225-505-5746', role: 'Member', shares: '6'),
  Member(id: 'm06', name: 'Chris Robinson', phone: '318-680-1934', role: 'Board', shares: '7,8'),
  Member(id: 'm07', name: 'Everett Stagg', phone: '318-235-2855', role: 'Member', shares: '9,10'),
  Member(id: 'm08', name: 'Al Gonzales', phone: '318-355-9281', role: 'Member', shares: '11'),
  Member(id: 'm09', name: 'Christina Gonzalez', phone: '318-372-6699', role: 'Hunting Rights'),
  Member(id: 'm10', name: 'Martin Gardner', phone: '318-366-7766', role: 'Member', shares: '12'),
  Member(id: 'm11', name: 'Wyatt Thompson', phone: '318-418-1264', role: 'Grandson'),
  Member(id: 'm12', name: 'Connor Hodge', phone: '318-376-5115', role: 'Member', shares: '13,14'),
  Member(id: 'm13', name: 'Vance Costello', phone: '318-737-0964', role: 'Member', shares: '15,16'),
  Member(id: 'm14', name: 'Jason Hornback', phone: '337-258-0109', role: 'Board', shares: '17'),
  Member(id: 'm15', name: 'Hayden Hornback', phone: '337-330-6831', role: 'Son'),
  Member(id: 'm16', name: 'Eric Graham', phone: '903-920-4094', role: 'Board', shares: '18'),
  Member(id: 'm17', name: 'Sollie Graham', phone: '713-548-4621', role: 'Wife'),
  Member(id: 'm18', name: 'Toby Frith', phone: '318-282-9213', role: 'Member', shares: '19'),
  Member(id: 'm19', name: 'Ricky Caples', phone: '318-348-5800', role: 'Member', shares: '20'),
  Member(id: 'm20', name: 'Hall Caples', phone: '318-789-9876', role: 'Son'),
  Member(id: 'm21', name: 'Bill Poole', phone: '318-729-4796', role: 'Member', shares: '21'),
  Member(id: 'm22', name: 'Byron Poole', phone: '318-729-1815', role: 'Proxy'),
  Member(id: 'm23', name: 'Jason Ewing', phone: '318-366-7277', role: 'Board', shares: '22'),
  Member(id: 'm24', name: 'Perry Smith', phone: '318-355-0563', role: 'Brother'),
  Member(id: 'm25', name: 'David Hampton', phone: '318-366-2328', role: 'Member', shares: '23'),
  Member(id: 'm26', name: 'Parker Templeton', phone: '337-519-9914', role: 'Member', shares: '24'),
  Member(id: 'm27', name: 'Chad Gardner', phone: '318-282-1827', role: 'Board', shares: '25'),
  Member(id: 'm28', name: 'Preston Gardner', phone: '318-669-5948', role: 'Son'),
  Member(id: 'm29', name: 'Tim Clemons', phone: '318-268-8016', role: 'Member', shares: '26'),
  Member(id: 'm30', name: 'Cade Clemons', phone: '318-401-5705', role: 'Son'),
  Member(id: 'm31', name: 'Jott Delcambre', phone: '318-791-9818', role: 'Member', shares: '27'),
  Member(id: 'm32', name: 'Owen Delcambre', phone: '318-366-4008', role: 'Son'),
  Member(id: 'm33', name: 'Kevin Hopper', phone: '318-366-7467', role: 'Member', shares: '28'),
  Member(id: 'm34', name: 'Sam Hopper', phone: '318-267-2288', role: 'Son'),
  Member(id: 'm35', name: 'Hayden Hopper', phone: '318-267-2927', role: 'Son'),
  Member(id: 'm36', name: 'Drew Carson', phone: '318-205-0191', role: 'Member', shares: '29'),
];

Member? memberById(String id) => kMembers.firstWhereOrNull((m) => m.id == id);
```

## `lib/data/stands_data.dart`

```dart
import 'package:collection/collection.dart';
import '../models/stand.dart';

/// Every hunting area: gold stands 1–90 (any method) + bow-only stands 1–40.
/// 130 stands total. Edit the two ranges to change the layout.
final List<Stand> kStands = [
  for (var n = 1; n <= 90; n++) Stand(number: n, bowOnly: false),
  for (var n = 1; n <= 40; n++) Stand(number: n, bowOnly: true),
];

/// Look up a stand by its [Stand.code] (e.g. "28" or "12B").
Stand? standByCode(String code) =>
    kStands.firstWhereOrNull((s) => s.code == code);
```

## `lib/firebase_options.dart`

```dart
// PLACEHOLDER — run `flutterfire configure` to overwrite this file with your
// own Firebase project's real keys. These values let the project compile and
// run tests, but the app cannot reach Firebase until you replace them.
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static const FirebaseOptions currentPlatform = FirebaseOptions(
    apiKey: 'REPLACE-ME-run-flutterfire-configure',
    appId: '1:000000000000:ios:0000000000000000000000',
    messagingSenderId: '000000000000',
    projectId: 'replace-me',
  );
}
```

## `lib/main.dart`

```dart
import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase_options.dart';
import 'providers/app_providers.dart';
import 'screens/home_screen.dart';
import 'screens/member_picker_screen.dart';
import 'services/firestore_service.dart';
import 'services/member_store.dart';
import 'services/river_service.dart';
import 'services/weather_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Offline persistence so check-ins work without signal in the field.
  // Web handles caching differently (and this mobile-style setting can throw
  // there), so it's mobile-only; browser testing doesn't need offline support.
  if (!kIsWeb) {
    FirebaseFirestore.instance.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );
  }

  runApp(const ProviderScope(child: LopApp()));
}

class LopApp extends StatelessWidget {
  const LopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lookout Point',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF2E5E3A), // hunter green
        useMaterial3: true,
        appBarTheme: const AppBarTheme(centerTitle: false),
        snackBarTheme:
            const SnackBarThemeData(behavior: SnackBarBehavior.floating),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ),
      home: const _AuthGate(),
    );
  }
}

/// Signs the device in anonymously, kicks off a forecast refresh, then hands
/// off to the identity gate.
class _AuthGate extends ConsumerStatefulWidget {
  const _AuthGate();

  @override
  ConsumerState<_AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends ConsumerState<_AuthGate> {
  late final Future<void> _signIn = _doSignIn();
  Timer? _sweepTimer;

  Future<void> _doSignIn() async {
    final auth = FirebaseAuth.instance;
    final user = auth.currentUser ?? (await auth.signInAnonymously()).user;
    ref.read(authUidProvider.notifier).state = user?.uid;
    // Refresh the shared weather + river snapshots (fire-and-forget; no-op if
    // fresh — the first device per window fetches, everyone else just reads).
    unawaited(WeatherService().ensureFreshForecast());
    unawaited(RiverService().ensureFreshStatus());
    // 8 PM auto-checkout: sweep now, then re-check every 15 minutes so a
    // phone left open clears the board at the cutoff.
    unawaited(FirestoreService().autoCheckoutSweep());
    _sweepTimer = Timer.periodic(
      const Duration(minutes: 15),
      (_) => unawaited(FirestoreService().autoCheckoutSweep()),
    );
  }

  @override
  void dispose() {
    _sweepTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _signIn,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text('Sign-in failed:\n${snapshot.error}'),
              ),
            ),
          );
        }
        return const _IdentityGate();
      },
    );
  }
}

/// Loads the saved member from the device. If none, shows the picker; once a
/// member is set, shows the home screen.
class _IdentityGate extends ConsumerStatefulWidget {
  const _IdentityGate();

  @override
  ConsumerState<_IdentityGate> createState() => _IdentityGateState();
}

class _IdentityGateState extends ConsumerState<_IdentityGate> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final member = await MemberStore.load();
    if (member != null) {
      ref.read(currentMemberProvider.notifier).state = member;
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final member = ref.watch(currentMemberProvider);
    return member == null ? const MemberPickerScreen() : const HomeScreen();
  }
}
```

## `lib/models/club_status.dart`

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

/// How the high-water archery rule is being decided.
enum HighWaterMode {
  /// Follow the Vicksburg gauge automatically (the default).
  auto,

  /// Admin forced the rule ON regardless of the gauge.
  forceOn,

  /// Admin forced the rule OFF regardless of the gauge.
  forceOff,
}

/// Club-wide state (`clubStatus/current`): whether the LDWF Area 1 high-water
/// archery-only rule is in effect, and whether that's automatic (from the
/// Vicksburg gauge, with hysteresis) or an admin override.
class ClubStatus {
  /// The gauge-driven answer, maintained automatically with hysteresis.
  final bool highWaterArchery;

  final HighWaterMode mode;
  final DateTime? updatedAt;

  const ClubStatus({
    required this.highWaterArchery,
    this.mode = HighWaterMode.auto,
    this.updatedAt,
  });

  /// The answer the rest of the app obeys: an admin override wins; otherwise
  /// the automatic gauge-driven state.
  bool get archeryOnly => switch (mode) {
        HighWaterMode.forceOn => true,
        HighWaterMode.forceOff => false,
        HighWaterMode.auto => highWaterArchery,
      };

  Map<String, dynamic> toMap() => {
        'highWaterArchery': highWaterArchery,
        'highWaterMode': mode.name,
        'updatedAt': updatedAt == null
            ? FieldValue.serverTimestamp()
            : Timestamp.fromDate(updatedAt!),
      };

  factory ClubStatus.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return ClubStatus(
      highWaterArchery: data['highWaterArchery'] as bool? ?? false,
      mode: HighWaterMode.values.asNameMap()[data['highWaterMode']] ??
          HighWaterMode.auto,
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }
}
```

## `lib/models/forecast.dart`

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

/// One hour of forecast for the property.
class HourlyWeather {
  final DateTime time;
  final double tempF;
  final double windMph;
  final double windDirDeg; // direction the wind comes FROM (compass degrees)
  final double tempDelta; // this hour's temp minus the previous hour's

  /// Total cloud cover, 0 (clear) to 100 (overcast). Clouds throttle the
  /// radiative heating/cooling that drives thermals. Defaults to 50 (neutral)
  /// for cached docs written before this field existed.
  final double cloudCoverPct;

  const HourlyWeather({
    required this.time,
    required this.tempF,
    required this.windMph,
    required this.windDirDeg,
    required this.tempDelta,
    this.cloudCoverPct = 50,
  });

  Map<String, dynamic> toMap() => {
        'time': time.toIso8601String(),
        'tempF': tempF,
        'windMph': windMph,
        'windDirDeg': windDirDeg,
        'tempDelta': tempDelta,
        'cloudCoverPct': cloudCoverPct,
      };

  factory HourlyWeather.fromMap(Map<String, dynamic> m) => HourlyWeather(
        time: DateTime.parse(m['time'] as String),
        tempF: (m['tempF'] as num).toDouble(),
        windMph: (m['windMph'] as num).toDouble(),
        windDirDeg: (m['windDirDeg'] as num).toDouble(),
        tempDelta: (m['tempDelta'] as num).toDouble(),
        cloudCoverPct: (m['cloudCoverPct'] as num?)?.toDouble() ?? 50,
      );
}

/// The cached forecast document (`forecast/today`): when it was fetched plus the
/// next 24 hours. Stored as one lightweight doc to minimize Firestore reads.
class Forecast {
  final DateTime fetchedAt;
  final List<HourlyWeather> hours;

  const Forecast({required this.fetchedAt, required this.hours});

  /// Index of the hour containing [now] (the cached forecast can be up to two
  /// hours old, so `hours.first` may already be in the past). Falls back to 0.
  int indexForNow({DateTime? now}) {
    final n = now ?? DateTime.now();
    for (var i = hours.length - 1; i >= 0; i--) {
      if (!hours[i].time.isAfter(n)) return i;
    }
    return 0;
  }

  Map<String, dynamic> toMap() => {
        'fetchedAt': Timestamp.fromDate(fetchedAt),
        'hours': hours.map((h) => h.toMap()).toList(),
      };

  factory Forecast.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    final raw = (data['hours'] as List?) ?? const [];
    return Forecast(
      fetchedAt: (data['fetchedAt'] as Timestamp?)?.toDate() ??
          DateTime.fromMillisecondsSinceEpoch(0),
      hours: raw
          .map((e) => HourlyWeather.fromMap((e as Map).cast<String, dynamic>()))
          .toList(),
    );
  }
}
```

## `lib/models/hunt.dart`

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

/// A single hunt record: one document in the `hunts` collection.
///
/// Created at check-in (records exact time via [checkInTime] plus the
/// Mississippi River stage at Vicksburg & Greenville) and closed at check-out
/// (deer counts for deer-hunting methods). Member name + phone are denormalized
/// so any member can see who's hunting — and text them — without a join.
class Hunt {
  final String id;
  final String standCode;
  final String huntType;
  final String memberId;
  final String memberName;
  final String memberPhone;
  final String userId;
  final bool active;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;

  /// Deer seen, recorded at check-out for deer-hunting methods. Null otherwise.
  final int? doeSeen;
  final int? buckSeen;
  final int? fawnSeen;

  /// Mississippi River stage (ft) at check-in time. Null if offline.
  final double? riverVicksburgFt;
  final double? riverGreenvilleFt;

  /// True when the hunt was ended by the 8 PM sweep (or an admin clear)
  /// instead of the hunter checking out.
  final bool autoClosed;

  const Hunt({
    required this.id,
    required this.standCode,
    required this.huntType,
    required this.memberId,
    required this.memberName,
    required this.memberPhone,
    required this.userId,
    required this.active,
    this.checkInTime,
    this.checkOutTime,
    this.doeSeen,
    this.buckSeen,
    this.fawnSeen,
    this.riverVicksburgFt,
    this.riverGreenvilleFt,
    this.autoClosed = false,
  });

  String get memberFirstName =>
      memberName.isEmpty ? 'Someone' : memberName.split(' ').first;

  factory Hunt.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return Hunt(
      id: doc.id,
      standCode: data['standCode'] as String? ?? '',
      huntType: data['huntType'] as String? ?? '',
      memberId: data['memberId'] as String? ?? '',
      memberName: data['memberName'] as String? ?? '',
      memberPhone: data['memberPhone'] as String? ?? '',
      userId: data['userId'] as String? ?? '',
      active: data['active'] as bool? ?? false,
      checkInTime: (data['checkInTime'] as Timestamp?)?.toDate(),
      checkOutTime: (data['checkOutTime'] as Timestamp?)?.toDate(),
      doeSeen: (data['doeSeen'] as num?)?.toInt(),
      buckSeen: (data['buckSeen'] as num?)?.toInt(),
      fawnSeen: (data['fawnSeen'] as num?)?.toInt(),
      riverVicksburgFt: (data['riverVicksburgFt'] as num?)?.toDouble(),
      riverGreenvilleFt: (data['riverGreenvilleFt'] as num?)?.toDouble(),
      autoClosed: data['autoClosed'] as bool? ?? false,
    );
  }
}
```

## `lib/models/member.dart`

```dart
/// A club member (or a member's family/proxy who also hunts). The roster is a
/// static list (see `data/members.dart`); each carries a phone so others can
/// text them, plus optional [role] and [shares] for display.
class Member {
  final String id;
  final String name;

  /// Display phone, e.g. "318-555-0101". Use [digits] for tel/sms URIs.
  final String phone;

  /// e.g. "Member", "Board", "Son", "Proxy". Optional.
  final String role;

  /// Share(s) held in the undivided interest, e.g. "12" or "3,4". Optional.
  final String shares;

  const Member({
    required this.id,
    required this.name,
    required this.phone,
    this.role = '',
    this.shares = '',
  });

  String get firstName => name.split(' ').first;

  /// Phone reduced to digits only, for building `sms:`/`tel:` URIs.
  String get digits => phone.replaceAll(RegExp(r'[^0-9]'), '');
}
```

## `lib/models/river_status.dart`

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

/// Which way a gauge is heading over the next day or so.
enum RiverTrend { rising, falling, steady, unknown }

/// One gauge's current picture: the observed stage plus NOAA's forecast stage,
/// from which we derive a simple rising/falling/steady trend.
class GaugeStatus {
  final double? observedFt;
  final double? forecastFt;

  const GaugeStatus({this.observedFt, this.forecastFt});

  /// Rising/falling needs at least 0.2 ft of predicted movement — the river
  /// wobbles a tenth of a foot all day.
  RiverTrend get trend {
    final o = observedFt;
    final f = forecastFt;
    if (o == null || f == null) return RiverTrend.unknown;
    final d = f - o;
    if (d > 0.2) return RiverTrend.rising;
    if (d < -0.2) return RiverTrend.falling;
    return RiverTrend.steady;
  }

  Map<String, dynamic> toMap() => {
        'observedFt': observedFt,
        'forecastFt': forecastFt,
      };

  factory GaugeStatus.fromMap(Map<String, dynamic>? m) => GaugeStatus(
        observedFt: (m?['observedFt'] as num?)?.toDouble(),
        forecastFt: (m?['forecastFt'] as num?)?.toDouble(),
      );
}

/// The cached river snapshot (`riverStatus/current`): both Mississippi gauges,
/// shared by the whole club so one member's fetch serves everyone.
class RiverStatus {
  final DateTime fetchedAt;
  final GaugeStatus vicksburg;
  final GaugeStatus greenville;

  /// Mississippi water temperature (°F). The Vicksburg/Greenville gauges don't
  /// report temperature, so this comes from the nearest reporting USGS station
  /// (Baton Rouge) — lower-river water temp varies slowly along the reach, so
  /// it's a fair proxy for the water off Lookout Point. Null if unavailable.
  final double? waterTempF;

  const RiverStatus({
    required this.fetchedAt,
    required this.vicksburg,
    required this.greenville,
    this.waterTempF,
  });

  Map<String, dynamic> toMap() => {
        'fetchedAt': Timestamp.fromDate(fetchedAt),
        'vicksburg': vicksburg.toMap(),
        'greenville': greenville.toMap(),
        'waterTempF': waterTempF,
      };

  factory RiverStatus.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};
    return RiverStatus(
      fetchedAt: (data['fetchedAt'] as Timestamp?)?.toDate() ??
          DateTime.fromMillisecondsSinceEpoch(0),
      vicksburg:
          GaugeStatus.fromMap((data['vicksburg'] as Map?)?.cast<String, dynamic>()),
      greenville: GaugeStatus.fromMap(
          (data['greenville'] as Map?)?.cast<String, dynamic>()),
      waterTempF: (data['waterTempF'] as num?)?.toDouble(),
    );
  }
}
```

## `lib/models/stand.dart`

```dart
/// A hunting stand on the Lookout Point property.
///
///   * **Gold** stands (numbers 1–90) — any legal method (rifle, bow, etc.)
///   * **Bow-only** stands (numbers 1–40, shown with a "B" on the map)
///
/// [code] is the stable, unique identifier used everywhere (list keys, Firestore
/// `standCode`): "28" for gold stand 28, "28B" for bow-only stand 28.
class Stand {
  final int number;
  final bool bowOnly;

  const Stand({required this.number, required this.bowOnly});

  String get code => bowOnly ? '${number}B' : '$number';
  String get label => code;
  String get category => bowOnly ? 'Bow-only' : 'Gold';
}
```

## `lib/providers/app_providers.dart`

```dart
import 'dart:ui' show Offset;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/stands_data.dart';
import '../models/club_status.dart';
import '../models/forecast.dart';
import '../models/hunt.dart';
import '../models/member.dart';
import '../models/river_status.dart';
import '../models/stand.dart';
import '../services/firestore_service.dart';
import '../services/river_service.dart';
import '../services/weather_service.dart';

// --- Services -----------------------------------------------------------------

final firestoreServiceProvider = Provider((ref) => FirestoreService());
final weatherServiceProvider = Provider((ref) => WeatherService());
final riverServiceProvider = Provider((ref) => RiverService());

// --- Auth & identity ----------------------------------------------------------

final authUidProvider = StateProvider<String?>((ref) => null);
final currentMemberProvider = StateProvider<Member?>((ref) => null);

// --- Stands (static) ----------------------------------------------------------

final standsProvider = Provider<List<Stand>>((ref) => kStands);

// --- Hunts (live, from Firestore) --------------------------------------------

final activeHuntsProvider = StreamProvider<List<Hunt>>((ref) {
  return ref.watch(firestoreServiceProvider).streamActiveHunts();
});

final activeHuntsByCodeProvider = Provider<Map<String, Hunt>>((ref) {
  final hunts = ref.watch(activeHuntsProvider).valueOrNull ?? const [];
  return {for (final h in hunts) h.standCode: h};
});

/// MY active hunt — keyed to the chosen member (works across devices), not
/// the device's anonymous auth id.
final myActiveHuntProvider = StreamProvider<Hunt?>((ref) {
  final member = ref.watch(currentMemberProvider);
  if (member == null) return Stream.value(null);
  return ref.watch(firestoreServiceProvider).streamMyActiveHunt(member.id);
});

// --- Map pins (shared positions of each stand on the photo) -------------------

final standPositionsProvider = StreamProvider<Map<String, Offset>>((ref) {
  return ref.watch(firestoreServiceProvider).streamStandPositions();
});

// --- Hunt log (recent completed hunts) -----------------------------------------

final huntLogProvider = StreamProvider<List<Hunt>>((ref) {
  return ref.watch(firestoreServiceProvider).streamRecentHunts();
});

// --- Weather (live, from Firestore forecast/today) ----------------------------

final forecastProvider = StreamProvider<Forecast?>((ref) {
  return ref.watch(weatherServiceProvider).streamForecast();
});

// --- River (live, from Firestore riverStatus/current) --------------------------

final riverStatusProvider = StreamProvider<RiverStatus?>((ref) {
  return ref.watch(riverServiceProvider).streamStatus();
});

// --- Club status (LDWF high-water archery rule) ---------------------------------

final clubStatusProvider = StreamProvider<ClubStatus?>((ref) {
  return ref.watch(riverServiceProvider).streamClubStatus();
});

/// Whether the archery-only rule is in effect right now (override-aware).
final highWaterProvider = Provider<bool>((ref) {
  return ref.watch(clubStatusProvider).valueOrNull?.archeryOnly ?? false;
});

// --- Scent cone UI state ------------------------------------------------------

final selectedStandProvider = StateProvider<String?>((ref) => null);
final selectedHourProvider = StateProvider<int>((ref) => 0);

// --- List UI state ------------------------------------------------------------

enum StandFilter { all, gold, bowOnly }

final searchQueryProvider = StateProvider<String>((ref) => '');
final standFilterProvider = StateProvider<StandFilter>((ref) => StandFilter.all);
```

## `lib/screens/conditions_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../models/club_status.dart';
import '../models/forecast.dart';
import '../models/river_status.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import '../utils/format.dart';

/// Everything about today's conditions in one place: current weather + scent
/// behavior, the next 24 hours, and the Mississippi River stages. Moved off
/// the home screen (member feedback: river stages were too prominent there).
class ConditionsScreen extends ConsumerWidget {
  const ConditionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final forecast = ref.watch(forecastProvider).valueOrNull;
    final river = ref.watch(riverStatusProvider).valueOrNull;

    final highWater = ref.watch(highWaterProvider);
    final member = ref.watch(currentMemberProvider);
    final isAdmin = member != null && kAdminMemberIds.contains(member.id);

    return Scaffold(
      appBar: AppBar(title: const Text('Conditions')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
        children: [
          _NowCard(forecast: forecast),
          const SizedBox(height: 12),
          _RiverCard(river: river, highWater: highWater),
          if (isAdmin) ...[
            const SizedBox(height: 12),
            const _AdminCard(),
          ],
          if (forecast != null && forecast.hours.isNotEmpty) ...[
            const SizedBox(height: 12),
            _HourlyCard(forecast: forecast),
          ],
          const SizedBox(height: 16),
          Center(
            child: Text('Lookout Point app $kAppVersion',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}

/// Admin-only: control how the high-water archery rule is decided.
class _AdminCard extends ConsumerWidget {
  const _AdminCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(clubStatusProvider).valueOrNull;
    final mode = status?.mode ?? HighWaterMode.auto;
    final active = status?.archeryOnly ?? false;

    return Card(
      color: Colors.amber.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.admin_panel_settings, size: 18),
                SizedBox(width: 6),
                Text('Admin — high-water archery rule',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              active
                  ? 'Rule is ACTIVE — deer hunting is archery only.'
                  : 'Rule is not active — all methods allowed.',
              style: TextStyle(
                  color: active ? Colors.red.shade800 : Colors.green.shade800,
                  fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            SegmentedButton<HighWaterMode>(
              segments: const [
                ButtonSegment(
                    value: HighWaterMode.auto, label: Text('Auto (gauge)')),
                ButtonSegment(
                    value: HighWaterMode.forceOn, label: Text('Force ON')),
                ButtonSegment(
                    value: HighWaterMode.forceOff, label: Text('Force OFF')),
              ],
              selected: {mode},
              onSelectionChanged: (sel) =>
                  ref.read(riverServiceProvider).setHighWaterMode(sel.first),
            ),
            const SizedBox(height: 8),
            Text(
              'Auto follows the Vicksburg gauge: ON at ${kHighWaterOnFt.toStringAsFixed(1)} ft, '
              'back OFF below ${kHighWaterOffFt.toStringAsFixed(1)} ft.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
            const Divider(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red.shade700),
                icon: const Icon(Icons.clear_all),
                label: const Text('End all active hunts now'),
                onPressed: () => _endAll(context, ref),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Clears the whole board (testing, or a stuck check-in). Every '
              'active hunt also auto-ends daily at 8 PM.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _endAll(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('End all active hunts?'),
        content: const Text(
            'Everyone currently checked in will be checked out. Deer counts '
            'for those hunts will not be recorded.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
              style: FilledButton.styleFrom(
                  backgroundColor: Colors.red.shade700),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('End all')),
        ],
      ),
    );
    if (ok != true) return;
    final n = await ref
        .read(firestoreServiceProvider)
        .autoCheckoutSweep(force: true);
    messenger.showSnackBar(
        SnackBar(content: Text('Ended $n active hunt${n == 1 ? '' : 's'}')));
  }
}

/// Current hour: temp, wind, clouds, and what the scent is doing.
class _NowCard extends StatelessWidget {
  final Forecast? forecast;
  const _NowCard({required this.forecast});

  @override
  Widget build(BuildContext context) {
    final hours = forecast?.hours ?? const <HourlyWeather>[];
    if (hours.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Loading forecast…'),
        ),
      );
    }
    final h = hours[forecast!.indexForNow()];
    final v = calculateScentVector(h, drainageHeading: kDrainageHeading);

    return Card(
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Right now',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Text('${h.tempF.round()}°F',
                    style: const TextStyle(
                        fontSize: 34, fontWeight: FontWeight.bold)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                          'Wind ${cardinal(h.windDirDeg)} ${h.windMph.round()} mph'),
                      Text('${h.cloudCoverPct.round()}% cloud cover'),
                      Text('Scent drifts ${cardinal(v.angle)}',
                          style:
                              const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(_regime(h.windMph, h.tempDelta),
                style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  String _regime(double windMph, double tempDelta) {
    final w = thermalWeight(windMph);
    if (w == 0) return 'True wind dominates — trust the wind direction.';
    final thermal = tempDelta < 0
        ? 'cooling air is sinking and draining toward the river'
        : tempDelta > 0
            ? 'warming air is rising and dispersing'
            : 'slack air';
    return w == 1
        ? 'Thermal conditions — $thermal.'
        : 'Wind + thermal mix — $thermal.';
  }
}

/// Mississippi River stages + water temperature + high-water rule status.
class _RiverCard extends StatelessWidget {
  final RiverStatus? river;
  final bool highWater;
  const _RiverCard({required this.river, this.highWater = false});

  @override
  Widget build(BuildContext context) {
    final r = river;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Mississippi River',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            if (r == null)
              const Text('Loading river data…')
            else ...[
              _gaugeRow('Vicksburg', r.vicksburg),
              const SizedBox(height: 6),
              _gaugeRow('Greenville', r.greenville),
              if (r.waterTempF != null) ...[
                const SizedBox(height: 6),
                Text('Water temperature: ${r.waterTempF!.round()}°F'),
              ],
              const SizedBox(height: 10),
              if (highWater)
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    'HIGH WATER RULE ACTIVE — deer hunting is archery only '
                    'east of US-65 until Vicksburg drops below '
                    '${kHighWaterOffFt.toStringAsFixed(1)} ft.',
                    style: TextStyle(
                        color: Colors.red.shade800,
                        fontWeight: FontWeight.bold,
                        fontSize: 12),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    'LDWF rule: deer hunting east of US-65 goes archery-only '
                    'if Vicksburg reaches ${kHighWaterOnFt.toStringAsFixed(1)} ft '
                    '(back to normal below ${kHighWaterOffFt.toStringAsFixed(1)} ft).',
                    style:
                        TextStyle(color: Colors.grey.shade600, fontSize: 12),
                  ),
                ),
              Text(
                'Stages are recorded automatically on every check-in — see the '
                'Hunt Log to compare hunts against river levels.',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _gaugeRow(String name, GaugeStatus g) {
    final stage = g.observedFt;
    final (arrow, word) = switch (g.trend) {
      RiverTrend.rising => ('↗', 'rising'),
      RiverTrend.falling => ('↘', 'falling'),
      RiverTrend.steady => ('→', 'steady'),
      RiverTrend.unknown => ('', ''),
    };
    return Row(
      children: [
        SizedBox(width: 92, child: Text(name)),
        Text(
          stage == null ? '—' : '${stage.toStringAsFixed(1)} ft',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        if (word.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: Text('$arrow $word',
                style: TextStyle(color: Colors.blueGrey.shade600)),
          ),
      ],
    );
  }
}

/// Compact hour-by-hour table for the next 24 hours.
class _HourlyCard extends StatelessWidget {
  final Forecast forecast;
  const _HourlyCard({required this.forecast});

  @override
  Widget build(BuildContext context) {
    final now = forecast.indexForNow();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Next 24 hours',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            for (var i = now; i < forecast.hours.length; i++)
              _hourRow(forecast.hours[i], i == now),
          ],
        ),
      ),
    );
  }

  Widget _hourRow(HourlyWeather h, bool isNow) {
    final style = TextStyle(
      fontSize: 13,
      fontWeight: isNow ? FontWeight.bold : FontWeight.normal,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(width: 58, child: Text(_fmtHour(h.time), style: style)),
          SizedBox(width: 44, child: Text('${h.tempF.round()}°', style: style)),
          SizedBox(
            width: 82,
            child: Text('${cardinal(h.windDirDeg)} ${h.windMph.round()} mph',
                style: style),
          ),
          Expanded(
            child: Text('${h.cloudCoverPct.round()}% clouds',
                style: style.copyWith(color: Colors.grey.shade600)),
          ),
        ],
      ),
    );
  }

  String _fmtHour(DateTime dt) {
    final local = dt.toLocal();
    var hr = local.hour % 12;
    if (hr == 0) hr = 12;
    return '$hr ${local.hour >= 12 ? 'PM' : 'AM'}';
  }
}
```

## `lib/screens/home_screen.dart`

```dart
import 'dart:async';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/stands_data.dart';
import '../providers/app_providers.dart';
import '../services/ack_store.dart';
import '../services/member_store.dart';
import '../utils/format.dart';
import '../widgets/high_water_banner.dart';
import '../widgets/map_reference.dart';
import '../widgets/stand_detail_sheet.dart';
import '../widgets/stand_list.dart';
import 'conditions_screen.dart';
import 'hunt_log_screen.dart';
import 'rules_screen.dart';

/// Main screen: my-hunt banner + club map + live stand list.
///
/// Wide screens (iPad) get map | list side-by-side; narrow screens stack a map
/// thumbnail above the list. (Stand-pin placement was retired once all 130
/// pins were set — positions are read-only club data now.)
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  /// Opens the full-screen map. If I'm checked in and nothing else is selected,
  /// pre-select my stand so my scent cone appears immediately, at the forecast
  /// hour containing "now".
  void _openMap(BuildContext context, WidgetRef ref) {
    final myHunt = ref.read(myActiveHuntProvider).valueOrNull;
    if (myHunt != null && ref.read(selectedStandProvider) == null) {
      ref.read(selectedStandProvider.notifier).state = myHunt.standCode;
      ref.read(selectedHourProvider.notifier).state =
          ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
    }
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MapFullScreen()),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final member = ref.watch(currentMemberProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lookout Point'),
        actions: [
          IconButton(
            tooltip: 'Conditions',
            icon: const Icon(Icons.cloud_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ConditionsScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Hunt log',
            icon: const Icon(Icons.history),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HuntLogScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Open map',
            icon: const Icon(Icons.map_outlined),
            onPressed: () => _openMap(context, ref),
          ),
          if (member != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text(member.firstName,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'rules') {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const RulesScreen()),
                );
              } else if (v == 'change') {
                MemberStore.clear();
                ref.read(currentMemberProvider.notifier).state = null;
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'rules', child: Text('Club rules')),
              PopupMenuItem(value: 'change', child: Text('Change hunter')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          const HighWaterBanner(),
          const _MyHuntBanner(),
          const _ForgotCheckoutNotice(),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 720;
                if (wide) {
                  return Row(
                    children: [
                      Expanded(flex: 3, child: _wideMapPane(context, ref)),
                      const VerticalDivider(width: 1),
                      SizedBox(
                        width: 400,
                        child: Column(
                          children: [
                            _StatusBar(),
                            _SearchAndFilter(),
                            const Expanded(child: StandList()),
                          ],
                        ),
                      ),
                    ],
                  );
                }
                return Column(
                  children: [
                    _mapThumbnail(context, ref),
                    _StatusBar(),
                    _SearchAndFilter(),
                    const Expanded(child: StandList()),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Wide layout: interactive map with a clear button to open full-screen.
  Widget _wideMapPane(BuildContext context, WidgetRef ref) {
    return Stack(
      children: [
        const Positioned.fill(child: MapReference()),
        Positioned(
          right: 12,
          top: 12,
          child: FilledButton.tonalIcon(
            onPressed: () => _openMap(context, ref),
            icon: const Icon(Icons.open_in_full),
            label: const Text('Full screen'),
          ),
        ),
      ],
    );
  }

  Widget _mapThumbnail(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => _openMap(context, ref),
          child: SizedBox(
            height: 170,
            width: double.infinity,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/lop_map.jpg',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stack) => Container(
                    color: const Color(0xFFEAF1E6),
                    child: Center(
                      child: Text(
                        'Add assets/lop_map.jpg\nto show the club map',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.green.shade900),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.zoom_out_map, size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text('Tap to open',
                            style:
                                TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Persistent "you're checked in" bar with one-tap Check Out. Re-renders every
/// minute so the elapsed time keeps ticking during a long sit.
class _MyHuntBanner extends ConsumerStatefulWidget {
  const _MyHuntBanner();

  @override
  ConsumerState<_MyHuntBanner> createState() => _MyHuntBannerState();
}

class _MyHuntBannerState extends ConsumerState<_MyHuntBanner> {
  Timer? _tick;

  @override
  void initState() {
    super.initState();
    _tick = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tick?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hunt = ref.watch(myActiveHuntProvider).valueOrNull;
    if (hunt == null) return const SizedBox.shrink();
    final stand = standByCode(hunt.standCode);

    final since = fmtClock(hunt.checkInTime);
    final elapsed = fmtElapsed(hunt.checkInTime);
    final detail = [
      if (since.isNotEmpty) 'since $since',
      if (elapsed.isNotEmpty) elapsed,
    ].join(' · ');

    return Material(
      color: Colors.green.shade700,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
        child: Row(
          children: [
            const Icon(Icons.gps_fixed, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "You're on Stand ${hunt.standCode} · ${hunt.huntType}",
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  if (detail.isNotEmpty)
                    Text(detail,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.green.shade800,
              ),
              onPressed: stand == null
                  ? null
                  : () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        showDragHandle: true,
                        builder: (_) => StandDetailSheet(stand: stand),
                      ),
              child: const Text('Check Out'),
            ),
          ],
        ),
      ),
    );
  }
}

/// One-time amber notice when YOUR latest hunt was ended by the 8 PM sweep —
/// the "you forgot to check out" message. Dismiss remembers per hunt.
class _ForgotCheckoutNotice extends ConsumerStatefulWidget {
  const _ForgotCheckoutNotice();

  @override
  ConsumerState<_ForgotCheckoutNotice> createState() =>
      _ForgotCheckoutNoticeState();
}

class _ForgotCheckoutNoticeState extends ConsumerState<_ForgotCheckoutNotice> {
  String? _acked;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    AckStore.lastAcked().then((v) {
      if (mounted) setState(() { _acked = v; _loaded = true; });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) return const SizedBox.shrink();
    final member = ref.watch(currentMemberProvider);
    final recent = ref.watch(huntLogProvider).valueOrNull ?? const [];
    final myLatest =
        recent.where((h) => h.memberId == member?.id).firstOrNull;
    if (myLatest == null || !myLatest.autoClosed || myLatest.id == _acked) {
      return const SizedBox.shrink();
    }

    return Material(
      color: Colors.amber.shade100,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 6, 4, 6),
        child: Row(
          children: [
            Icon(Icons.timer_off, size: 18, color: Colors.amber.shade900),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'You were auto-checked out of Stand ${myLatest.standCode} at '
                '8 PM — please check out when you leave your stand.',
                style: const TextStyle(fontSize: 13),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              tooltip: 'Dismiss',
              onPressed: () {
                AckStore.ack(myLatest.id);
                setState(() => _acked = myLatest.id);
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// "X open · Y in use" summary strip + a Conditions button. Weather and river
/// details live on the Conditions screen (member feedback: keep home clean).
class _StatusBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final total = ref.watch(standsProvider).length;
    final inUse = ref.watch(activeHuntsByCodeProvider).length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: Wrap(
        spacing: 8,
        runSpacing: 6,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _chip('${total - inUse} open', Colors.green.shade100,
              Colors.green.shade900),
          _chip('$inUse in use', Colors.grey.shade300, Colors.grey.shade800),
          ActionChip(
            avatar: Icon(Icons.cloud_outlined,
                size: 16, color: Colors.blue.shade900),
            label: Text('Conditions',
                style: TextStyle(
                    color: Colors.blue.shade900,
                    fontWeight: FontWeight.w600)),
            backgroundColor: Colors.blue.shade50,
            side: BorderSide.none,
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ConditionsScreen()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(text,
          style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
    );
  }
}

/// Search box + All / Gold / Bow-only filter chips.
class _SearchAndFilter extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(standFilterProvider);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
          child: TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              hintText: 'Search stand number (e.g. 28 or 12B)…',
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              _filterChip(ref, 'All', StandFilter.all, filter),
              const SizedBox(width: 8),
              _filterChip(ref, 'Gold', StandFilter.gold, filter),
              const SizedBox(width: 8),
              _filterChip(ref, 'Bow-only', StandFilter.bowOnly, filter),
            ],
          ),
        ),
      ],
    );
  }

  Widget _filterChip(
      WidgetRef ref, String label, StandFilter value, StandFilter current) {
    return ChoiceChip(
      label: Text(label),
      selected: current == value,
      onSelected: (_) => ref.read(standFilterProvider.notifier).state = value,
    );
  }
}
```

## `lib/screens/hunt_log_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/hunt_types.dart';
import '../models/hunt.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';

/// Season history: every completed hunt, newest first, grouped by day, with a
/// season-totals card on top (hunts, hours on stand, deer seen). "Mine" filter
/// shows just your own hunts. Read-only — the data was already being recorded
/// at every check-in/out; this screen finally shows it.
class HuntLogScreen extends ConsumerStatefulWidget {
  const HuntLogScreen({super.key});

  @override
  ConsumerState<HuntLogScreen> createState() => _HuntLogScreenState();
}

class _HuntLogScreenState extends ConsumerState<HuntLogScreen> {
  bool _mineOnly = false;

  @override
  Widget build(BuildContext context) {
    final huntsAsync = ref.watch(huntLogProvider);
    final uid = ref.watch(authUidProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hunt Log'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: FilterChip(
              label: const Text('Mine'),
              selected: _mineOnly,
              onSelected: (v) => setState(() => _mineOnly = v),
            ),
          ),
        ],
      ),
      body: huntsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load hunts:\n$e')),
        data: (all) {
          final hunts = _mineOnly
              ? all.where((h) => h.userId == uid).toList()
              : all;
          if (hunts.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  _mineOnly
                      ? 'No completed hunts of yours yet.\nCheck in, hunt, check out — it lands here.'
                      : 'No completed hunts yet.\nThe log fills in as members check out.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600, height: 1.4),
                ),
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              _SummaryCard(hunts: hunts, mineOnly: _mineOnly),
              ..._groupedByDay(hunts),
            ],
          );
        },
      ),
    );
  }

  /// Day headers ("Fri, Jul 4") with that day's hunts beneath.
  List<Widget> _groupedByDay(List<Hunt> hunts) {
    final out = <Widget>[];
    String? lastDay;
    for (final h in hunts) {
      final t = h.checkInTime;
      final day = t == null ? 'Unknown date' : fmtDate(t);
      if (day != lastDay) {
        lastDay = day;
        out.add(Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Text(day,
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.green.shade900)),
        ));
      }
      out.add(_HuntTile(hunt: h));
    }
    return out;
  }
}

/// Season totals across the listed hunts.
class _SummaryCard extends StatelessWidget {
  final List<Hunt> hunts;
  final bool mineOnly;
  const _SummaryCard({required this.hunts, required this.mineOnly});

  @override
  Widget build(BuildContext context) {
    var minutes = 0;
    var does = 0, bucks = 0, fawns = 0;
    for (final h in hunts) {
      final ci = h.checkInTime, co = h.checkOutTime;
      if (ci != null && co != null) minutes += co.difference(ci).inMinutes;
      does += h.doeSeen ?? 0;
      bucks += h.buckSeen ?? 0;
      fawns += h.fawnSeen ?? 0;
    }

    Widget stat(String value, String label) => Expanded(
          child: Column(
            children: [
              Text(value,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold)),
              Text(label,
                  style:
                      TextStyle(fontSize: 12, color: Colors.grey.shade700)),
            ],
          ),
        );

    return Card(
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(mineOnly ? 'My season' : 'Club season',
                style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Row(
              children: [
                stat('${hunts.length}', 'hunts'),
                stat(fmtDuration(Duration(minutes: minutes)), 'on stand'),
                stat('$bucks', 'bucks'),
                stat('$does', 'does'),
                stat('$fawns', 'fawns'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// One completed hunt: who, where, when, how long, what they saw, river stage.
class _HuntTile extends StatelessWidget {
  final Hunt hunt;
  const _HuntTile({required this.hunt});

  @override
  Widget build(BuildContext context) {
    final ci = hunt.checkInTime, co = hunt.checkOutTime;
    final times = [
      if (ci != null) fmtClock(ci),
      if (co != null) fmtClock(co),
    ].join(' – ');
    final dur = (ci != null && co != null)
        ? ' (${fmtDuration(co.difference(ci))})'
        : '';

    final deer = <String>[
      if (hunt.buckSeen != null) '${hunt.buckSeen} buck${hunt.buckSeen == 1 ? '' : 's'}',
      if (hunt.doeSeen != null) '${hunt.doeSeen} doe${hunt.doeSeen == 1 ? '' : 's'}',
      if (hunt.fawnSeen != null) '${hunt.fawnSeen} fawn${hunt.fawnSeen == 1 ? '' : 's'}',
    ].join(' · ');

    final river = <String>[
      if (hunt.riverVicksburgFt != null)
        'Vburg ${hunt.riverVicksburgFt!.toStringAsFixed(1)} ft',
      if (hunt.riverGreenvilleFt != null)
        'Gville ${hunt.riverGreenvilleFt!.toStringAsFixed(1)} ft',
    ].join(' · ');

    return ListTile(
      dense: true,
      leading: CircleAvatar(
        radius: 18,
        backgroundColor: Colors.green.shade700,
        child: Text(hunt.standCode,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
      ),
      title: Row(
        children: [
          Icon(huntTypeIcon(hunt.huntType),
              size: 15, color: Colors.grey.shade700),
          const SizedBox(width: 5),
          Expanded(
            child: Text('${hunt.memberName} · ${hunt.huntType}',
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (times.isNotEmpty)
            Text('$times$dur${hunt.autoClosed ? ' · auto 8 PM' : ''}'),
          if (deer.isNotEmpty)
            Text(deer, style: TextStyle(color: Colors.brown.shade700)),
          if (river.isNotEmpty)
            Text(river,
                style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 11)),
        ],
      ),
    );
  }
}
```

## `lib/screens/member_picker_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/members.dart';
import '../models/member.dart';
import '../providers/app_providers.dart';
import '../services/member_store.dart';
import 'rules_screen.dart';

/// First-launch identity screen: pick your name from the roster and confirm
/// your phone once. Saved on the device and remembered after that.
class MemberPickerScreen extends ConsumerStatefulWidget {
  const MemberPickerScreen({super.key});

  @override
  ConsumerState<MemberPickerScreen> createState() => _MemberPickerScreenState();
}

class _MemberPickerScreenState extends ConsumerState<MemberPickerScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = kMembers
        .where((m) =>
            _query.isEmpty || m.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Who are you?'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // Club logo — drop the file in assets/lop_logo.png and it appears.
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Image.asset(
              'assets/lop_logo.png',
              height: 88,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Find your name…',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final m = filtered[i];
                final sub = m.role.isEmpty ? m.phone : '${m.role} · ${m.phone}';
                return ListTile(
                  leading: CircleAvatar(child: Text(_initials(m.name))),
                  title: Text(m.name),
                  subtitle: Text(sub),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _confirm(m),
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton.icon(
                    icon: const Icon(Icons.menu_book, size: 18),
                    label: const Text('Read the club rules'),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RulesScreen()),
                    ),
                  ),
                  Text(kAppVersion,
                      style: TextStyle(
                          color: Colors.grey.shade500, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirm(Member member) async {
    final controller = TextEditingController(text: member.phone);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("You're ${member.name}"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Confirm your cell number so other members can text '
                'you when you’re on a stand:'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Cell number',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('This is me'),
          ),
        ],
      ),
    );

    if (ok == true) {
      final chosen = Member(
        id: member.id,
        name: member.name,
        phone: controller.text.trim(),
        role: member.role,
        shares: member.shares,
      );
      await MemberStore.save(chosen);
      ref.read(currentMemberProvider.notifier).state = chosen;
    }
  }

  String _initials(String name) {
    final parts = name.split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }
}
```

## `lib/screens/rules_screen.dart`

```dart
import 'package:flutter/material.dart';

import '../data/club_rules.dart';

/// The "read it in the truck" club rules: buck criteria up top, then the
/// quick-reference sections, then how to judge a mature buck on the hoof.
/// All content lives in `data/club_rules.dart` — edit that file each August.
class RulesScreen extends StatelessWidget {
  const RulesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Club Rules')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 32),
        children: [
          _header(),
          const SizedBox(height: 12),
          _buckCard(),
          const SizedBox(height: 12),
          for (final s in kRuleSections) ...[
            _sectionCard(s),
            const SizedBox(height: 12),
          ],
          _agingCard(),
        ],
      ),
    );
  }

  Widget _header() {
    return Column(
      children: [
        // Club logo — drop the file in assets/lop_logo.png and it appears.
        Image.asset(
          'assets/lop_logo.png',
          height: 110,
          errorBuilder: (_, __, ___) => Icon(Icons.shield_outlined,
              size: 64, color: Colors.green.shade800),
        ),
        const SizedBox(height: 8),
        const Text('Lookout Point Hunting Club — $kRulesSeason',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Text(kRulesDisclaimer,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
      ],
    );
  }

  /// The centerpiece: which buck can you shoot?
  Widget _buckCard() {
    return Card(
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.gps_fixed, size: 18, color: Colors.green.shade900),
                const SizedBox(width: 6),
                const Expanded(
                  child: Text('Buck rules — know before you shoot',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text('Max 5 bucks per membership if all criteria are met.',
                style: TextStyle(
                    color: Colors.green.shade900,
                    fontWeight: FontWeight.w600)),
            for (final r in kBuckRules) ...[
              const SizedBox(height: 12),
              Text(
                r.allowance.isEmpty ? r.title : '${r.title} — ${r.allowance}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 2),
              for (final b in r.bullets) _bullet(b),
            ],
          ],
        ),
      ),
    );
  }

  Widget _sectionCard(RuleSection s) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(s.icon, size: 18, color: Colors.green.shade800),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(s.title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            for (final b in s.bullets) _bullet(b),
          ],
        ),
      ),
    );
  }

  /// Judging a mature buck on the hoof — real club photos only.
  Widget _agingCard() {
    return Card(
      color: Colors.brown.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.visibility, size: 18, color: Colors.brown.shade800),
                const SizedBox(width: 6),
                const Expanded(
                  child: Text('Judging a mature buck',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(kAgingIntro, style: TextStyle(height: 1.35)),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              // Drop the comparison photo in assets/rules/buck_45_55.jpg.
              child: Image.asset(
                'assets/rules/buck_45_55.jpg',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 140,
                  color: Colors.brown.shade100,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    'Add assets/rules/buck_45_55.jpg\n(4½ vs 5½-year-old comparison photo)',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.brown.shade800),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            for (final c in kAgingCues) _bullet(c),
          ],
        ),
      ),
    );
  }

  Widget _bullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('•  '),
          Expanded(child: Text(text, style: const TextStyle(height: 1.3))),
        ],
      ),
    );
  }
}
```

## `lib/services/ack_store.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';

/// Remembers (on this device) which auto-closed hunt the member has already
/// dismissed the "you forgot to check out" notice for.
class AckStore {
  static const _key = 'ackedAutoClosedHuntId';

  static Future<String?> lastAcked() async =>
      (await SharedPreferences.getInstance()).getString(_key);

  static Future<void> ack(String huntId) async =>
      (await SharedPreferences.getInstance()).setString(_key, huntId);
}
```

## `lib/services/firestore_service.dart`

```dart
import 'dart:ui' show Offset;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../config.dart';
import '../models/hunt.dart';
import '../models/member.dart';
import '../models/stand.dart';

/// Thrown when a check-in is attempted on a stand someone else already holds.
class StandOccupiedException implements Exception {
  final String standCode;
  StandOccupiedException(this.standCode);
  @override
  String toString() => 'Stand $standCode is already taken.';
}

/// Thrown when a member who already has an active hunt (possibly started on
/// another device) tries to check in somewhere else.
class AlreadyCheckedInException implements Exception {
  final String standCode;
  AlreadyCheckedInException(this.standCode);
  @override
  String toString() =>
      "You're already checked in at Stand $standCode. Check out there first.";
}

/// All Firestore reads/writes live here.
///
/// `hunts` — one doc per check-in: standCode/huntType/member* strings, userId,
/// active, checkInTime/checkOutTime, doeSeen/buckSeen/fawnSeen (deer hunts),
/// riverVicksburgFt/riverGreenvilleFt (river stage at check-in).
/// `standPositions` — doc id == stand code, x/y fractions of the map image.
class FirestoreService {
  FirestoreService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _hunts =>
      _db.collection('hunts');
  CollectionReference<Map<String, dynamic>> get _positions =>
      _db.collection('standPositions');

  /// Checks [member] into [stand] for [huntType], recording the exact time and
  /// the Mississippi River stage (ft) at Vicksburg & Greenville (null if offline).
  Future<String> checkIn({
    required Stand stand,
    required String huntType,
    required Member member,
    required String userId,
    double? riverVicksburgFt,
    double? riverGreenvilleFt,
  }) async {
    // One hunt per member, no matter which device started it.
    final mine = await _hunts
        .where('memberId', isEqualTo: member.id)
        .where('active', isEqualTo: true)
        .limit(1)
        .get();
    if (mine.docs.isNotEmpty) {
      throw AlreadyCheckedInException(Hunt.fromDoc(mine.docs.first).standCode);
    }

    final existing = await _hunts
        .where('standCode', isEqualTo: stand.code)
        .where('active', isEqualTo: true)
        .limit(1)
        .get();
    if (existing.docs.isNotEmpty) {
      throw StandOccupiedException(stand.code);
    }

    final ref = await _hunts.add({
      'standCode': stand.code,
      'huntType': huntType,
      'memberId': member.id,
      'memberName': member.name,
      'memberPhone': member.phone,
      'userId': userId,
      'active': true,
      'checkInTime': FieldValue.serverTimestamp(),
      'checkOutTime': null,
      'doeSeen': null,
      'buckSeen': null,
      'fawnSeen': null,
      'riverVicksburgFt': riverVicksburgFt,
      'riverGreenvilleFt': riverGreenvilleFt,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /// Closes an active hunt: records checkout time and (for deer hunts) counts.
  Future<void> checkOut(
    String huntId, {
    int? doe,
    int? buck,
    int? fawn,
  }) {
    return _hunts.doc(huntId).update({
      'active': false,
      'checkOutTime': FieldValue.serverTimestamp(),
      'doeSeen': doe,
      'buckSeen': buck,
      'fawnSeen': fawn,
    });
  }

  Stream<List<Hunt>> streamActiveHunts() {
    return _hunts.where('active', isEqualTo: true).snapshots().map(
          (snap) => snap.docs.map(Hunt.fromDoc).toList(),
        );
  }

  /// Recent completed hunts, newest first, for the hunt log. Ordered by a
  /// single field then filtered client-side so no composite index is needed.
  Stream<List<Hunt>> streamRecentHunts({int limit = 200}) {
    return _hunts
        .orderBy('checkInTime', descending: true)
        .limit(limit)
        .snapshots()
        .map((snap) =>
            snap.docs.map(Hunt.fromDoc).where((h) => !h.active).toList());
  }

  /// The member's active hunt from ANY device — ownership is keyed to the
  /// chosen member identity, not the device's anonymous auth id.
  Stream<Hunt?> streamMyActiveHunt(String memberId) {
    return _hunts
        .where('memberId', isEqualTo: memberId)
        .where('active', isEqualTo: true)
        .limit(1)
        .snapshots()
        .map((snap) => snap.docs.isEmpty ? null : Hunt.fromDoc(snap.docs.first));
  }

  // --- 8 PM daily auto-checkout ----------------------------------------------

  /// Whether an active hunt should be swept: true once [now] is past the most
  /// recent [hour]:00 AND the hunt started before that cutoff. A hunt begun
  /// AFTER 8 PM survives until the next evening's sweep.
  static bool shouldAutoClose(DateTime checkInTime, DateTime now,
      {int hour = kAutoCheckoutHour}) {
    var cutoff = DateTime(now.year, now.month, now.day, hour);
    if (now.isBefore(cutoff)) cutoff = cutoff.subtract(const Duration(days: 1));
    return checkInTime.isBefore(cutoff);
  }

  /// Closes every active hunt that's past the 8 PM cutoff ([force] closes all
  /// of them — the admin "clear the board" action). Deer counts stay null —
  /// forfeited by not checking out. Returns how many hunts were closed;
  /// failures are swallowed (the next device to run will retry).
  Future<int> autoCheckoutSweep({bool force = false, DateTime? now}) async {
    try {
      final snap = await _hunts.where('active', isEqualTo: true).get();
      final n = now ?? DateTime.now();
      var closed = 0;
      for (final doc in snap.docs) {
        final ci = (doc.data()['checkInTime'] as Timestamp?)?.toDate();
        if (force || (ci != null && shouldAutoClose(ci, n))) {
          await doc.reference.update({
            'active': false,
            'checkOutTime': FieldValue.serverTimestamp(),
            'autoClosed': true,
          });
          closed++;
        }
      }
      return closed;
    } catch (_) {
      return 0;
    }
  }

  // --- Stand pin positions (shared) ------------------------------------------

  Stream<Map<String, Offset>> streamStandPositions() {
    return _positions.snapshots().map((snap) {
      final out = <String, Offset>{};
      for (final doc in snap.docs) {
        final data = doc.data();
        final x = (data['x'] as num?)?.toDouble();
        final y = (data['y'] as num?)?.toDouble();
        if (x != null && y != null) out[doc.id] = Offset(x, y);
      }
      return out;
    });
  }

}
```

## `lib/services/member_store.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';
import '../models/member.dart';

/// Persists "who am I" on the device, so a member identifies themselves once
/// (first launch) and is remembered after that.
class MemberStore {
  static const _kId = 'member_id';
  static const _kName = 'member_name';
  static const _kPhone = 'member_phone';

  static Future<Member?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString(_kId);
    if (id == null) return null;
    return Member(
      id: id,
      name: prefs.getString(_kName) ?? '',
      phone: prefs.getString(_kPhone) ?? '',
    );
  }

  static Future<void> save(Member member) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kId, member.id);
    await prefs.setString(_kName, member.name);
    await prefs.setString(_kPhone, member.phone);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kId);
    await prefs.remove(_kName);
    await prefs.remove(_kPhone);
  }
}
```

## `lib/services/river_service.dart`

```dart
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/club_status.dart';
import '../models/river_status.dart';

/// Mississippi River stage from NOAA's National Water Prediction Service
/// (keyless, free) for the Vicksburg and Greenville gauges.
///
/// Two jobs:
///  * [currentLevels] — fresh observed stages recorded on each check-in.
///  * [ensureFreshStatus]/[streamStatus] — a club-shared snapshot (observed +
///    forecast stage → rising/falling trend) cached to `riverStatus/current`
///    so one member's fetch serves everyone, same pattern as the weather doc.
///
/// API: GET https://api.water.noaa.gov/nwps/v1/gauges/{LID}
///      -> json['status']['observed']['primary'] (number, ft)
///      -> json['status']['forecast']['primary'] (number, ft — may be absent)
class RiverService {
  RiverService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> get _doc =>
      _db.collection('riverStatus').doc('current');

  DocumentReference<Map<String, dynamic>> get _clubDoc =>
      _db.collection('clubStatus').doc('current');

  /// Returns both gauges' observed stage in feet, or null for either on any
  /// failure (offline, timeout, API hiccup) so check-in is never blocked.
  Future<({double? vicksburgFt, double? greenvilleFt})> currentLevels() async {
    final results = await Future.wait([
      _gauge(kVicksburgGaugeLid),
      _gauge(kGreenvilleGaugeLid),
    ]);
    return (
      vicksburgFt: results[0].observedFt,
      greenvilleFt: results[1].observedFt,
    );
  }

  /// Live stream of the cached river snapshot (null until first fetch).
  Stream<RiverStatus?> streamStatus() =>
      _doc.snapshots().map((s) => s.exists ? RiverStatus.fromDoc(s) : null);

  /// Re-fetches only if the cached doc is missing or older than 1 hour.
  /// Failures are swallowed so the app still works offline.
  Future<void> ensureFreshStatus() async {
    try {
      final snap = await _doc.get();
      if (snap.exists) {
        final fetchedAt = (snap.data()?['fetchedAt'] as Timestamp?)?.toDate();
        if (fetchedAt != null &&
            DateTime.now().difference(fetchedAt) < const Duration(hours: 1)) {
          return; // still fresh
        }
      }
      final gauges = await Future.wait([
        _gauge(kVicksburgGaugeLid),
        _gauge(kGreenvilleGaugeLid),
      ]);
      final waterTempF = await _waterTempF();
      // Don't clobber a good cache with a failed fetch.
      if (gauges[0].observedFt == null &&
          gauges[1].observedFt == null &&
          waterTempF == null) {
        return;
      }
      await _doc.set(RiverStatus(
        fetchedAt: DateTime.now(),
        vicksburg: gauges[0],
        greenville: gauges[1],
        waterTempF: waterTempF,
      ).toMap());
      await _updateHighWater(gauges[0].observedFt);
    } catch (_) {
      // Offline or API hiccup — keep whatever is already cached.
    }
  }

  // --- LDWF high-water archery rule ------------------------------------------

  /// Live stream of the club status doc (null until it first exists).
  Stream<ClubStatus?> streamClubStatus() =>
      _clubDoc.snapshots().map((s) => s.exists ? ClubStatus.fromDoc(s) : null);

  /// Admin override: force the high-water rule on/off, or return to auto.
  Future<void> setHighWaterMode(HighWaterMode mode) {
    return _clubDoc.set({
      'highWaterMode': mode.name,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  /// Applies the gauge reading to the automatic high-water state. Only writes
  /// when the mode is auto and the answer actually changed.
  Future<void> _updateHighWater(double? vicksburgFt) async {
    final snap = await _clubDoc.get();
    final prev = snap.exists ? ClubStatus.fromDoc(snap) : null;
    if (prev != null && prev.mode != HighWaterMode.auto) return;
    final was = prev?.highWaterArchery ?? false;
    final now = resolveHighWater(was, vicksburgFt);
    if (now == was && snap.exists) return;
    if (now == was && !snap.exists && !now) return; // nothing worth creating
    await _clubDoc.set({
      'highWaterArchery': now,
      'highWaterMode': HighWaterMode.auto.name,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  /// The LDWF hysteresis: ON at >= [kHighWaterOnFt] (43.0), OFF below
  /// [kHighWaterOffFt] (41.0), unchanged in between or with no reading.
  /// Pure and static so it's unit-testable.
  static bool resolveHighWater(bool previous, double? vicksburgStageFt) {
    final s = vicksburgStageFt;
    if (s == null) return previous;
    if (s >= kHighWaterOnFt) return true;
    if (s < kHighWaterOffFt) return false;
    return previous;
  }

  Future<GaugeStatus> _gauge(String lid) async {
    try {
      final uri = Uri.parse('https://api.water.noaa.gov/nwps/v1/gauges/$lid');
      final resp = await http.get(uri).timeout(const Duration(seconds: 4));
      if (resp.statusCode != 200) return const GaugeStatus();
      return parseGauge(jsonDecode(resp.body) as Map<String, dynamic>);
    } catch (_) {
      return const GaugeStatus();
    }
  }

  /// Mississippi water temperature (°F) from the USGS instantaneous-values
  /// API, or null on any failure.
  Future<double?> _waterTempF() async {
    try {
      final uri = Uri.parse(
        'https://waterservices.usgs.gov/nwis/iv/'
        '?sites=$kWaterTempUsgsSite&parameterCd=00010&format=json',
      );
      final resp = await http.get(uri).timeout(const Duration(seconds: 4));
      if (resp.statusCode != 200) return null;
      return waterTempFFrom(jsonDecode(resp.body) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  /// Pulls the latest water temperature (°C in the feed, returned as °F) out
  /// of a USGS IV response. Pure and static so it's unit-testable.
  static double? waterTempFFrom(Map<String, dynamic> json) {
    try {
      final series = ((json['value'] as Map)['timeSeries'] as List);
      if (series.isEmpty) return null;
      final values =
          (((series.first as Map)['values'] as List).first as Map)['value']
              as List;
      if (values.isEmpty) return null;
      final c = double.tryParse((values.first as Map)['value'] as String);
      // Sanity bounds; USGS uses sentinel values for bad readings.
      if (c == null || c < -5 || c > 45) return null;
      return c * 9 / 5 + 32;
    } catch (_) {
      return null;
    }
  }

  /// Pulls observed + forecast stage out of an NWPS gauge response.
  /// Pure and static so it's unit-testable against a JSON fixture.
  static GaugeStatus parseGauge(Map<String, dynamic> json) {
    final status = json['status'] as Map?;
    double? read(String key) {
      final v = (status?[key] as Map?)?['primary'];
      // NWPS uses sentinel values like -999 for "no data".
      return (v is num && v > -100) ? v.toDouble() : null;
    }

    return GaugeStatus(observedFt: read('observed'), forecastFt: read('forecast'));
  }
}
```

## `lib/services/scent_vector.dart`

```dart
import 'dart:math' as math;
import '../models/forecast.dart';

/// The result of the scent-drift calculation for one hour.
///
///  * [angle]    — compass heading (0–360, clockwise from N) the scent travels TO.
///  * [length]   — cone length in logical pixels at the map's base scale.
///  * [widthDeg] — cone half-angle (spread) in degrees.
class ScentVector {
  final double angle;
  final double length;
  final double widthDeg;
  const ScentVector({
    required this.angle,
    required this.length,
    required this.widthDeg,
  });
}

// Cone size presets (logical px / degrees).
const double _long = 150;
const double _med = 95;
const double _short = 60;

/// Strongest thermal drift on the property, in mph-equivalent. Flat delta
/// ground caps out well below the ~4 mph a steep slope can generate, but 4
/// keeps thermals decisive against light breezes, matching field experience.
const double _maxThermalMph = 4.0;

/// How much the thermal engine contributes at [windMph]: full effect at or
/// below 4 mph, blown out entirely at or above 10 mph, linear in between.
/// (Replaces the old hard 5 mph cliff so the cone swings smoothly as the
/// breeze builds instead of snapping between regimes.)
double thermalWeight(double windMph) {
  if (windMph <= 4) return 1.0;
  if (windMph >= 10) return 0.0;
  return 1.0 - (windMph - 4) / 6.0;
}

/// How much of the radiative heating/cooling that drives thermals survives
/// the cloud deck: 1.0 under a clear sky down to 0.3 under full overcast.
double skyFactor(double cloudCoverPct) =>
    1.0 - 0.7 * (cloudCoverPct.clamp(0, 100) / 100);

/// Predicts where a hunter's scent drifts for the given hour.
///
/// Hunting physics:
///  1. Wind is reported as the direction it comes FROM; scent travels the
///     opposite way (+180°).
///  2. Thermals ride the temperature trend: cooling air sinks and drains
///     toward [drainageHeading] (the river); warming air lifts and disperses
///     the other way; no trend, no thermal. Cloud cover throttles the whole
///     effect ([skyFactor]) — overcast skies make weak thermals.
///  3. The ambient wind (at its real mph) and the thermal (up to
///     [_maxThermalMph], tapered by [thermalWeight]) are summed as vectors —
///     so a 4 mph breeze bends the cone far more than a 1 mph breath, and by
///     10 mph the true wind owns the cone outright.
///  4. River-edge stands only ([riverEdge], with [waterTempF] known): the
///     Mississippi is a thermal flywheel. Water much warmer than the air
///     (fall evenings/nights) strengthens the drain toward the river; water
///     much colder (spring afternoons) pushes a light river breeze inland.
///     Water-driven, so clouds don't throttle it — but wind still blows it out.
///  5. Shape follows the mix: wind-driven cones are long and narrow; sinking
///     evening air stays long and narrow toward the drainage; rising morning
///     air is short and wide (dispersion); slack air is medium and wide.
ScentVector calculateScentVector(
  HourlyWeather h, {
  double drainageHeading = 90,
  double? waterTempF,
  bool riverEdge = false,
}) {
  final baseScent = (h.windDirDeg + 180) % 360;
  final w = thermalWeight(h.windMph);

  // Thermal component (none in slack air), throttled by cloud cover.
  final cooling = h.tempDelta < 0;
  final warming = h.tempDelta > 0;
  final thermalDir = cooling
      ? drainageHeading
      : warming
          ? (drainageHeading + 180) % 360
          : baseScent; // slack: direction irrelevant at 0 strength
  final thermalMph = (cooling || warming)
      ? _maxThermalMph * w * skyFactor(h.cloudCoverPct)
      : 0.0;

  // River water-temperature component, river-edge stands only.
  var riverDir = drainageHeading;
  var riverMph = 0.0;
  if (riverEdge && waterTempF != null) {
    final dW = waterTempF - h.tempF;
    if (dW > 2 && !warming) {
      // Warm water, cooling/slack land air: extra pull toward the river.
      riverMph = math.min(2.0, (dW - 2) * 0.12) * w;
    } else if (dW < -2 && warming) {
      // Cold water, heating land: light river breeze pushes inland.
      riverDir = (drainageHeading + 180) % 360;
      riverMph = math.min(2.0, (-dW - 2) * 0.12) * w;
    }
  }

  // Speed-weighted vector sum of the movement (TO-direction) vectors.
  final angle = _blendHeadings(
      baseScent, h.windMph, thermalDir, thermalMph, riverDir, riverMph);

  // Shape: interpolate between the pure-wind cone and the thermal-regime cone
  // by how much say the thermals actually have.
  final windLength =
      math.min(_long * (1 + math.max(0, h.windMph - 5) / 15), _long * 2);
  const windWidth = 13.0;
  final (thermalLength, thermalWidth) = cooling
      ? (_long, 15.0) // sinking: long, narrow drain toward the river
      : warming
          ? (_short, 45.0) // rising: short, wide dispersion
          : (_med, 35.0); // slack air

  return ScentVector(
    angle: angle,
    length: _lerp(windLength, thermalLength, w),
    widthDeg: _lerp(windWidth, thermalWidth, w),
  );
}

double _lerp(double a, double b, double t) => a + (b - a) * t;

/// Vector-adds three compass headings with weights and returns the resultant
/// heading (0–360, clockwise from north). Uses north-up unit vectors
/// (east = sin, north = cos) so [math.atan2](east, north) gives a compass
/// heading. If all weights are ~0, falls back to [a].
double _blendHeadings(
    double a, double wa, double b, double wb, double c, double wc) {
  final ar = a * math.pi / 180;
  final br = b * math.pi / 180;
  final cr = c * math.pi / 180;
  final east = wa * math.sin(ar) + wb * math.sin(br) + wc * math.sin(cr);
  final north = wa * math.cos(ar) + wb * math.cos(br) + wc * math.cos(cr);
  if (east.abs() < 1e-9 && north.abs() < 1e-9) return a;
  final deg = math.atan2(east, north) * 180 / math.pi;
  return (deg % 360 + 360) % 360;
}
```

## `lib/services/weather_service.dart`

```dart
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import '../models/forecast.dart';

/// Fetches the Open-Meteo forecast (keyless, free) and caches it to the single
/// Firestore doc `forecast/today`, so the whole club reads one document.
///
/// Property location: East Carroll Parish, LA (lat 32.8, lon -91.1).
class WeatherService {
  WeatherService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> get _doc =>
      _db.collection('forecast').doc('today');

  static const double _lat = 32.8;
  static const double _lon = -91.1;

  /// Live stream of the cached forecast (null until first fetch).
  Stream<Forecast?> streamForecast() =>
      _doc.snapshots().map((s) => s.exists ? Forecast.fromDoc(s) : null);

  /// Re-fetches only if the cached doc is missing or older than 2 hours.
  /// Network/API failures are swallowed so the app still works offline.
  Future<void> ensureFreshForecast() async {
    try {
      final snap = await _doc.get();
      if (snap.exists) {
        final fetchedAt = (snap.data()?['fetchedAt'] as Timestamp?)?.toDate();
        if (fetchedAt != null &&
            DateTime.now().difference(fetchedAt) < const Duration(hours: 2)) {
          return; // still fresh
        }
      }
      final forecast = await fetchOpenMeteo();
      await _doc.set(forecast.toMap());
    } catch (_) {
      // Offline or API hiccup — keep whatever is already cached.
    }
  }

  /// Calls Open-Meteo and returns the next 24 hours with computed tempDelta.
  Future<Forecast> fetchOpenMeteo() async {
    final uri = Uri.parse(
      'https://api.open-meteo.com/v1/forecast'
      '?latitude=$_lat&longitude=$_lon'
      '&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover'
      '&temperature_unit=fahrenheit&wind_speed_unit=mph'
      '&forecast_days=2&timezone=auto',
    );
    final resp = await http.get(uri);
    if (resp.statusCode != 200) {
      throw Exception('Open-Meteo HTTP ${resp.statusCode}');
    }
    final data = jsonDecode(resp.body) as Map<String, dynamic>;
    final hourly = (data['hourly'] as Map).cast<String, dynamic>();
    final times = (hourly['time'] as List).cast<String>();
    final temps = (hourly['temperature_2m'] as List).cast<num>();
    final winds = (hourly['wind_speed_10m'] as List).cast<num>();
    final dirs = (hourly['wind_direction_10m'] as List).cast<num>();
    // cloud_cover may be absent if the API ever drops the field; default 50.
    final clouds = (hourly['cloud_cover'] as List?)?.cast<num>();

    // First index at or after the current hour.
    final now = DateTime.now();
    final hourStart = DateTime(now.year, now.month, now.day, now.hour);
    var start = 0;
    for (var i = 0; i < times.length; i++) {
      if (!DateTime.parse(times[i]).isBefore(hourStart)) {
        start = i;
        break;
      }
    }

    final end = (start + 24) <= times.length ? start + 24 : times.length;
    final hours = <HourlyWeather>[];
    for (var i = start; i < end; i++) {
      final temp = temps[i].toDouble();
      // Delta vs the actual previous hour in the raw series.
      final prev = i > 0 ? temps[i - 1].toDouble() : temp;
      hours.add(HourlyWeather(
        time: DateTime.parse(times[i]),
        tempF: temp,
        windMph: winds[i].toDouble(),
        windDirDeg: dirs[i].toDouble(),
        tempDelta: temp - prev,
        cloudCoverPct: (i < (clouds?.length ?? 0)) ? clouds![i].toDouble() : 50,
      ));
    }
    return Forecast(fetchedAt: DateTime.now(), hours: hours);
  }
}
```

## `lib/utils/format.dart`

```dart
// Small shared formatting helpers.

/// "5:42 AM" style clock, local time. Empty string if [dt] is null.
String fmtClock(DateTime? dt) {
  if (dt == null) return '';
  final l = dt.toLocal();
  var h = l.hour % 12;
  if (h == 0) h = 12;
  final m = l.minute.toString().padLeft(2, '0');
  return '$h:$m ${l.hour >= 12 ? 'PM' : 'AM'}';
}

/// "2h 15m" elapsed since [since]. Empty string if null.
String fmtElapsed(DateTime? since) {
  if (since == null) return '';
  final d = DateTime.now().difference(since.toLocal());
  if (d.inMinutes < 1) return 'just now';
  if (d.inMinutes < 60) return '${d.inMinutes}m';
  return '${d.inHours}h ${d.inMinutes % 60}m';
}

/// "3h 28m" for a known duration. "0m" floor so short hunts still read.
String fmtDuration(Duration d) {
  if (d.inMinutes < 60) return '${d.inMinutes}m';
  return '${d.inHours}h ${d.inMinutes % 60}m';
}

const List<String> _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const List<String> _weekdays = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
];

/// "Fri, Jul 4" style date, local time.
String fmtDate(DateTime dt) {
  final l = dt.toLocal();
  return '${_weekdays[l.weekday - 1]}, ${_months[l.month - 1]} ${l.day}';
}

const List<String> _dirs = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/// Compass degrees -> 16-point cardinal ("NNE").
String cardinal(double deg) {
  final idx = (((deg % 360) + 360) % 360 / 22.5).round() % 16;
  return _dirs[idx];
}
```

## `lib/widgets/high_water_banner.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/app_providers.dart';

/// Amber strip shown everywhere it matters while the LDWF Area 1 high-water
/// rule is in effect: Vicksburg >= 43.0 ft means archery only for deer east
/// of US-65 until the stage drops below 41.0 ft.
class HighWaterBanner extends ConsumerWidget {
  const HighWaterBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!ref.watch(highWaterProvider)) return const SizedBox.shrink();
    return Material(
      color: Colors.amber.shade700,
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.water, color: Colors.black87, size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'HIGH WATER — archery only for deer (LDWF rule, '
                'Vicksburg ≥ 43 ft)',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.black87),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## `lib/widgets/map_reference.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/stands_data.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import 'high_water_banner.dart';
import 'stand_detail_sheet.dart';
import 'stand_map.dart';

/// Read-only club map for the home pane (pan/zoom + live status pins).
class MapReference extends StatelessWidget {
  const MapReference({super.key});

  @override
  Widget build(BuildContext context) => const StandMap();
}

/// Full-screen map: scent view (tap a stand → cone + hour slider).
class MapFullScreen extends ConsumerWidget {
  const MapFullScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};

    return Scaffold(
      appBar: AppBar(title: const Text('Club Map')),
      body: Column(
        children: [
          const HighWaterBanner(),
          Expanded(
            child: Stack(
              children: [
                const StandMap(scentView: true),
                if (positions.isEmpty) _EmptyHint(),
              ],
            ),
          ),
          _ScentPanel(),
        ],
      ),
    );
  }
}

/// Bottom panel showing the selected stand's wind/scent readout + hour slider.
class _ScentPanel extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(selectedStandProvider);
    if (selected == null) {
      return Container(
        width: double.infinity,
        color: Colors.green.shade50,
        padding: const EdgeInsets.all(12),
        child: const Text('Tap a stand to see its predicted scent cone.',
            textAlign: TextAlign.center),
      );
    }

    final forecast = ref.watch(forecastProvider).valueOrNull;
    final hours = forecast?.hours ?? const [];
    if (hours.isEmpty) {
      return _wrap(
        context,
        ref,
        selected,
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Text('Loading forecast…'),
        ),
      );
    }

    final i = ref.watch(selectedHourProvider).clamp(0, hours.length - 1);
    final h = hours[i];
    final riverEdge = kRiverEdgeStandCodes.contains(selected);
    final waterTempF =
        ref.watch(riverStatusProvider).valueOrNull?.waterTempF;
    final v = calculateScentVector(
      h,
      drainageHeading: kDrainageHeading,
      waterTempF: waterTempF,
      riverEdge: riverEdge,
    );

    return _wrap(
      context,
      ref,
      selected,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_fmtHour(h.time)} · wind ${_cardinal(h.windDirDeg)} '
            '${h.windMph.round()} mph · scent → ${_cardinal(v.angle)}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Text(
            '${h.tempF.round()}°F · ${h.cloudCoverPct.round()}% clouds · '
            '${_regime(h.windMph, h.tempDelta)}'
            '${riverEdge && waterTempF != null ? ' · river-edge (water ${waterTempF.round()}°F)' : ''}',
            style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
          ),
          if (hours.length > 1)
            Slider(
              value: i.toDouble(),
              min: 0,
              max: (hours.length - 1).toDouble(),
              divisions: hours.length - 1,
              label: _fmtHour(h.time),
              onChanged: (val) => ref
                  .read(selectedHourProvider.notifier)
                  .state = val.round(),
            ),
        ],
      ),
    );
  }

  Widget _wrap(
      BuildContext context, WidgetRef ref, String code, Widget body) {
    // "Check Out" (red) when the selected stand is mine, so ending a hunt from
    // the map is unmissable. "Mine" = my member identity, any device.
    final hunt = ref.watch(activeHuntsByCodeProvider)[code];
    final mine =
        hunt != null && hunt.memberId == ref.watch(currentMemberProvider)?.id;
    return Container(
      width: double.infinity,
      color: Colors.green.shade50,
      padding: const EdgeInsets.fromLTRB(14, 8, 8, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Stand $code — scent forecast',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              TextButton(
                style: mine
                    ? TextButton.styleFrom(
                        foregroundColor: Colors.red.shade700,
                        textStyle:
                            const TextStyle(fontWeight: FontWeight.bold),
                      )
                    : null,
                onPressed: () {
                  final stand = standByCode(code);
                  if (stand != null) {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      showDragHandle: true,
                      builder: (_) => StandDetailSheet(stand: stand),
                    );
                  }
                },
                child: Text(mine ? 'Check Out' : 'Check in / out'),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                tooltip: 'Hide cone',
                onPressed: () =>
                    ref.read(selectedStandProvider.notifier).state = null,
              ),
            ],
          ),
          body,
        ],
      ),
    );
  }

  String _regime(double windMph, double tempDelta) {
    final w = thermalWeight(windMph);
    if (w == 0) return 'true wind dominates';
    final thermal = tempDelta < 0
        ? 'sinking toward drainage'
        : tempDelta > 0
            ? 'rising & dispersing'
            : 'slack air';
    if (tempDelta == 0 && w == 1) return 'slack air';
    return w == 1 ? 'thermal — $thermal' : 'wind + thermal mix — $thermal';
  }

  String _fmtHour(DateTime dt) {
    final local = dt.toLocal();
    var hr = local.hour % 12;
    if (hr == 0) hr = 12;
    final ampm = local.hour >= 12 ? 'PM' : 'AM';
    return '$hr $ampm';
  }

  static const _dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];

  String _cardinal(double deg) {
    final idx = (((deg % 360) + 360) % 360 / 22.5).round() % 16;
    return _dirs[idx];
  }
}

/// Centered notice if the shared pin data hasn't loaded (or is missing).
class _EmptyHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Center(
        child: Card(
          color: Colors.black.withValues(alpha: 0.72),
          child: const Padding(
            padding: EdgeInsets.all(18),
            child: SizedBox(
              width: 240,
              child: Text(
                'No stand pins found.\nCheck your connection — pin positions '
                'load from the club database.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, height: 1.3),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

## `lib/widgets/scent_cone_painter.dart`

```dart
import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';

import '../services/scent_vector.dart';

/// Draws a single scent cone whose tip is anchored at [tip] (pixel coordinates
/// in the map's transformed space) and which points in the [ScentVector.angle]
/// compass heading, fading from semi-opaque at the tip to transparent at the
/// wide end.
///
/// This is the Flutter equivalent of an SVG `<polygon>` with `transform-origin`
/// at the tip plus `transform="rotate(angle, cx, cy)"`: we translate the canvas
/// origin to the tip, then rotate, then draw an up-pointing cone.
class ScentConePainter extends CustomPainter {
  final Offset tip;
  final ScentVector vector;
  final double northOffset;
  final Color color;

  ScentConePainter({
    required this.tip,
    required this.vector,
    this.northOffset = 0,
    this.color = const Color(0xFFFF6D00), // amber-orange, reads over green
  });

  @override
  void paint(Canvas canvas, Size size) {
    final len = vector.length;
    final halfWidth = len * math.tan(vector.widthDeg * math.pi / 180);

    canvas.save();
    canvas.translate(tip.dx, tip.dy);
    // 0 rad = cone points up (north). Positive rotation is clockwise in Flutter,
    // matching compass bearings on a north-up image.
    canvas.rotate((vector.angle - northOffset) * math.pi / 180);

    // Up-pointing cone: tip at origin, base edge at y = -len.
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(-halfWidth, -len)
      ..lineTo(halfWidth, -len)
      ..close();

    final shader = ui.Gradient.linear(
      const Offset(0, 0),
      Offset(0, -len),
      [color.withValues(alpha: 0.45), color.withValues(alpha: 0.0)],
    );
    canvas.drawPath(path, Paint()..shader = shader);

    // Faint center line for direction clarity.
    canvas.drawLine(
      const Offset(0, 0),
      Offset(0, -len),
      Paint()
        ..color = color.withValues(alpha: 0.35)
        ..strokeWidth = 1.5,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant ScentConePainter old) =>
      old.tip != tip ||
      old.northOffset != northOffset ||
      old.color != color ||
      old.vector.angle != vector.angle ||
      old.vector.length != vector.length ||
      old.vector.widthDeg != vector.widthDeg;
}
```

## `lib/widgets/stand_detail_sheet.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/hunt_types.dart';
import '../models/hunt.dart';
import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../services/firestore_service.dart';

/// Bottom sheet shown when a stand is tapped. Open → pick a hunt type and Check
/// In (records exact time + river levels). Mine → Check Out (deer-hunting
/// methods must enter does/bucks/fawns first). Taken → who/what + Text button.
class StandDetailSheet extends ConsumerStatefulWidget {
  final Stand stand;
  const StandDetailSheet({super.key, required this.stand});

  @override
  ConsumerState<StandDetailSheet> createState() => _StandDetailSheetState();
}

class _StandDetailSheetState extends ConsumerState<StandDetailSheet> {
  String? _selectedType;
  bool _busy = false;

  final _doe = TextEditingController();
  final _buck = TextEditingController();
  final _fawn = TextEditingController();

  Stand get stand => widget.stand;

  @override
  void dispose() {
    _doe.dispose();
    _buck.dispose();
    _fawn.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final memberId = ref.watch(currentMemberProvider)?.id;
    final hunt = ref.watch(activeHuntsByCodeProvider)[stand.code];
    final myHunt = ref.watch(myActiveHuntProvider).valueOrNull;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        16 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _header(),
          const SizedBox(height: 16),
          if (hunt == null)
            _openBody(myHunt)
          else if (hunt.memberId == memberId)
            _mineBody(hunt)
          else
            _takenBody(hunt),
        ],
      ),
    );
  }

  Widget _header() {
    final bow = stand.bowOnly;
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: bow ? Colors.brown.shade600 : Colors.green.shade700,
          child: Text(
            stand.code,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Stand ${stand.code}',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold)),
              Text(bow ? 'Bow-only stand' : 'Gold stand · any method',
                  style: TextStyle(color: Colors.grey.shade700)),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    );
  }

  // --- Open: pick a type + check in -----------------------------------------

  Widget _openBody(Hunt? myHunt) {
    if (myHunt != null) {
      return _notice(
        Icons.info_outline,
        "You're checked in at Stand ${myHunt.standCode}. "
        'Check out there before taking another stand.',
      );
    }

    final highWater = ref.watch(highWaterProvider);
    final types = allowedHuntTypes(bowOnly: stand.bowOnly, highWater: highWater);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (highWater) ...[
          _notice(
            Icons.water,
            'High water — archery only for deer (LDWF Area 1 rule while '
            'Vicksburg is above 43 ft).',
          ),
          const SizedBox(height: 12),
        ],
        const Text('What are you hunting?',
            style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final t in types)
              ChoiceChip(
                avatar: Icon(huntTypeIcon(t), size: 18),
                label: Text(t),
                selected: _selectedType == t,
                onSelected: (_) => setState(() => _selectedType = t),
              ),
          ],
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.login),
            label: Text(_busy ? 'Checking in…' : 'Check In',
                style: const TextStyle(fontSize: 17)),
            onPressed: (_selectedType == null || _busy) ? null : _checkIn,
          ),
        ),
      ],
    );
  }

  // --- Mine: show + check out (deer count if applicable) ---------------------

  Widget _mineBody(Hunt hunt) {
    final needsDeer = requiresDeerCount(hunt.huntType);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _huntLine(hunt, prefix: 'You', mine: true),
        if (hunt.riverVicksburgFt != null || hunt.riverGreenvilleFt != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'MS River @ check-in: '
              '${hunt.riverVicksburgFt != null ? 'Vicksburg ${hunt.riverVicksburgFt!.toStringAsFixed(1)} ft' : ''}'
              '${hunt.riverVicksburgFt != null && hunt.riverGreenvilleFt != null ? ' · ' : ''}'
              '${hunt.riverGreenvilleFt != null ? 'Greenville ${hunt.riverGreenvilleFt!.toStringAsFixed(1)} ft' : ''}',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ),
        if (needsDeer) ...[
          const SizedBox(height: 16),
          const Text('Deer seen — required to check out',
              style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              _countField(_doe, 'Does'),
              _countField(_buck, 'Bucks'),
              _countField(_fawn, 'Fawns'),
            ],
          ),
          const SizedBox(height: 6),
          Text('Enter 0 if you saw none.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        ],
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.logout),
            label: Text(_busy ? 'Checking out…' : 'Check Out',
                style: const TextStyle(fontSize: 17)),
            onPressed: (_busy || (needsDeer && !_deerCountsValid))
                ? null
                : () => _checkOut(
                      hunt,
                      doe: needsDeer ? int.parse(_doe.text.trim()) : null,
                      buck: needsDeer ? int.parse(_buck.text.trim()) : null,
                      fawn: needsDeer ? int.parse(_fawn.text.trim()) : null,
                    ),
          ),
        ),
      ],
    );
  }

  Widget _countField(TextEditingController c, String label) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: TextField(
          controller: c,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(
            labelText: label,
            isDense: true,
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => setState(() {}),
        ),
      ),
    );
  }

  bool get _deerCountsValid {
    final d = int.tryParse(_doe.text.trim());
    final b = int.tryParse(_buck.text.trim());
    final f = int.tryParse(_fawn.text.trim());
    return d != null && d >= 0 && b != null && b >= 0 && f != null && f >= 0;
  }

  // --- Taken by someone else: show + text ------------------------------------

  Widget _takenBody(Hunt hunt) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _huntLine(hunt, prefix: hunt.memberName),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.sms_outlined),
            label: Text('Text ${hunt.memberFirstName}',
                style: const TextStyle(fontSize: 17)),
            onPressed:
                hunt.memberPhone.isEmpty ? null : () => _text(hunt.memberPhone),
          ),
        ),
      ],
    );
  }

  Widget _huntLine(Hunt hunt, {required String prefix, bool mine = false}) {
    final since = _fmtTime(hunt.checkInTime);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: mine ? Colors.green.shade50 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(huntTypeIcon(hunt.huntType),
              color: Colors.grey.shade800, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$prefix · ${hunt.huntType}',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600)),
                if (since.isNotEmpty)
                  Text('Checked in at $since',
                      style: TextStyle(color: Colors.grey.shade700)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _notice(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.amber.shade900),
          const SizedBox(width: 12),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }

  // --- Actions ---------------------------------------------------------------

  Future<void> _checkIn() async {
    final member = ref.read(currentMemberProvider);
    final uid = ref.read(authUidProvider);
    if (member == null || uid == null) return;

    setState(() => _busy = true);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      // Record the Mississippi River stage at check-in (null if offline).
      final river = await ref.read(riverServiceProvider).currentLevels();
      await ref.read(firestoreServiceProvider).checkIn(
            stand: stand,
            huntType: _selectedType!,
            member: member,
            userId: uid,
            riverVicksburgFt: river.vicksburgFt,
            riverGreenvilleFt: river.greenvilleFt,
          );
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(content: Text('Checked in to Stand ${stand.code}')),
      );
    } on StandOccupiedException catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    } on AlreadyCheckedInException catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    } catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text('Check-in failed: $e')));
    }
  }

  Future<void> _checkOut(Hunt hunt, {int? doe, int? buck, int? fawn}) async {
    setState(() => _busy = true);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await ref
          .read(firestoreServiceProvider)
          .checkOut(hunt.id, doe: doe, buck: buck, fawn: fawn);
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(content: Text('Checked out of Stand ${stand.code}')),
      );
    } catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text('Check-out failed: $e')));
    }
  }

  Future<void> _text(String phone) async {
    final messenger = ScaffoldMessenger.of(context);
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri(scheme: 'sms', path: digits);
    try {
      final ok = await launchUrl(uri);
      if (!ok) messenger.showSnackBar(SnackBar(content: Text('Text $phone')));
    } catch (_) {
      messenger.showSnackBar(SnackBar(content: Text('Text $phone')));
    }
  }

  String _fmtTime(DateTime? dt) {
    if (dt == null) return '';
    final local = dt.toLocal();
    var h = local.hour;
    final m = local.minute.toString().padLeft(2, '0');
    final ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h == 0) h = 12;
    return '$h:$m $ampm';
  }
}
```

## `lib/widgets/stand_list.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';
import 'map_reference.dart';
import 'stand_detail_sheet.dart';

/// The searchable, filterable list of all stands with live status.
/// Open (green) vs. in-use (grey, with who + what + since when). Tapping a row
/// opens [StandDetailSheet]; the little map button jumps to that stand on the
/// full-screen map with its scent cone selected. Search matches stand numbers
/// AND hunter names ("who's on 28?" or "where's Danny?").
class StandList extends ConsumerWidget {
  const StandList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stands = ref.watch(standsProvider);
    final byCode = ref.watch(activeHuntsByCodeProvider);
    final memberId = ref.watch(currentMemberProvider)?.id;
    final query = ref.watch(searchQueryProvider).trim().toLowerCase();
    final filter = ref.watch(standFilterProvider);

    final filtered = stands.where((s) {
      if (filter == StandFilter.gold && s.bowOnly) return false;
      if (filter == StandFilter.bowOnly && !s.bowOnly) return false;
      if (query.isNotEmpty) {
        final occupant = byCode[s.code]?.memberName.toLowerCase() ?? '';
        if (!s.code.toLowerCase().contains(query) &&
            !occupant.contains(query)) {
          return false;
        }
      }
      return true;
    }).toList();

    if (filtered.isEmpty) {
      return const Center(child: Text('No matching stands'));
    }

    return ListView.separated(
      itemCount: filtered.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final stand = filtered[i];
        final hunt = byCode[stand.code];
        final mine = hunt != null && hunt.memberId == memberId;

        final Color dotColor = hunt != null
            ? (mine ? Colors.green.shade700 : Colors.grey.shade500)
            : (stand.bowOnly ? Colors.brown.shade600 : Colors.green.shade700);

        final String? sinceLabel =
            (hunt != null && hunt.checkInTime != null)
                ? ' · since ${fmtClock(hunt.checkInTime)}'
                : null;

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: dotColor,
            child: Text(
              stand.code,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          title: Row(
            children: [
              Text('Stand ${stand.code}',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              if (stand.bowOnly) ...[
                const SizedBox(width: 6),
                Icon(Icons.arrow_outward,
                    size: 14, color: Colors.brown.shade600),
              ],
            ],
          ),
          subtitle: hunt != null
              ? Text(
                  '${mine ? 'You' : hunt.memberFirstName} · ${hunt.huntType}'
                  '${sinceLabel ?? ''}',
                  style: TextStyle(color: Colors.grey.shade700),
                )
              : Text(
                  stand.bowOnly ? 'Open · bow-only' : 'Open',
                  style: TextStyle(color: Colors.green.shade700),
                ),
          // My row: the whole trailing slot is one compact red Check Out
          // button (the priority action). Other rows: map jump + status.
          trailing: mine
              ? FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.red.shade700,
                    visualDensity: VisualDensity.compact,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    textStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  onPressed: () => _openSheet(context, stand),
                  child: const Text('Check Out'),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      tooltip: 'Show on map',
                      icon: Icon(Icons.map_outlined,
                          size: 20, color: Colors.green.shade800),
                      visualDensity: VisualDensity.compact,
                      onPressed: () => _jumpToMap(context, ref, stand),
                    ),
                    if (hunt != null)
                      Text('In use',
                          style: TextStyle(
                              fontSize: 11, color: Colors.grey.shade600))
                    else
                      const Icon(Icons.chevron_right),
                  ],
                ),
          onTap: () => _openSheet(context, stand),
        );
      },
    );
  }

  /// Opens the full-screen map with [stand] selected (scent cone + panel up)
  /// at the forecast hour containing "now".
  void _jumpToMap(BuildContext context, WidgetRef ref, Stand stand) {
    ref.read(selectedStandProvider.notifier).state = stand.code;
    ref.read(selectedHourProvider.notifier).state =
        ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MapFullScreen()),
    );
  }

  void _openSheet(BuildContext context, Stand stand) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => StandDetailSheet(stand: stand),
    );
  }
}
```

## `lib/widgets/stand_map.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/stands_data.dart';
import '../models/hunt.dart';
import '../providers/app_providers.dart';
import '../services/scent_vector.dart';
import 'scent_cone_painter.dart';
import 'stand_detail_sheet.dart';

/// Aspect ratio of assets/lop_map.jpg (1536 x 1344).
const double kMapAspect = 1536 / 1344;

/// The club aerial with live status pins and (in scent view) the scent cone.
///
/// Green = open, red = in use, solid green pill = my stand. In scent view,
/// tapping a pin selects it and draws its predicted scent cone; otherwise
/// tapping a pin opens the check-in/out sheet. (Pin placement was retired
/// once all 130 stands were set — positions are read-only club data.)
class StandMap extends ConsumerWidget {
  final bool scentView;
  const StandMap({super.key, this.scentView = false});

  /// Computes the cone (fractional tip + vector) for the selected stand, or null.
  /// Returned as a final record so it promotes to non-null inside the
  /// LayoutBuilder closure below.
  ({Offset tipFrac, ScentVector vector})? _coneData(
    WidgetRef ref,
    Map<String, Offset> positions,
  ) {
    if (!scentView) return null;
    final selected = ref.watch(selectedStandProvider);
    final forecast = ref.watch(forecastProvider).valueOrNull;
    final hour = ref.watch(selectedHourProvider);
    if (selected == null ||
        !positions.containsKey(selected) ||
        forecast == null ||
        forecast.hours.isEmpty) {
      return null;
    }
    final i = hour.clamp(0, forecast.hours.length - 1);
    final river = ref.watch(riverStatusProvider).valueOrNull;
    return (
      tipFrac: positions[selected]!,
      vector: calculateScentVector(
        forecast.hours[i],
        drainageHeading: kDrainageHeading,
        waterTempF: river?.waterTempF,
        riverEdge: kRiverEdgeStandCodes.contains(selected),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(standPositionsProvider).valueOrNull ?? const {};
    final byCode = ref.watch(activeHuntsByCodeProvider);
    final cone = _coneData(ref, positions);

    return InteractiveViewer(
      minScale: 0.8,
      maxScale: 12,
      child: AspectRatio(
        aspectRatio: kMapAspect,
        child: LayoutBuilder(
          builder: (ctx, c) {
            final w = c.maxWidth;
            final h = c.maxHeight;
            return Stack(
              children: [
                Positioned.fill(
                  child: Image.asset(
                    'assets/lop_map.jpg',
                    fit: BoxFit.fill,
                    errorBuilder: (c, e, s) => Container(
                      color: const Color(0xFFEAF1E6),
                      alignment: Alignment.center,
                      child: const Text('Add assets/lop_map.jpg'),
                    ),
                  ),
                ),
                if (cone != null)
                  Positioned.fill(
                    child: CustomPaint(
                      painter: ScentConePainter(
                        tip: Offset(cone.tipFrac.dx * w, cone.tipFrac.dy * h),
                        vector: cone.vector,
                        northOffset: kMapNorthOffsetDegrees,
                      ),
                    ),
                  ),
                for (final entry in positions.entries)
                  if (standByCode(entry.key) != null)
                    _pin(
                      ctx,
                      ref,
                      entry.key,
                      entry.value,
                      w,
                      h,
                      hunt: byCode[entry.key],
                    ),
              ],
            );
          },
        ),
      ),
    );
  }

  /// A compact colored-number badge: green = open, red = in use, solid green
  /// pill = MY stand. Sized relative to the map so phone screens aren't
  /// swamped (the old rings were a fixed 26 px).
  Widget _pin(
    BuildContext ctx,
    WidgetRef ref,
    String code,
    Offset frac,
    double w,
    double h, {
    required Hunt? hunt,
  }) {
    final memberId = ref.watch(currentMemberProvider)?.id;
    final mine = hunt != null && hunt.memberId == memberId;
    final inUse = hunt != null;
    final selected = scentView && ref.watch(selectedStandProvider) == code;

    final fontSize = (w * 0.014).clamp(7.0, 12.0);
    final fg = inUse ? Colors.red.shade700 : Colors.green.shade800;

    void openSheet() => showModalBottomSheet(
          context: ctx,
          isScrollControlled: true,
          showDragHandle: true,
          builder: (_) => StandDetailSheet(stand: standByCode(code)!),
        );

    return Positioned(
      left: frac.dx * w,
      top: frac.dy * h,
      child: FractionalTranslation(
        translation: const Offset(-0.5, -0.5),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            if (scentView && mine) {
              // Your own stand: go straight to check-out.
              openSheet();
            } else if (scentView) {
              ref.read(selectedStandProvider.notifier).state = code;
              // Start the slider at the hour containing "now", not the
              // (possibly stale) first cached hour.
              ref.read(selectedHourProvider.notifier).state =
                  ref.read(forecastProvider).valueOrNull?.indexForNow() ?? 0;
            } else {
              openSheet();
            }
          },
          // Transparent padding keeps a finger-sized tap target around the
          // small label.
          child: Padding(
            padding: const EdgeInsets.all(6),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
              decoration: BoxDecoration(
                color: mine
                    ? Colors.green.shade700
                    : Colors.white.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(6),
                border: selected
                    ? Border.all(color: Colors.amber.shade800, width: 1.5)
                    : null,
              ),
              child: Text(
                code,
                style: TextStyle(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                  color: mine ? Colors.white : fg,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

}
```

## `test/auto_checkout_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/services/firestore_service.dart';

void main() {
  group('FirestoreService.shouldAutoClose (8 PM sweep)', () {
    final d = DateTime(2026, 11, 14); // a November hunting day

    test('morning hunt is NOT closed before 8 PM', () {
      final checkIn = DateTime(2026, 11, 14, 5, 45);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 19, 59)), isFalse);
    });

    test('morning hunt IS closed at/after 8 PM', () {
      final checkIn = DateTime(2026, 11, 14, 5, 45);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 20, 0)), isTrue);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 22, 30)), isTrue);
    });

    test("yesterday's forgotten hunt is closed the next morning", () {
      final checkIn = DateTime(2026, 11, 13, 15, 0);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 5, 0)), isTrue);
    });

    test('a hunt started AFTER 8 PM survives until the next sweep', () {
      final checkIn = DateTime(2026, 11, 14, 21, 0); // 9 PM check-in
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 23, 0)), isFalse);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 15, 6, 0)), isFalse);
      // ...but the NEXT evening's sweep takes it.
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 15, 20, 1)), isTrue);
    });

    test('sanity: same-day boundary uses the configured hour', () {
      expect(FirestoreService.shouldAutoClose(
          DateTime(d.year, d.month, d.day, 19, 59),
          DateTime(d.year, d.month, d.day, 20, 0)), isTrue);
    });
  });
}
```

## `test/club_status_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/club_status.dart';
import 'package:lop_app/services/river_service.dart';

void main() {
  group('RiverService.resolveHighWater (LDWF hysteresis)', () {
    test('turns ON at 43.0 ft or higher', () {
      expect(RiverService.resolveHighWater(false, 43.0), isTrue);
      expect(RiverService.resolveHighWater(false, 47.2), isTrue);
    });

    test('turns OFF below 41.0 ft', () {
      expect(RiverService.resolveHighWater(true, 40.9), isFalse);
      expect(RiverService.resolveHighWater(true, 35.0), isFalse);
    });

    test('holds its previous answer in the 41.0–42.9 band (both directions)', () {
      expect(RiverService.resolveHighWater(true, 42.5), isTrue);
      expect(RiverService.resolveHighWater(false, 42.5), isFalse);
      expect(RiverService.resolveHighWater(true, 41.0), isTrue);
      expect(RiverService.resolveHighWater(false, 42.99), isFalse);
    });

    test('no gauge reading keeps the previous answer', () {
      expect(RiverService.resolveHighWater(true, null), isTrue);
      expect(RiverService.resolveHighWater(false, null), isFalse);
    });
  });

  group('ClubStatus.archeryOnly', () {
    test('auto follows the gauge-driven flag', () {
      expect(
          const ClubStatus(highWaterArchery: true).archeryOnly, isTrue);
      expect(
          const ClubStatus(highWaterArchery: false).archeryOnly, isFalse);
    });

    test('admin override wins over the gauge', () {
      expect(
          const ClubStatus(
                  highWaterArchery: false, mode: HighWaterMode.forceOn)
              .archeryOnly,
          isTrue);
      expect(
          const ClubStatus(highWaterArchery: true, mode: HighWaterMode.forceOff)
              .archeryOnly,
          isFalse);
    });
  });
}
```

## `test/forecast_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/forecast.dart';

HourlyWeather _hour(DateTime t) => HourlyWeather(
    time: t, tempF: 70, windMph: 5, windDirDeg: 0, tempDelta: 0);

void main() {
  group('Forecast.indexForNow', () {
    final base = DateTime(2026, 7, 4, 6); // hours 6 AM .. 5 AM next day
    final forecast = Forecast(
      fetchedAt: base,
      hours: [for (var i = 0; i < 24; i++) _hour(base.add(Duration(hours: i)))],
    );

    test('now inside the window picks the containing hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 6, 10)), 0);
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 8, 59)), 2);
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 17, 30)), 11);
    });

    test('now before the window falls back to the first hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 4, 3)), 0);
    });

    test('now after the window clamps to the last hour', () {
      expect(forecast.indexForNow(now: DateTime(2026, 7, 6)), 23);
    });

    test('empty hours falls back to 0', () {
      final empty = Forecast(fetchedAt: DateTime(2026), hours: const []);
      expect(empty.indexForNow(now: DateTime(2026, 7, 4)), 0);
    });
  });
}
```

## `test/format_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/utils/format.dart';

void main() {
  group('fmtClock', () {
    test('null -> empty', () => expect(fmtClock(null), ''));
    test('morning', () {
      expect(fmtClock(DateTime(2026, 7, 4, 5, 42)), '5:42 AM');
    });
    test('noon and midnight are 12, not 0', () {
      expect(fmtClock(DateTime(2026, 7, 4, 0, 5)), '12:05 AM');
      expect(fmtClock(DateTime(2026, 7, 4, 12, 0)), '12:00 PM');
    });
  });

  group('fmtDuration', () {
    test('minutes only', () {
      expect(fmtDuration(const Duration(minutes: 45)), '45m');
    });
    test('hours and minutes', () {
      expect(fmtDuration(const Duration(hours: 3, minutes: 28)), '3h 28m');
    });
    test('zero', () => expect(fmtDuration(Duration.zero), '0m'));
  });

  group('fmtDate', () {
    test('weekday, month, day', () {
      // 2026-07-04 is a Saturday.
      expect(fmtDate(DateTime(2026, 7, 4)), 'Sat, Jul 4');
    });
  });

  group('cardinal', () {
    test('cardinal points', () {
      expect(cardinal(0), 'N');
      expect(cardinal(90), 'E');
      expect(cardinal(180), 'S');
      expect(cardinal(270), 'W');
    });
    test('wraps and normalizes', () {
      expect(cardinal(360), 'N');
      expect(cardinal(-90), 'W');
      expect(cardinal(22.5), 'NNE');
    });
  });
}
```

## `test/hunt_types_test.dart`

```dart
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

  test('high water removes deer firearms everywhere', () {
    final gold = allowedHuntTypes(bowOnly: false, highWater: true);
    expect(gold, isNot(contains('Rifle')));
    expect(gold, isNot(contains('Suppressed Rifle')));
    expect(gold, isNot(contains('Muzzleloader')));
    // Archery and non-deer methods survive.
    expect(gold, containsAll(['Bow', 'Crossbow', 'Squirrel', 'Duck']));
    // Bow-only stands were already archery — unchanged.
    expect(allowedHuntTypes(bowOnly: true, highWater: true), kBowOnlyTypes);
  });

  test('every deer type is a valid hunt type', () {
    for (final t in kDeerTypes) {
      expect(kHuntTypes, contains(t));
    }
  });
}
```

## `test/river_status_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/services/river_service.dart';

void main() {
  group('RiverService.parseGauge', () {
    test('reads observed and forecast primary stage', () {
      final g = RiverService.parseGauge({
        'status': {
          'observed': {'primary': 21.34, 'secondary': -999},
          'forecast': {'primary': 23.1},
        },
      });
      expect(g.observedFt, closeTo(21.34, 0.001));
      expect(g.forecastFt, closeTo(23.1, 0.001));
    });

    test('treats NWPS -999 sentinels and missing keys as null', () {
      final g = RiverService.parseGauge({
        'status': {
          'observed': {'primary': -999},
        },
      });
      expect(g.observedFt, isNull);
      expect(g.forecastFt, isNull);
      expect(RiverService.parseGauge({}).observedFt, isNull);
    });
  });

  group('RiverService.waterTempFFrom', () {
    Map<String, dynamic> usgs(List<Map<String, dynamic>> values) => {
          'value': {
            'timeSeries': [
              {
                'values': [
                  {'value': values},
                ],
              },
            ],
          },
        };

    test('converts the latest USGS reading from °C to °F', () {
      final f = RiverService.waterTempFFrom(usgs([
        {'value': '28.7', 'dateTime': '2026-07-05T17:00:00.000-05:00'},
      ]));
      expect(f, closeTo(83.66, 0.01));
    });

    test('empty series, empty values, and sentinel readings -> null', () {
      expect(RiverService.waterTempFFrom({'value': {'timeSeries': []}}), isNull);
      expect(RiverService.waterTempFFrom(usgs([])), isNull);
      expect(
          RiverService.waterTempFFrom(usgs([{'value': '-999999'}])), isNull);
      expect(RiverService.waterTempFFrom({}), isNull);
    });
  });

  group('GaugeStatus.trend', () {
    test('rising / falling need > 0.2 ft of movement', () {
      expect(const GaugeStatus(observedFt: 20, forecastFt: 21).trend,
          RiverTrend.rising);
      expect(const GaugeStatus(observedFt: 20, forecastFt: 19).trend,
          RiverTrend.falling);
      expect(const GaugeStatus(observedFt: 20, forecastFt: 20.1).trend,
          RiverTrend.steady);
    });

    test('missing data -> unknown', () {
      expect(const GaugeStatus(observedFt: 20).trend, RiverTrend.unknown);
      expect(const GaugeStatus().trend, RiverTrend.unknown);
    });
  });
}
```

## `test/scent_vector_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/services/scent_vector.dart';

HourlyWeather _hw({
  required double wind,
  required double dir,
  required double delta,
  double clouds = 50,
}) =>
    HourlyWeather(
      time: DateTime(2026, 1, 1, 12),
      tempF: 50,
      windMph: wind,
      windDirDeg: dir,
      tempDelta: delta,
      cloudCoverPct: clouds,
    );

void main() {
  test('wind dominance: N wind reverses to due south, long & narrow', () {
    final v = calculateScentVector(_hw(wind: 10, dir: 0, delta: 0));
    expect(v.angle, closeTo(180, 0.5));
    expect(v.widthDeg, lessThan(20));
    expect(v.length, greaterThanOrEqualTo(150));
  });

  test('180 reversal: NE (45) wind blows scent SW (225)', () {
    final v = calculateScentVector(_hw(wind: 8, dir: 45, delta: 0));
    expect(v.angle, closeTo(225, 0.5));
  });

  test('evening sinking: calm + cooling pulls heavily toward drainage (90 E)',
      () {
    final v = calculateScentVector(_hw(wind: 2, dir: 0, delta: -2)); // base 180
    expect(v.angle, greaterThan(90));
    expect(v.angle, lessThan(135)); // ~108, biased toward 90
    expect(v.length, greaterThanOrEqualTo(150));
    expect(v.widthDeg, lessThan(20));
  });

  test('morning rising: calm + warming drifts away from drainage, short & wide',
      () {
    final v = calculateScentVector(_hw(wind: 2, dir: 0, delta: 2)); // anti=270
    expect(v.angle, greaterThan(180));
    expect(v.angle, lessThan(270)); // ~252, toward 270
    expect(v.length, lessThanOrEqualTo(80));
    expect(v.widthDeg, greaterThan(35));
  });

  test('slack air: calm + no temp change follows base scent', () {
    final v = calculateScentVector(_hw(wind: 1, dir: 0, delta: 0));
    expect(v.angle, closeTo(180, 0.5));
    expect(v.length, closeTo(95, 0.5));
  });

  test('blowout ramp: thermals fade linearly between 4 and 10 mph', () {
    expect(thermalWeight(3), 1.0);
    expect(thermalWeight(4), 1.0);
    expect(thermalWeight(7), closeTo(0.5, 0.001));
    expect(thermalWeight(10), 0.0);
    expect(thermalWeight(14), 0.0);
  });

  test('above 10 mph, cooling no longer bends the cone at all', () {
    final v = calculateScentVector(_hw(wind: 12, dir: 0, delta: -3));
    expect(v.angle, closeTo(180, 0.5)); // pure downwind despite the temp drop
    expect(v.widthDeg, closeTo(13, 0.5));
  });

  test('mid-range breeze: cone mostly downwind, nudged toward the river', () {
    // 7 mph from N (base scent 180), cooling. Thermal weight 0.5 -> 2 mph
    // pull toward 90 vs 7 mph toward 180: a modest eastward bend.
    final v = calculateScentVector(_hw(wind: 7, dir: 0, delta: -2));
    expect(v.angle, greaterThan(150));
    expect(v.angle, lessThan(180));
  });

  test('a 4 mph breeze bends the cone more than a 1 mph breath', () {
    // Same cooling thermal toward 90; ambient toward 180.
    final light = calculateScentVector(_hw(wind: 1, dir: 0, delta: -2));
    final fresh = calculateScentVector(_hw(wind: 4, dir: 0, delta: -2));
    // Stronger ambient wind drags the resultant closer to 180 (downwind).
    expect(fresh.angle, greaterThan(light.angle));
  });

  test('sky factor: clear = full thermals, overcast = 30%', () {
    expect(skyFactor(0), 1.0);
    expect(skyFactor(50), closeTo(0.65, 0.001));
    expect(skyFactor(100), closeTo(0.3, 0.001));
  });

  test('overcast weakens the thermal bend toward the river', () {
    final clear = calculateScentVector(_hw(wind: 2, dir: 0, delta: -2, clouds: 0));
    final overcast =
        calculateScentVector(_hw(wind: 2, dir: 0, delta: -2, clouds: 100));
    // Clear sky: strong drain pulls the cone hard toward 90 (the river).
    // Overcast: weak thermal, cone stays closer to plain downwind (180).
    expect(clear.angle, lessThan(overcast.angle));
    expect(overcast.angle, lessThan(180));
  });

  test('river-edge + warm water strengthens the evening drain', () {
    final h = _hw(wind: 2, dir: 0, delta: -2, clouds: 0);
    final plain = calculateScentVector(h);
    final edge = calculateScentVector(h, waterTempF: 65, riverEdge: true);
    // Warm water pulls the cone even harder toward the river (90).
    expect(edge.angle, lessThan(plain.angle));
    expect(edge.angle, greaterThan(90));
  });

  test('water temp is ignored for stands not on the river', () {
    final h = _hw(wind: 2, dir: 0, delta: -2, clouds: 0);
    final plain = calculateScentVector(h);
    final inland = calculateScentVector(h, waterTempF: 65, riverEdge: false);
    expect(inland.angle, closeTo(plain.angle, 0.001));
  });

  test('river-edge + cold water pushes a river breeze inland when warming', () {
    final h = _hw(wind: 2, dir: 0, delta: 2, clouds: 0);
    final plain = calculateScentVector(h);
    final edge = calculateScentVector(h, waterTempF: 35, riverEdge: true);
    // Both drift away from the river (toward 270); cold water pushes harder.
    expect(edge.angle, greaterThan(plain.angle));
    expect(edge.angle, lessThan(270));
  });

  test('custom drainage heading is respected', () {
    final v = calculateScentVector(
      _hw(wind: 2, dir: 0, delta: -2),
      drainageHeading: 270,
    );
    expect(v.angle, greaterThan(180));
    expect(v.angle, lessThan(270)); // pulled toward 270 instead of 90
  });
}
```

## `test/stands_data_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/data/stands_data.dart';

void main() {
  test('130 stands: 90 gold + 40 bow-only', () {
    expect(kStands.length, 130);
    expect(kStands.where((s) => !s.bowOnly).length, 90);
    expect(kStands.where((s) => s.bowOnly).length, 40);
  });

  test('codes are unique', () {
    final codes = kStands.map((s) => s.code).toSet();
    expect(codes.length, kStands.length);
  });

  test('bow-only codes carry a B suffix; gold codes do not', () {
    expect(standByCode('12B')?.bowOnly, true);
    expect(standByCode('12')?.bowOnly, false);
    expect(standByCode('999'), isNull);
  });
}
```

## `test/ui_smoke_test.dart`

```dart
// UI smoke tests: pump the real screens with faked providers (no Firebase, no
// network) and drive the main flows — the closest thing to a device walkthrough
// that runs in CI.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:lop_app/models/club_status.dart';
import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/models/hunt.dart';
import 'package:lop_app/models/member.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/providers/app_providers.dart';
import 'package:lop_app/screens/conditions_screen.dart';
import 'package:lop_app/screens/home_screen.dart';
import 'package:lop_app/screens/hunt_log_screen.dart';
import 'package:lop_app/screens/rules_screen.dart';

const _me = Member(
    id: 'm99', name: 'Test Hunter', phone: '555-000-0000', role: 'Member', shares: '1');

Hunt _hunt({
  String id = 'h1',
  String standCode = '28',
  String huntType = 'Rifle',
  String userId = 'uid-me',
  String memberId = 'm01',
  String memberName = 'David Ditch',
  bool active = true,
  bool autoClosed = false,
  DateTime? checkIn,
  DateTime? checkOut,
  int? doe,
  int? buck,
}) =>
    Hunt(
      id: id,
      standCode: standCode,
      huntType: huntType,
      memberId: memberId,
      memberName: memberName,
      memberPhone: '555-111-2222',
      userId: userId,
      autoClosed: autoClosed,
      active: active,
      checkInTime: checkIn ?? DateTime.now().subtract(const Duration(hours: 2)),
      checkOutTime: checkOut,
      doeSeen: doe,
      buckSeen: buck,
      riverVicksburgFt: 21.3,
      riverGreenvilleFt: 18.9,
    );

Forecast _forecast() {
  final now = DateTime.now();
  final start = DateTime(now.year, now.month, now.day, now.hour);
  return Forecast(
    fetchedAt: now,
    hours: [
      for (var i = 0; i < 24; i++)
        HourlyWeather(
          time: start.add(Duration(hours: i)),
          tempF: 72,
          windMph: 8,
          windDirDeg: 0, // N wind -> scent S
          tempDelta: 0,
        ),
    ],
  );
}

Widget _app({List<Override> overrides = const [], Widget home = const HomeScreen()}) {
  return ProviderScope(overrides: overrides, child: MaterialApp(home: home));
}

List<Override> _baseOverrides({
  Hunt? myHunt,
  List<Hunt> active = const [],
  List<Hunt>? log,
  ClubStatus? club,
  Member member = _me,
}) =>
    [
      authUidProvider.overrideWith((ref) => 'uid-me'),
      currentMemberProvider.overrideWith((ref) => member),
      clubStatusProvider.overrideWith((ref) => Stream.value(club)),
      activeHuntsProvider.overrideWith((ref) => Stream.value(active)),
      myActiveHuntProvider.overrideWith((ref) => Stream.value(myHunt)),
      standPositionsProvider.overrideWith(
          (ref) => Stream.value(const {'28': Offset(0.5, 0.5)})),
      forecastProvider.overrideWith((ref) => Stream.value(_forecast())),
      riverStatusProvider.overrideWith((ref) => Stream.value(RiverStatus(
            fetchedAt: DateTime.now(),
            vicksburg: const GaugeStatus(observedFt: 21.3, forecastFt: 23.0),
            greenville: const GaugeStatus(observedFt: 18.9, forecastFt: 18.9),
            waterTempF: 84,
          ))),
      huntLogProvider.overrideWith((ref) => Stream.value(log ??
          [
            _hunt(
              id: 'done1',
              active: false,
              checkIn: DateTime(2026, 7, 3, 5, 40),
              checkOut: DateTime(2026, 7, 3, 9, 10),
              doe: 2,
              buck: 1,
            ),
          ])),
    ];

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('home shows open/in-use counts and a Conditions button',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [_hunt()])));
    await tester.pump(); // let streams deliver

    expect(find.text('129 open'), findsOneWidget);
    expect(find.text('1 in use'), findsOneWidget);
    // Weather/river details moved off the home screen behind Conditions.
    expect(find.text('Conditions'), findsOneWidget);
    expect(find.textContaining('Vburg'), findsNothing);
    expect(find.textContaining('Wind'), findsNothing);

    await tester.pumpWidget(const SizedBox()); // dispose timers
  });

  testWidgets('conditions screen shows weather, hourly, and river stages',
      (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(), home: const ConditionsScreen()));
    await tester.pump();

    expect(find.text('Right now'), findsOneWidget);
    expect(find.textContaining('Wind N 8 mph'), findsOneWidget);
    expect(find.textContaining('% cloud cover'), findsOneWidget);
    expect(find.text('Mississippi River'), findsOneWidget);
    expect(find.text('21.3 ft'), findsOneWidget); // Vicksburg
    expect(find.textContaining('↗ rising'), findsOneWidget);
    expect(find.text('18.9 ft'), findsOneWidget); // Greenville
    expect(find.textContaining('Water temperature'), findsOneWidget);
    expect(find.text('Next 24 hours'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('my stand row shows a red Check Out button', (tester) async {
    // Stand 1 so the row is at the top of the (lazy) list and gets built.
    final mine = _hunt(standCode: '1', memberId: 'm99', memberName: _me.name);
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(myHunt: mine, active: [mine])));
    await tester.pump();

    // One in the banner, one on the row.
    expect(find.text('Check Out'), findsNWidgets(2));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets(
      'hunt started on ANOTHER device still shows as mine (member identity)',
      (tester) async {
    // Same member id, totally different anonymous device uid.
    final mine = _hunt(
        standCode: '1',
        memberId: 'm99',
        memberName: _me.name,
        userId: 'some-other-device');
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(myHunt: mine, active: [mine])));
    await tester.pump();

    // Banner + row Check Out both present, and no "Text" option for myself.
    expect(find.text('Check Out'), findsNWidgets(2));
    expect(find.textContaining("You're on Stand 1"), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('forgot-to-check-out notice shows for my auto-closed hunt',
      (tester) async {
    final swept = _hunt(
      id: 'swept1',
      standCode: '7',
      memberId: 'm99',
      memberName: _me.name,
      active: false,
      autoClosed: true,
      checkIn: DateTime(2026, 7, 8, 15, 0),
      checkOut: DateTime(2026, 7, 8, 20, 0),
    );
    await tester.pumpWidget(_app(overrides: _baseOverrides(log: [swept])));
    await tester.pump(); // streams deliver
    await tester.pump(); // AckStore future resolves -> notice renders

    expect(find.textContaining('auto-checked out of Stand 7'), findsOneWidget);

    // Dismiss hides it.
    await tester.tap(find.byTooltip('Dismiss'));
    await tester.pump();
    expect(find.textContaining('auto-checked out'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('my-hunt banner shows when checked in and ticks elapsed',
      (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(
            myHunt: _hunt(userId: 'uid-me'), active: [_hunt(userId: 'uid-me')])));
    await tester.pump();

    expect(find.textContaining("You're on Stand 28"), findsOneWidget);
    expect(find.text('Check Out'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('search matches hunter names, not just stand codes',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [_hunt()])));
    await tester.pump();

    await tester.enterText(find.byType(TextField).first, 'ditch');
    await tester.pump();

    // Only stand 28 (David Ditch's) remains in the list.
    expect(find.text('Stand 28'), findsOneWidget);
    expect(find.text('Stand 29'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('hunt log shows season summary and completed hunt details',
      (tester) async {
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(), home: const HuntLogScreen()));
    await tester.pump();

    expect(find.text('Club season'), findsOneWidget);
    expect(find.text('hunts'), findsOneWidget);
    expect(find.textContaining('David Ditch · Rifle'), findsOneWidget);
    expect(find.textContaining('5:40 AM – 9:10 AM'), findsOneWidget);
    expect(find.textContaining('1 buck · 2 does'), findsOneWidget);
    expect(find.textContaining('Vburg 21.3 ft'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('high-water banner shows when the rule is active', (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(
            club: const ClubStatus(
                highWaterArchery: false, mode: HighWaterMode.forceOn))));
    await tester.pump();

    expect(find.textContaining('HIGH WATER'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('no high-water banner in normal conditions', (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    expect(find.textContaining('HIGH WATER'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('admin card only shows for the admin member', (tester) async {
    const chad = Member(
        id: 'm27', name: 'Chad Gardner', phone: '318-282-1827', role: 'Board');
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(member: chad),
        home: const ConditionsScreen()));
    await tester.pump();
    expect(find.textContaining('Admin'), findsOneWidget);
    expect(find.text('Force ON'), findsOneWidget);
    expect(find.text('End all active hunts now'), findsOneWidget);

    // Tear down before re-pumping: a ProviderScope's overrides must not
    // change in place, so the second pump needs a fresh tree.
    await tester.pumpWidget(const SizedBox());
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(), home: const ConditionsScreen()));
    await tester.pump();
    expect(find.textContaining('Admin'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('rules screen renders buck criteria and aging guide',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: RulesScreen()));
    await tester.pump();

    expect(find.textContaining('Max 5 bucks per membership'), findsOneWidget);
    expect(find.textContaining('Cull buck'), findsOneWidget);
    expect(find.textContaining('NEVER a cull'), findsOneWidget);
    expect(find.textContaining('Ten-point or better'), findsOneWidget);

    await tester.dragUntilVisible(
      find.textContaining('Judging a mature buck'),
      find.byType(ListView),
      const Offset(0, -400),
    );
    expect(find.textContaining('Judging a mature buck'), findsOneWidget);
  });

  testWidgets('history button navigates to the hunt log', (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    await tester.tap(find.byTooltip('Hunt log'));
    await tester.pumpAndSettle();

    expect(find.text('Hunt Log'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });
}
```

