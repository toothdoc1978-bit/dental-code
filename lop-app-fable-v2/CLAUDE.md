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
