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
- **Check-in** 🆕 — two-stage picker: pick an **Activity** (Deer / Duck /
  Squirrel / Hog / Turkey / Scouting / Camera Service / Other), then only the
  legally valid **Method** for that activity/stand/high-water combo (Rifle /
  Suppressed Rifle / Primitive Firearm / Shotgun / Bow / Crossbow / None) —
  see `data/hunt_types.dart`. Never blocks on network: reads the already-
  cached Mississippi River stage instead of a live NOAA call. Optional
  "Hunting all day? (Yellow Tag)" switch and an "Add a guest" expander
  (guest name + responsible-adult picker, visibility only). Haptic
  confirmation on success.
- **Check-out** — Deer activity requires entering **Does / Bucks / Fawns**
  before finishing; every other activity checks out immediately.
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
  every minute) and one-tap Check Out. Ownership is keyed to your chosen
  member identity, not the device, so it (and "Mine" in the Hunt Log) follows
  you across every device you've picked your name on.
- **Yellow Tag / all-day** 🆕 — mark a check-in as an all-day sit; shows an
  amber badge on the list row, map pin, and detail sheet, plus a home
  status-bar count — purely informational (no GPS/road data to enforce it).
- **8 PM auto-checkout** — every active hunt closes automatically at 8 PM
  (hunts started after 8 PM survive to the next evening); a dismissible
  notice tells you if it happened to you. Admin (Conditions screen) can also
  clear the whole board on demand.
- **LDWF high-water archery rule** — when Vicksburg reaches 43.0 ft, Deer
  firearm methods disappear from check-in club-wide (archery only) until the
  stage drops below 41.0 ft; admin override available.
- **Wind chip** — current-hour wind + predicted scent direction in the status row.
- **SOS** 🆕 — red button in the app bar: pick a situation (stuck / injured /
  vehicle trouble), optional note, and send — your GPS location goes out as an
  unmissable red banner to everyone with the app open (tap-to-navigate Maps
  link + Call button), plus a prefilled group text to the Board (SMS works on
  one bar where data won't). Leads with a Call 911 button — explicitly NOT an
  emergency service. Anyone can mark it resolved.

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
test/      76 tests: stands · scent physics · formats · activity/method
           legality · forecast now-index · river parsing/trend · auto-
           checkout sweep timing · club status · UI smoke tests
firestore.rules                 activity/method + memberId validated server-
                                side; checkout is one-way active->false with
                                a field whitelist; pins/caches shape-checked
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

`flutter test` runs all 76 tests; `flutter analyze` is clean (0 issues).

## Notes for whoever picks this up next
- `lib/firebase_options.dart` is a **placeholder** so the repo compiles — run
  `flutterfire configure` before expecting Firebase to work.
- The roster (`lib/data/members.dart`) contains **real names and phone numbers**
  — keep any repo this lands in **private**.
- The check-in double-occupancy guard is query-then-write (not a transaction) on
  purpose: transactions require connectivity and would break offline check-in.
  Acceptable race for a 36-member club; see AUDIT.md.
- The `hunts.activity`/`hunts.method` enum lists are hand-duplicated in
  `lib/data/hunt_types.dart` (`kActivities`/`kMethods`) AND `firestore.rules`
  — no shared codegen. Adding an activity/method means editing BOTH, or
  check-in fails silently (permission-denied) at the stand.
- When deploying a schema/rules change that removes/renames a field an older
  build still writes (like the huntType → activity+method migration), publish
  the new `firestore.rules` in the **same session** you push the app update to
  active devices — not ahead of time. Offline-first means a stale build can
  have a queued write that syncs after the rules change and gets permanently
  rejected if the rules go out first.
- iOS distribution beyond personal-device installs needs the Apple Developer
  Program (TestFlight); Android testers can use Firebase App Distribution (free).
