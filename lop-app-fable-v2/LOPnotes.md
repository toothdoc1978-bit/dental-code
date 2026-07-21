# Lookout Point (LOP) App — Session Notes (updated through v2.4)

## Where things stand
- Live at **https://lop-hunting-club.web.app** (Firebase Hosting) and on Chad's
  iPad/iPhone via `flutter run --release`. Both point at the same Firebase
  project (`lop-hunting-club`) — everyone sees the same live data regardless
  of device.
- This folder (`lop-app-fable-v2/`, branch `fable-improved-v1`) is the ONLY
  build in active development. The original `lop-app/` folder on `main` is
  untouched and no longer maintained. Full change history: `AUDIT.md`.
- Current version stamp: **v2.4** (shown at the bottom of the member picker
  and Conditions screens — always check this after deploying to confirm the
  new build actually landed, not a stale cached one).
- Apple Developer Program: enrollment submitted, awaiting approval → then
  TestFlight for iOS distribution beyond personal-device installs.

## Deploying a change (every time)
```bash
cd ~/dental-code && git pull
cp lop-app-fable-v2/pubspec.yaml ~/lop-web/pubspec.yaml
rsync -a --exclude 'firebase_options.dart' lop-app-fable-v2/lib/ ~/lop-web/lib/
cp -R lop-app-fable-v2/assets ~/lop-web/
cd ~/lop-web
flutter pub get
flutter build web --release
firebase deploy --only hosting
```
⚠️ `pubspec.yaml` must be synced every time (learned the hard way in v2.5):
it's the dependency list, and a new package added in the repo (geolocator)
never reaches ~/lop-web otherwise — `flutter pub get` "succeeds" against the
stale list and the build fails with "Couldn't resolve the package …".
⚠️ NEVER run `flutter pub upgrade --major-versions` (or `pub upgrade` at all)
in ~/lop-web or the repo — it rewrites the dependency list to next-generation
major versions (Riverpod 3, Firebase 4/6…) the code isn't written for, and
the build explodes with hundreds of StateProvider/valueOrNull errors. The
"newer versions available" notes during pub get are informational, not a
to-do list. If that command ever gets run by accident: re-copy the repo's
pubspec.yaml over ~/lop-web's, `rm -f pubspec.lock`, `flutter pub get`.
⚠️ The `--exclude 'firebase_options.dart'` matters: the repo's copy of that
file is a fake-key placeholder, and copying it over `~/lop-web`'s real one
ships a build that can't reach Firebase at all — symptom is a totally blank
screen on load (this happened with the v2.4 deploy). If it ever does get
clobbered, `flutterfire configure --project=lop-hunting-club --platforms=web`
restores it. After deploying, fully close/reopen the tab (or use a Private
tab) on any device testing it — the browser caches aggressively.

**Publish `firestore.rules` whenever it changed** (Firebase console →
Firestore Database → Rules → paste → Publish). ⚠️ **Timing matters** for any
change that removes/renames a field an older build still writes (like v2.4's
`huntType` → `activity`+`method` migration): publish the new rules in the
**same session** you push the app update to everyone's devices, not ahead of
time. This app is offline-first — a stale build can have a queued write that
only syncs later, and if the rules change lands first, that write is
permanently rejected (not retried).

## Key architecture
- **Ownership is keyed to the chosen member (`memberId`), not the device**
  (`userId`/anonymous auth id). This lets "mine" — the banner, Check Out
  buttons, Hunt Log's "Mine" filter — follow you across every device you've
  picked your name on. `checkIn()` also blocks a member from double-checking-in
  from a second device (`AlreadyCheckedInException`).
- **Check-in never blocks on network.** It reads whatever's already cached in
  `riverStatusProvider` (a Firestore-backed `StreamProvider`, refreshed every
  ~1h by whichever device happens to be running) — zero live HTTP calls.
  `HomeScreen.build()` eagerly `ref.watch`es that provider just to warm its
  subscription before anyone can reach a stand — remove that watch and
  check-in silently loses river data for the first check-in of any session.
- **Activity + Method, not one `huntType` string.** `lib/data/hunt_types.dart`
  is the single source of truth for which methods are legal per activity, and
  for bow-only/high-water filtering — but `firestore.rules`' `hunts.create`
  rule duplicates the same two lists by hand (no codegen). Adding an activity
  or method means editing **both files** or check-in fails silently
  (permission-denied) at the stand.
- **8 PM daily auto-checkout**, client-side: `FirestoreService.shouldAutoClose`
  (pure) + `autoCheckoutSweep()`, run at app startup and every 15 minutes via
  a `Timer.periodic` in `main.dart`. The same timer also re-nudges the
  weather/river caches so long-lived sessions don't go stale.
- **LDWF high-water rule**: `clubStatus/current` doc, driven by the Vicksburg
  gauge with 41/43 ft hysteresis, admin-overridable (Chad only, `m27`) from
  the Conditions screen.
- **Yellow Tag / all-day, guests, and responsible-adult** are all just extra
  fields on the `Hunt` doc (`allDay`, `guestNames`, `responsibleAdultMemberId`/
  `Name`) — visibility-only, not enforcement or compliance records.
- **SOS** (`sos` collection, `kSosTypes` in `models/sos_alert.dart` must stay
  hand-synced with the rules enum): in-app red banner to every open app +
  prefilled group text to Board members (`role == 'Board'` in the roster).
  Explicitly NOT a 911 replacement — the screen leads with Call 911. GPS via
  `geolocator` (works on web; the future native iOS build will need
  NSLocationWhenInUseUsageDescription in Info.plist). The v2.5 rules change
  is additive-only — safe to publish before or after the app deploy.
- **Web-first through the first season** (decided v2.5): instant deploys
  while iterating weekly; native iOS/Android later from the same codebase —
  the main thing it adds is push notifications (SOS + 8 PM reminders).
- **v2.6 invariants — do not regress**: offline persistence stays ON for web
  (main.dart); no UI path may `await` a Firestore write's server ack for
  success feedback (race a short timeout instead — offline the future pends
  forever); SOS opens the group text WITHOUT waiting for the Firestore
  write; the 8 PM sweep uses club time (utils/club_time.dart), never device
  local time; swept hunts stamp checkOutTime = the cutoff, and their deer
  counts can be backfilled once (rules branch + home-screen notice).
- **v2.6 rules must be published with (or right after) the v2.6 deploy** —
  the deer-count backfill needs the new rules branch. The rules are
  backward-compatible with the v2.5 app.
- **Field test still owed on a real iPhone**: send a test SOS → confirm the
  prefilled GROUP text opens with a readable body (not '+' between words)
  and that Messages accepts multiple recipients with a prefilled body. If
  iOS refuses the multi-recipient prefill, fall back to texting just the
  first Board member (one-line change in sos_screen._textBoard).

## Known gotchas / lessons (carried forward + new)
1. **Dart null-promotion**: test `if (x != null)` directly; never gate on a
   separately-computed bool.
2. Min Flutter is **3.27** (`withValues` color API).
3. `lib/firebase_options.dart` in this repo is a compile-only placeholder —
   `flutterfire configure` must overwrite it before Firebase works.
4. Widget smoke tests (`test/ui_smoke_test.dart`) override every Riverpod
   provider with fake streams — no Firebase/emulator needed; keep new screens
   covered the same way. `ListView`s in tests are lazy — a stand far down the
   130-item list (e.g. `1B`) won't be tappable until you filter/scroll to it.
5. The check-in double-occupancy guard is query-then-write, not a Firestore
   transaction, on purpose — transactions require connectivity and would
   break offline check-in. Acceptable race for a 36-member club.
6. Riverpod `StreamProvider`s only start their Firestore subscription on
   first `watch`/`read` — don't assume a provider has data just because it's
   "always populated" elsewhere in the app; check where it's first touched.
7. **Never paste tokens/passwords in chat** — revoke immediately if it happens.

## Rollback / merge
- Try it, hate it: `git checkout main` — the original app is exactly as it was.
- Roll back one version: `git log --oneline` on `fable-improved-v1` and
  `git revert`/`git reset` to the last-known-good commit, then redeploy.
- Keep it: merge PR #13, then (optionally) replace `lop-app/` with
  `lop-app-fable-v2/` contents when confident.

## Still pending
- Apple Developer Program approval → Xcode team switch → Archive → App Store
  Connect → TestFlight.
- Optional Android distribution via Firebase App Distribution.
- Regular teenage/family hunters who aren't yet in `lib/data/members.dart`
  should get individual roster entries (same pattern as existing
  Son/Wife/Grandson/Proxy rows) — send names/phones/roles or edit directly.
- Deferred by explicit choice (not forgotten): hunter-safety-certification
  status, firearm/bow counts, and formal rules-acknowledgement — these are
  liability/compliance questions worth a real conversation (possibly with the
  club's insurer) before building, not something to bolt on casually.
- Ideas discussed but not built: list↔map two-way *scroll* sync, editable
  "move a pin" admin tool (pins are read-only client-side as of v2.x).
