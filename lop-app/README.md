# Lookout Point (LOP) — Stand Management App

A Flutter + Firebase MVP for the Lookout Point hunting club (East Carroll Parish, LA).
Members see every stand on an aerial map, know in real time which stands are taken,
and check in / check out while logging deer sightings.

## Features

- **Searchable stand list** (driven by `assets/stands.geojson`)
- **Interactive aerial map** (`flutter_map` + Esri World Imagery) showing every stand as a polygon
- **Two-way selection** — tap a polygon or a list row; the map highlights the stand
  (red border + semi-transparent red fill) and zooms/pans to it
- **Live occupancy** — occupied stands are red, open stands are green, updated in real
  time via Firestore
- **Check-in** — select a stand → big **Check In** button → creates a hunt record with timestamp
- **Check-out** — from your active hunt → form with required doe / fawn / buck counts → records
  checkout time + sightings
- **Offline support** — Firestore persistence; check in without signal, syncs later
- **Admin flag** — `users/{uid}.isAdmin` reserved for a future dashboard

## Tech

- Flutter (Material 3) · Riverpod for state
- Firebase Auth (anonymous) · Cloud Firestore
- `flutter_map` + `latlong2`

## Project layout

```
lib/
  main.dart                       Firebase init, anon sign-in, app shell
  firebase_options.dart           PLACEHOLDER — regenerate with flutterfire configure
  models/stand.dart               GeoJSON → Stand (polygon, centroid, bounds)
  models/hunt.dart                Firestore hunt record
  services/geojson_service.dart   Loads/parses assets/stands.geojson
  services/firestore_service.dart check-in / check-out / live streams
  providers/app_providers.dart    Riverpod providers (stands, hunts, selection, auth)
  screens/map_screen.dart         Hybrid map + list, highlighting, camera fit
  screens/check_out_sheet.dart    Sightings form
  widgets/stand_list.dart         Searchable list (panel + bottom sheet)
  widgets/stand_action_panel.dart Selected-stand Check In / Check Out card
assets/stands.geojson             SAMPLE data — replace with real boundaries
firestore.rules                   Starter security rules
```

## One-time setup

You need the Flutter SDK and a Firebase project.

1. **Install deps**
   ```bash
   flutter pub get
   ```

2. **Create the Firebase project + wire it up**
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```
   This regenerates `lib/firebase_options.dart` with your real keys.

3. **In the Firebase console**
   - **Authentication → Sign-in method →** enable **Anonymous**
   - **Firestore Database →** create a database (start in **test mode** for the MVP)
   - (optional) paste `firestore.rules` into **Firestore → Rules** and publish

4. **Run it**
   ```bash
   flutter run
   ```

## Verify it works

- Map opens with all sample stands in **green** over aerial imagery.
- Tap a polygon → it turns **red** with a thick border and the camera fits to it;
  the list selection mirrors it (and vice-versa).
- **Check In** → the stand turns red. Open a second device/emulator → it shows red there
  too within a second (real-time).
- **Check Out** → enter doe / fawn / buck → the stand returns to green; the `hunts` doc now
  has `active: false`, a `checkOutTime`, and the sightings.
- Airplane mode → check in → back online → the write syncs (offline persistence).

Run the parser tests:
```bash
flutter test
```

## Replacing the sample stand data

`assets/stands.geojson` is a placeholder with 5 squares near the real LOP coordinates.
Swap in the real boundaries with **no code changes** — just keep the contract:

- a GeoJSON `FeatureCollection`
- each feature is a **Polygon**
- each feature has `properties.stand_id` as an **integer**
- coordinates are `[longitude, latitude]` pairs (standard GeoJSON order)

Digitize the ~70 stands from the Eagle Forestry aerial in QGIS or geojson.io and export.

## Push to GitHub

This folder is a standalone repo (separate from any other project). To publish:

```bash
cd lop-app
git init
git add .
git commit -m "Initial commit: LOP stand management MVP"

# Create an empty repo on github.com first (e.g. named "lop-app"), then:
git branch -M main
git remote add origin https://github.com/<your-username>/lop-app.git
git push -u origin main
```
