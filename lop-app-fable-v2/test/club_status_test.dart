import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/club_status.dart';
import 'package:lop_app/services/river_service.dart';

void main() {
  group('RiverService.resolveHighWater (LDWF hysteresis)', () {
    test('turns ON at 43.0 ft or higher', () {
      expect(RiverService.resolveHighWater(false, 43.0), isTrue);
      expect(RiverService.resolveHighWater(false, 47.2), isTrue);
    });

    test('turns OFF below 41.0 ft', () {
      expect(RiverService.resolveHighWater(true, 40.9), isFalse);
      expect(RiverService.resolveHighWater(true, 35.0), isFalse);
    });

    test('holds its previous answer in the 41.0–42.9 band (both directions)', () {
      expect(RiverService.resolveHighWater(true, 42.5), isTrue);
      expect(RiverService.resolveHighWater(false, 42.5), isFalse);
      expect(RiverService.resolveHighWater(true, 41.0), isTrue);
      expect(RiverService.resolveHighWater(false, 42.99), isFalse);
    });

    test('no gauge reading keeps the previous answer', () {
      expect(RiverService.resolveHighWater(true, null), isTrue);
      expect(RiverService.resolveHighWater(false, null), isFalse);
    });
  });

  group('ClubStatus.archeryOnly', () {
    test('auto follows the gauge-driven flag', () {
      expect(
          const ClubStatus(highWaterArchery: true).archeryOnly, isTrue);
      expect(
          const ClubStatus(highWaterArchery: false).archeryOnly, isFalse);
    });

    test('admin override wins over the gauge', () {
      expect(
          const ClubStatus(
                  highWaterArchery: false, mode: HighWaterMode.forceOn)
              .archeryOnly,
          isTrue);
      expect(
          const ClubStatus(highWaterArchery: true, mode: HighWaterMode.forceOff)
              .archeryOnly,
          isFalse);
    });
  });
}
