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
- **River status on home** 🆕 — live Vicksburg & Greenville stages with
  rising/falling/steady arrows (observed vs NOAA forecast), cached to one shared
  Firestore doc (`riverStatus/current`, 1-hour TTL) so one member's fetch serves
  everyone.
- **Live occupancy + texting** — real-time via Firestore; tap an occupied stand
  to see who/what and **Text** them.
- **Aerial map** — pan/zoom photo (`assets/lop_map.jpg`); tap-to-place pins
  (shared via Firebase) shown as hollow rings — green (open) / red (in use) —
  so the printed stand numbers stay visible.
- **Scent-drift prediction** — per-stand hourly wind + thermal drift, computed
  from Open-Meteo (keyless) and drawn as a rotating, fading cone with a
  24-hour slider that now starts at the hour containing *now*. Rules: wind
  >5 mph dominates (long/narrow along wind-to direction); calm+cooling evenings
  drain toward the river (long/narrow); calm+warming mornings disperse away
  from the river (short/wide). Opening the map while checked in auto-selects
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
