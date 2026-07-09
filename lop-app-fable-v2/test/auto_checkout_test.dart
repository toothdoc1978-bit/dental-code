import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/services/firestore_service.dart';

void main() {
  group('FirestoreService.shouldAutoClose (8 PM sweep)', () {
    final d = DateTime(2026, 11, 14); // a November hunting day

    test('morning hunt is NOT closed before 8 PM', () {
      final checkIn = DateTime(2026, 11, 14, 5, 45);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 19, 59)), isFalse);
    });

    test('morning hunt IS closed at/after 8 PM', () {
      final checkIn = DateTime(2026, 11, 14, 5, 45);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 20, 0)), isTrue);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 22, 30)), isTrue);
    });

    test("yesterday's forgotten hunt is closed the next morning", () {
      final checkIn = DateTime(2026, 11, 13, 15, 0);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 5, 0)), isTrue);
    });

    test('a hunt started AFTER 8 PM survives until the next sweep', () {
      final checkIn = DateTime(2026, 11, 14, 21, 0); // 9 PM check-in
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 14, 23, 0)), isFalse);
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 15, 6, 0)), isFalse);
      // ...but the NEXT evening's sweep takes it.
      expect(FirestoreService.shouldAutoClose(
          checkIn, DateTime(2026, 11, 15, 20, 1)), isTrue);
    });

    test('sanity: same-day boundary uses the configured hour', () {
      expect(FirestoreService.shouldAutoClose(
          DateTime(d.year, d.month, d.day, 19, 59),
          DateTime(d.year, d.month, d.day, 20, 0)), isTrue);
    });
  });
}
