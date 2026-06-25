import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/hunt.dart';
import '../models/stand.dart';
import '../services/firestore_service.dart';
import '../services/geojson_service.dart';

// --- Services -----------------------------------------------------------------

final geojsonServiceProvider = Provider((ref) => GeojsonService());
final firestoreServiceProvider = Provider((ref) => FirestoreService());

// --- Auth ---------------------------------------------------------------------

/// The signed-in (anonymous) user's uid. Set once in `main.dart` after sign-in.
final authUidProvider = StateProvider<String?>((ref) => null);

// --- Stands (static, from GeoJSON) -------------------------------------------

/// All stands parsed from the bundled GeoJSON. Loaded once.
final standsProvider = FutureProvider<List<Stand>>((ref) {
  return ref.watch(geojsonServiceProvider).loadStands();
});

// --- Hunts (live, from Firestore) --------------------------------------------

/// All currently-active hunts across the club.
final activeHuntsProvider = StreamProvider<List<Hunt>>((ref) {
  return ref.watch(firestoreServiceProvider).streamActiveHunts();
});

/// The set of stand numbers that are currently occupied. Derived from
/// [activeHuntsProvider]; empty while loading or on error.
final occupiedStandIdsProvider = Provider<Set<int>>((ref) {
  final hunts = ref.watch(activeHuntsProvider).valueOrNull ?? const [];
  return hunts.map((h) => h.standId).toSet();
});

/// The signed-in user's own active hunt (null if they're not checked in).
final myActiveHuntProvider = StreamProvider<Hunt?>((ref) {
  final uid = ref.watch(authUidProvider);
  if (uid == null) return Stream.value(null);
  return ref.watch(firestoreServiceProvider).streamMyActiveHunt(uid);
});

// --- UI selection -------------------------------------------------------------

/// The stand currently selected in the list or on the map (by stand number),
/// or null if nothing is selected.
final selectedStandProvider = StateProvider<int?>((ref) => null);
