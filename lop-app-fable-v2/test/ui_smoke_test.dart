// UI smoke tests: pump the real screens with faked providers (no Firebase, no
// network) and drive the main flows — the closest thing to a device walkthrough
// that runs in CI.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:lop_app/models/club_status.dart';
import 'package:lop_app/models/forecast.dart';
import 'package:lop_app/models/hunt.dart';
import 'package:lop_app/models/member.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/models/sos_alert.dart';
import 'package:lop_app/providers/app_providers.dart';
import 'package:lop_app/screens/conditions_screen.dart';
import 'package:lop_app/screens/home_screen.dart';
import 'package:lop_app/screens/hunt_log_screen.dart';
import 'package:lop_app/screens/rules_screen.dart';
import 'package:lop_app/screens/sos_screen.dart';

const _me = Member(
    id: 'm99', name: 'Test Hunter', phone: '555-000-0000', role: 'Member', shares: '1');

Hunt _hunt({
  String id = 'h1',
  String standCode = '28',
  String activity = 'Deer',
  String method = 'Rifle',
  String userId = 'uid-me',
  String memberId = 'm01',
  String memberName = 'David Ditch',
  bool active = true,
  bool autoClosed = false,
  bool allDay = false,
  DateTime? checkIn,
  DateTime? checkOut,
  int? doe,
  int? buck,
}) =>
    Hunt(
      id: id,
      standCode: standCode,
      activity: activity,
      method: method,
      memberId: memberId,
      memberName: memberName,
      memberPhone: '555-111-2222',
      userId: userId,
      autoClosed: autoClosed,
      allDay: allDay,
      active: active,
      checkInTime: checkIn ?? DateTime.now().subtract(const Duration(hours: 2)),
      checkOutTime: checkOut,
      doeSeen: doe,
      buckSeen: buck,
      riverVicksburgFt: 21.3,
      riverGreenvilleFt: 18.9,
      riverObservedAt: checkIn?.subtract(const Duration(minutes: 20)),
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
  List<Hunt>? log,
  ClubStatus? club,
  List<SosAlert> sos = const [],
  Member member = _me,
}) =>
    [
      authUidProvider.overrideWith((ref) => 'uid-me'),
      currentMemberProvider.overrideWith((ref) => member),
      clubStatusProvider.overrideWith((ref) => Stream.value(club)),
      activeSosProvider.overrideWith((ref) => Stream.value(sos)),
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
      huntLogProvider.overrideWith((ref) => Stream.value(log ??
          [
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
  setUp(() => SharedPreferences.setMockInitialValues({}));

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
    final mine = _hunt(standCode: '1', memberId: 'm99', memberName: _me.name);
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(myHunt: mine, active: [mine])));
    await tester.pump();

    // One in the banner, one on the row.
    expect(find.text('Check Out'), findsNWidgets(2));

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets(
      'hunt started on ANOTHER device still shows as mine (member identity)',
      (tester) async {
    // Same member id, totally different anonymous device uid.
    final mine = _hunt(
        standCode: '1',
        memberId: 'm99',
        memberName: _me.name,
        userId: 'some-other-device');
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(myHunt: mine, active: [mine])));
    await tester.pump();

    // Banner + row Check Out both present, and no "Text" option for myself.
    expect(find.text('Check Out'), findsNWidgets(2));
    expect(find.textContaining("You're on Stand 1"), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('forgot-to-check-out notice shows for my auto-closed hunt',
      (tester) async {
    final swept = _hunt(
      id: 'swept1',
      standCode: '7',
      memberId: 'm99',
      memberName: _me.name,
      active: false,
      autoClosed: true,
      checkIn: DateTime(2026, 7, 8, 15, 0),
      checkOut: DateTime(2026, 7, 8, 20, 0),
    );
    await tester.pumpWidget(_app(overrides: _baseOverrides(log: [swept])));
    await tester.pump(); // streams deliver
    await tester.pump(); // AckStore future resolves -> notice renders

    expect(find.textContaining('auto-checked out of Stand 7'), findsOneWidget);

    // Dismiss hides it.
    await tester.tap(find.byTooltip('Dismiss'));
    await tester.pump();
    expect(find.textContaining('auto-checked out'), findsNothing);

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
    expect(find.textContaining('David Ditch · Deer · Rifle'), findsOneWidget);
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
    expect(find.text('End all active hunts now'), findsOneWidget);

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

  testWidgets('all-day hunt shows an ALL DAY badge on its list row',
      (tester) async {
    final allDay = _hunt(standCode: '1', allDay: true, memberId: 'someone-else');
    await tester.pumpWidget(_app(overrides: _baseOverrides(active: [allDay])));
    await tester.pump();

    expect(find.text('ALL DAY'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets(
      'check-in shows Activity chips, then Method chips, then enables Check In',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    // Tap an open stand row to open the check-in sheet (Stand 2, no hunt).
    await tester.tap(find.text('Stand 2'));
    await tester.pumpAndSettle();

    expect(find.text('What are you hunting?'), findsOneWidget);
    expect(find.text('Deer'), findsOneWidget);
    // Method step not shown until an activity is picked.
    expect(find.text('How?'), findsNothing);

    await tester.tap(find.text('Deer'));
    await tester.pump();

    expect(find.text('How?'), findsOneWidget);
    expect(find.text('Bow'), findsOneWidget);
    expect(find.text('Rifle'), findsOneWidget);

    final checkInButton =
        find.widgetWithText(FilledButton, 'Check In').first;
    expect(tester.widget<FilledButton>(checkInButton).onPressed, isNull);

    await tester.tap(find.text('Bow'));
    await tester.pump();

    expect(tester.widget<FilledButton>(checkInButton).onPressed, isNotNull);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('bow-only stand only offers archery activities/methods',
      (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    // Stand 1B is bow-only (stands_data.dart) but sits at list index 91 —
    // filter down to it instead of relying on ListView's lazy building.
    await tester.enterText(find.byType(TextField).first, '1B');
    await tester.pump();
    await tester.tap(find.text('Stand 1B'));
    await tester.pumpAndSettle();

    expect(find.text('Duck'), findsNothing); // shotgun-only, hidden
    expect(find.text('Deer'), findsOneWidget);

    await tester.tap(find.text('Deer'));
    await tester.pump();

    expect(find.text('Bow'), findsOneWidget);
    expect(find.text('Rifle'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('active SOS shows a red banner with map/call actions',
      (tester) async {
    final sos = SosAlert(
      id: 's1',
      memberId: 'm01',
      memberName: 'David Ditch',
      memberPhone: '555-111-2222',
      type: 'Stuck in the mud',
      note: 'South Rd near 38',
      lat: 32.81,
      lng: -91.12,
      createdAt: DateTime.now().subtract(const Duration(minutes: 22)),
    );
    await tester.pumpWidget(_app(overrides: _baseOverrides(sos: [sos])));
    await tester.pump();

    expect(find.textContaining('David needs help — Stuck in the mud'),
        findsOneWidget);
    expect(find.text('South Rd near 38'), findsOneWidget);
    expect(find.byTooltip('Open location in Maps'), findsOneWidget);
    expect(find.byTooltip('Call David'), findsOneWidget);
    // Not my SOS and I'm not admin — no resolve button.
    expect(find.byTooltip('Mark resolved'), findsNothing);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('sender sees the Resolve button on their own SOS',
      (tester) async {
    final sos = SosAlert(
      id: 's2',
      memberId: 'm99', // == _me
      memberName: _me.name,
      memberPhone: _me.phone,
      type: 'Injured',
      createdAt: DateTime.now(),
    );
    await tester.pumpWidget(_app(overrides: _baseOverrides(sos: [sos])));
    await tester.pump();

    expect(find.byTooltip('Mark resolved'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('SOS screen leads with 911 and disables Send until a type is set',
      (tester) async {
    await tester.pumpWidget(
        _app(overrides: _baseOverrides(), home: const SosScreen()));
    await tester.pump();

    expect(find.text('Call 911'), findsOneWidget);
    expect(find.textContaining('call 911 FIRST'), findsOneWidget);

    final send = find.widgetWithText(FilledButton, 'Send SOS');
    expect(tester.widget<FilledButton>(send).onPressed, isNull);

    await tester.tap(find.text('Stuck in the mud'));
    await tester.pump();
    expect(tester.widget<FilledButton>(send).onPressed, isNotNull);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('SOS app-bar button opens the SOS screen', (tester) async {
    await tester.pumpWidget(_app(overrides: _baseOverrides()));
    await tester.pump();

    await tester.tap(find.byTooltip('SOS — request help'));
    await tester.pumpAndSettle();

    expect(find.text('SOS — request help'), findsOneWidget);
    expect(find.text('Call 911'), findsOneWidget);

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
