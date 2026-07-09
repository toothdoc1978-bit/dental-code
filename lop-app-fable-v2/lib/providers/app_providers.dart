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
