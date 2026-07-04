import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/utils/format.dart';

void main() {
  group('fmtClock', () {
    test('null -> empty', () => expect(fmtClock(null), ''));
    test('morning', () {
      expect(fmtClock(DateTime(2026, 7, 4, 5, 42)), '5:42 AM');
    });
    test('noon and midnight are 12, not 0', () {
      expect(fmtClock(DateTime(2026, 7, 4, 0, 5)), '12:05 AM');
      expect(fmtClock(DateTime(2026, 7, 4, 12, 0)), '12:00 PM');
    });
  });

  group('fmtDuration', () {
    test('minutes only', () {
      expect(fmtDuration(const Duration(minutes: 45)), '45m');
    });
    test('hours and minutes', () {
      expect(fmtDuration(const Duration(hours: 3, minutes: 28)), '3h 28m');
    });
    test('zero', () => expect(fmtDuration(Duration.zero), '0m'));
  });

  group('fmtDate', () {
    test('weekday, month, day', () {
      // 2026-07-04 is a Saturday.
      expect(fmtDate(DateTime(2026, 7, 4)), 'Sat, Jul 4');
    });
  });

  group('cardinal', () {
    test('cardinal points', () {
      expect(cardinal(0), 'N');
      expect(cardinal(90), 'E');
      expect(cardinal(180), 'S');
      expect(cardinal(270), 'W');
    });
    test('wraps and normalizes', () {
      expect(cardinal(360), 'N');
      expect(cardinal(-90), 'W');
      expect(cardinal(22.5), 'NNE');
    });
  });
}
