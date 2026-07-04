import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/river_status.dart';
import 'package:lop_app/services/river_service.dart';

void main() {
  group('RiverService.parseGauge', () {
    test('reads observed and forecast primary stage', () {
      final g = RiverService.parseGauge({
        'status': {
          'observed': {'primary': 21.34, 'secondary': -999},
          'forecast': {'primary': 23.1},
        },
      });
      expect(g.observedFt, closeTo(21.34, 0.001));
      expect(g.forecastFt, closeTo(23.1, 0.001));
    });

    test('treats NWPS -999 sentinels and missing keys as null', () {
      final g = RiverService.parseGauge({
        'status': {
          'observed': {'primary': -999},
        },
      });
      expect(g.observedFt, isNull);
      expect(g.forecastFt, isNull);
      expect(RiverService.parseGauge({}).observedFt, isNull);
    });
  });

  group('GaugeStatus.trend', () {
    test('rising / falling need > 0.2 ft of movement', () {
      expect(const GaugeStatus(observedFt: 20, forecastFt: 21).trend,
          RiverTrend.rising);
      expect(const GaugeStatus(observedFt: 20, forecastFt: 19).trend,
          RiverTrend.falling);
      expect(const GaugeStatus(observedFt: 20, forecastFt: 20.1).trend,
          RiverTrend.steady);
    });

    test('missing data -> unknown', () {
      expect(const GaugeStatus(observedFt: 20).trend, RiverTrend.unknown);
      expect(const GaugeStatus().trend, RiverTrend.unknown);
    });
  });
}
