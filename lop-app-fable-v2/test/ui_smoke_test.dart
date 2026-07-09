// UI smoke tests: pump the real screens with faked providers (no Firebase, no
// network) and drive the main flows — the closest thing to a device walkthrough
// that runs in CI.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:lop_app/models/club_status.dart';
import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/models/hunt.dart';
import 'package:lop_app/models/member.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/providers/app_providers.dart';
import 'package:lop_app/screens/conditions_screen.dart';
import 'package:lop_app/screens/home_screen.dart';
import 'package:lop_app/screens/hunt_log_screen.dart';
import 'package:lop_app/screens/rules_screen.dart';

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

List<Override> _baseOverrides({
  Hunt? myHunt,
  List<Hunt> active = const [],
  ClubStatus? club,
  Member member = _me,
}) =>
    [
      authUidProvider.overrideWith((ref) => 'uid-me'),
      currentMemberProvider.overrideWith((ref) => member),
      clubStatusProvider.overrideWith((ref) => Stream.value(club)),
      activeHuntsProvider.overrideWith((ref) => Stream.value(active)),
      myActiveHuntProvider.overrideWith((ref) => Stream.value(myHunt)),
      standPositionsProvider.overrideWith(
          (ref) => Stream.value(const {'28': Offset(0.5, 0.5)})),
      forecastProvider.overrideWith((ref) => Stream.value(_forecast())),
      riverStatusProvider.overrideWith((ref) => Stream.value(RiverStatus(
            fetchedAt: DateTime.now(),
            vicksburg: const GaugeStatus(observedFt: 21.3, forecastFt: 23.0),
            greenville: const GaugeStatus(observedFt: 18.9, forecastFt: 18.9),
            waterTempF: 84,
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
  testWidgets('home shows open/in-use counts and a Conditions button',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [_hunt()])));
    await tester.pump(); // let streams deliver

    expect(find.text('129 open'), findsOneWidget);
    expect(find.text('1 in use'), findsOneWidget);
    // Weather/river details moved off the home screen behind Conditions.
    expect(find.text('Conditions'), findsOneWidget);
    expect(find.textContaining('Vburg'), findsNothing);
    expect(find.textContaining('Wind'), findsNothing);

    await tester.pumpWidget(const SizedBox()); // dispose timers
  });

  testWidgets('conditions screen shows weather, hourly, and river stages',
      (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(), home: const ConditionsScreen()));
    await tester.pump();

    expect(find.text('Right now'), findsOneWidget);
    expect(find.textContaining('Wind N 8 mph'), findsOneWidget);
    expect(find.textContaining('% cloud cover'), findsOneWidget);
    expect(find.text('Mississippi River'), findsOneWidget);
    expect(find.text('21.3 ft'), findsOneWidget); // Vicksburg
    expect(find.textContaining('↗ rising'), findsOneWidget);
    expect(find.text('18.9 ft'), findsOneWidget); // Greenville
    expect(find.textContaining('Water temperature'), findsOneWidget);
    expect(find.text('Next 24 hours'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('my stand row shows a red Check Out button', (tester) async {
    // Stand 1 so the row is at the top of the (lazy) list and gets built.
    final mine = _hunt(standCode: '1', userId: 'uid-me');
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(myHunt: mine, active: [mine])));
    await tester.pump();

    // One in the banner, one on the row.
    expect(find.text('Check Out'), findsNWidgets(2));

    await tester.pumpWidget(const SizedBox());
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

  testWidgets('high-water banner shows when the rule is active', (tester) async {
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(
            club: const ClubStatus(
                highWaterArchery: false, mode: HighWaterMode.forceOn))));
    await tester.pump();

    expect(find.textContaining('HIGH WATER'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('no high-water banner in normal conditions', (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    expect(find.textContaining('HIGH WATER'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('admin card only shows for the admin member', (tester) async {
    const chad = Member(
        id: 'm27', name: 'Chad Gardner', phone: '318-282-1827', role: 'Board');
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(member: chad),
        home: const ConditionsScreen()));
    await tester.pump();
    expect(find.textContaining('Admin'), findsOneWidget);
    expect(find.text('Force ON'), findsOneWidget);

    // Tear down before re-pumping: a ProviderScope's overrides must not
    // change in place, so the second pump needs a fresh tree.
    await tester.pumpWidget(const SizedBox());
    await tester.pumpWidget(_app(
        overrides: _baseOverrides(), home: const ConditionsScreen()));
    await tester.pump();
    expect(find.textContaining('Admin'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('rules screen renders buck criteria and aging guide',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: RulesScreen()));
    await tester.pump();

    expect(find.textContaining('Max 5 bucks per membership'), findsOneWidget);
    expect(find.textContaining('Cull buck'), findsOneWidget);
    expect(find.textContaining('NEVER a cull'), findsOneWidget);
    expect(find.textContaining('Ten-point or better'), findsOneWidget);

    await tester.dragUntilVisible(
      find.textContaining('Judging a mature buck'),
      find.byType(ListView),
      const Offset(0, -400),
    );
    expect(find.textContaining('Judging a mature buck'), findsOneWidget);
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
