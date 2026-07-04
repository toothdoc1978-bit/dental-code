// UI smoke tests: pump the real screens with faked providers (no Firebase, no
// network) and drive the main flows — the closest thing to a device walkthrough
// that runs in CI.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/models/hunt.dart';
import 'package:lop_app/models/member.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/providers/app_providers.dart';
import 'package:lop_app/screens/home_screen.dart';
import 'package:lop_app/screens/hunt_log_screen.dart';

const _me = Member(
    id: 'm99', name: 'Test Hunter', phone: '555-000-0000', role: 'Member', shares: '1');

Hunt _hunt({
  String id = 'h1',
  String standCode = '28',
  String huntType = 'Rifle',
  String userId = 'uid-me',
  bool active = true,
  DateTime? checkIn,
  DateTime? checkOut,
  int? doe,
  int? buck,
}) =>
    Hunt(
      id: id,
      standCode: standCode,
      huntType: huntType,
      memberId: 'm01',
      memberName: 'David Ditch',
      memberPhone: '555-111-2222',
      userId: userId,
      active: active,
      checkInTime: checkIn ?? DateTime.now().subtract(const Duration(hours: 2)),
      checkOutTime: checkOut,
      doeSeen: doe,
      buckSeen: buck,
      riverVicksburgFt: 21.3,
      riverGreenvilleFt: 18.9,
    );

Forecast _forecast() {
  final now = DateTime.now();
  final start = DateTime(now.year, now.month, now.day, now.hour);
  return Forecast(
    fetchedAt: now,
    hours: [
      for (var i = 0; i < 24; i++)
        HourlyWeather(
          time: start.add(Duration(hours: i)),
          tempF: 72,
          windMph: 8,
          windDirDeg: 0, // N wind -> scent S
          tempDelta: 0,
        ),
    ],
  );
}

Widget _app({List<Override> overrides = const [], Widget home = const HomeScreen()}) {
  return ProviderScope(overrides: overrides, child: MaterialApp(home: home));
}

List<Override> _baseOverrides({Hunt? myHunt, List<Hunt> active = const []}) => [
      authUidProvider.overrideWith((ref) => 'uid-me'),
      currentMemberProvider.overrideWith((ref) => _me),
      activeHuntsProvider.overrideWith((ref) => Stream.value(active)),
      myActiveHuntProvider.overrideWith((ref) => Stream.value(myHunt)),
      standPositionsProvider.overrideWith(
          (ref) => Stream.value(const {'28': Offset(0.5, 0.5)})),
      forecastProvider.overrideWith((ref) => Stream.value(_forecast())),
      riverStatusProvider.overrideWith((ref) => Stream.value(RiverStatus(
            fetchedAt: DateTime.now(),
            vicksburg: const GaugeStatus(observedFt: 21.3, forecastFt: 23.0),
            greenville: const GaugeStatus(observedFt: 18.9, forecastFt: 18.9),
          ))),
      huntLogProvider.overrideWith((ref) => Stream.value([
            _hunt(
              id: 'done1',
              active: false,
              checkIn: DateTime(2026, 7, 3, 5, 40),
              checkOut: DateTime(2026, 7, 3, 9, 10),
              doe: 2,
              buck: 1,
            ),
          ])),
    ];

void main() {
  testWidgets('home renders status chips: open count, wind, river trend',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [_hunt()])));
    await tester.pump(); // let streams deliver

    expect(find.text('129 open'), findsOneWidget);
    expect(find.text('1 in use'), findsOneWidget);
    // N wind 8 mph -> scent blows S.
    expect(find.textContaining('Wind N 8'), findsOneWidget);
    expect(find.textContaining('scent S'), findsOneWidget);
    // River chip with rising Vicksburg and steady Greenville.
    expect(find.textContaining('Vburg 21.3′ ↗'), findsOneWidget);
    expect(find.textContaining('Gville 18.9′ →'), findsOneWidget);

    await tester.pumpWidget(const SizedBox()); // dispose timers
  });

  testWidgets('my-hunt banner shows when checked in and ticks elapsed',
      (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(
            myHunt: _hunt(userId: 'uid-me'), active: [_hunt(userId: 'uid-me')])));
    await tester.pump();

    expect(find.textContaining("You're on Stand 28"), findsOneWidget);
    expect(find.text('Check Out'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('search matches hunter names, not just stand codes',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [_hunt()])));
    await tester.pump();

    await tester.enterText(find.byType(TextField).first, 'ditch');
    await tester.pump();

    // Only stand 28 (David Ditch's) remains in the list.
    expect(find.text('Stand 28'), findsOneWidget);
    expect(find.text('Stand 29'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('hunt log shows season summary and completed hunt details',
      (tester) async {
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(), home: const HuntLogScreen()));
    await tester.pump();

    expect(find.text('Club season'), findsOneWidget);
    expect(find.text('hunts'), findsOneWidget);
    expect(find.textContaining('David Ditch · Rifle'), findsOneWidget);
    expect(find.textContaining('5:40 AM – 9:10 AM'), findsOneWidget);
    expect(find.textContaining('1 buck · 2 does'), findsOneWidget);
    expect(find.textContaining('Vburg 21.3 ft'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('history button navigates to the hunt log', (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    await tester.tap(find.byTooltip('Hunt log'));
    await tester.pumpAndSettle();

    expect(find.text('Hunt Log'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });
}
