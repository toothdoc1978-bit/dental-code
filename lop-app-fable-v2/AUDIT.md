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

## Verification log
- Baseline: analyze 0 errors / 11 infos; 9/9 tests pass.
- After feature work: analyze **0 issues**; **35/35 tests pass**
  (units + widget smoke tests).
