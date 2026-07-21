import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/services/firestore_service.dart';
import 'package:lop_app/utils/club_time.dart';

// The sweep runs on the CLUB's clock (US Central), regardless of the
// sweeping device's timezone. Tests therefore use explicit UTC instants:
// November is CST (UTC-6), so club 8 PM == 02:00 UTC the next calendar day.
void main() {
  group('clubTime (US Central wall clock)', () {
    test('CST in November: UTC-6', () {
      // Nov 14 2026 11:45 UTC == 05:45 club time.
      final club = clubTime(DateTime.utc(2026, 11, 14, 11, 45));
      expect((club.month, club.day, club.hour, club.minute), (11, 14, 5, 45));
    });

    test('CDT in July: UTC-5', () {
      // Jul 4 2026 12:00 UTC == 07:00 club time.
      expect(clubTime(DateTime.utc(2026, 7, 4, 12)).hour, 7);
    });

    test('2026 DST boundaries: starts Mar 8, ends Nov 1', () {
      // 07:59 UTC on Mar 8 is still CST (01:59 club); 08:00 UTC is CDT (03:00).
      expect(clubTime(DateTime.utc(2026, 3, 8, 7, 59)).hour, 1);
      expect(clubTime(DateTime.utc(2026, 3, 8, 8, 0)).hour, 3);
      // 06:59 UTC on Nov 1 is still CDT (01:59 club); 07:00 UTC is CST (01:00).
      expect(clubTime(DateTime.utc(2026, 11, 1, 6, 59)).hour, 1);
      expect(clubTime(DateTime.utc(2026, 11, 1, 7, 0)).hour, 1);
      expect(clubTime(DateTime.utc(2026, 11, 1, 7, 0)).minute, 0);
    });

    test('clubWallToUtc inverts clubTime', () {
      final wall = DateTime.utc(2026, 11, 14, 20); // club 8 PM, CST
      final utc = clubWallToUtc(wall);
      expect(utc, DateTime.utc(2026, 11, 15, 2));
      final c = clubTime(utc);
      expect((c.day, c.hour), (14, 20));
    });
  });

  group('FirestoreService.shouldAutoClose (8 PM CLUB-time sweep)', () {
    // Club wall times as UTC instants (November = CST = UTC-6).
    DateTime clubUtc(int d, int h, [int m = 0]) =>
        clubWallToUtc(DateTime.utc(2026, 11, d, h, m));

    test('morning hunt is NOT closed before club 8 PM', () {
      expect(
          FirestoreService.shouldAutoClose(
              clubUtc(14, 5, 45), clubUtc(14, 19, 59)),
          isFalse);
    });

    test('morning hunt IS closed at/after club 8 PM', () {
      expect(
          FirestoreService.shouldAutoClose(clubUtc(14, 5, 45), clubUtc(14, 20)),
          isTrue);
      expect(
          FirestoreService.shouldAutoClose(
              clubUtc(14, 5, 45), clubUtc(14, 22, 30)),
          isTrue);
    });

    test("yesterday's forgotten hunt is closed the next morning", () {
      expect(
          FirestoreService.shouldAutoClose(clubUtc(13, 15), clubUtc(14, 5)),
          isTrue);
    });

    test('a hunt started AFTER 8 PM survives until the next sweep', () {
      expect(FirestoreService.shouldAutoClose(clubUtc(14, 21), clubUtc(14, 23)),
          isFalse);
      expect(FirestoreService.shouldAutoClose(clubUtc(14, 21), clubUtc(15, 6)),
          isFalse);
      expect(
          FirestoreService.shouldAutoClose(clubUtc(14, 21), clubUtc(15, 20, 1)),
          isTrue);
    });

    test(
        "a device in another timezone can't sweep early: 8:01 PM Eastern is "
        'only 7:01 PM at the club', () {
      // Eastern 20:01 == UTC 01:01 next day == club 19:01. A morning hunt
      // must NOT be swept yet, no matter where the sweeping phone is.
      final easternEvening = DateTime.utc(2026, 11, 15, 1, 1); // 8:01 PM ET
      expect(clubTime(easternEvening).hour, 19);
      expect(
          FirestoreService.shouldAutoClose(clubUtc(14, 5, 45), easternEvening),
          isFalse);
    });
  });
}
