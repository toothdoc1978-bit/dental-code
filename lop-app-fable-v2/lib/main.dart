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
