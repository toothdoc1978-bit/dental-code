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

  group('RiverService.waterTempFFrom', () {
    Map<String, dynamic> usgs(List<Map<String, dynamic>> values) => {
          'value': {
            'timeSeries': [
              {
                'values': [
                  {'value': values},
                ],
              },
            ],
          },
        };

    test('converts the latest USGS reading from °C to °F', () {
      final f = RiverService.waterTempFFrom(usgs([
        {'value': '28.7', 'dateTime': '2026-07-05T17:00:00.000-05:00'},
      ]));
      expect(f, closeTo(83.66, 0.01));
    });

    test('empty series, empty values, and sentinel readings -> null', () {
      expect(RiverService.waterTempFFrom({'value': {'timeSeries': []}}), isNull);
      expect(RiverService.waterTempFFrom(usgs([])), isNull);
      expect(
          RiverService.waterTempFFrom(usgs([{'value': '-999999'}])), isNull);
      expect(RiverService.waterTempFFrom({}), isNull);
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
