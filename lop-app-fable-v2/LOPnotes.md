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
