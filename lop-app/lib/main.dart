import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase_options.dart';
import 'providers/app_providers.dart';
import 'screens/map_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Enable offline persistence so check-ins work without signal in the field.
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
    cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
  );

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
      ),
      home: const _AuthGate(),
    );
  }
}

/// Signs the member in anonymously, then shows the map.
///
/// Anonymous auth keeps the MVP frictionless while still giving every hunt a
/// stable `userId` — so upgrading to named accounts later is non-breaking.
class _AuthGate extends ConsumerStatefulWidget {
  const _AuthGate();

  @override
  ConsumerState<_AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends ConsumerState<_AuthGate> {
  late final Future<void> _signIn = _doSignIn();

  Future<void> _doSignIn() async {
    final auth = FirebaseAuth.instance;
    final cred = auth.currentUser ?? (await auth.signInAnonymously()).user;
    ref.read(authUidProvider.notifier).state = cred?.uid;
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
        return const MapScreen();
      },
    );
  }
}
