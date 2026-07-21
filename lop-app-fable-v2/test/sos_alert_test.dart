import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/models/sos_alert.dart';

SosAlert _sos({double? lat, double? lng, String note = ''}) => SosAlert(
      id: 's1',
      memberId: 'm01',
      memberName: 'David Ditch',
      memberPhone: '555-111-2222',
      type: 'Stuck in the mud',
      note: note,
      lat: lat,
      lng: lng,
    );

void main() {
  group('mapsUrl', () {
    test('builds an Apple Maps link from coordinates', () {
      expect(_sos(lat: 32.81, lng: -91.12).mapsUrl,
          'https://maps.apple.com/?ll=32.81,-91.12&q=SOS');
    });

    test('null when there is no GPS fix', () {
      expect(_sos().mapsUrl, isNull);
      expect(_sos(lat: 32.81).mapsUrl, isNull); // half a fix is no fix
    });
  });

  group('smsBody', () {
    test('includes name, type, note, and the maps link', () {
      final body =
          _sos(lat: 32.81, lng: -91.12, note: 'truck buried on South Rd')
              .smsBody;
      expect(body, contains('SOS from David Ditch'));
      expect(body, contains('Stuck in the mud'));
      expect(body, contains('truck buried on South Rd'));
      expect(body, contains('https://maps.apple.com/?ll=32.81,-91.12'));
    });

    test('says GPS unavailable when there is no fix', () {
      final body = _sos().smsBody;
      expect(body, contains('GPS unavailable'));
      expect(body, isNot(contains('maps.apple.com')));
    });
  });

  test('first name falls back safely', () {
    expect(_sos().memberFirstName, 'David');
    expect(
        const SosAlert(
                id: 'x',
                memberId: 'm',
                memberName: '',
                memberPhone: '',
                type: 'Other')
            .memberFirstName,
        'Someone');
  });

  test('kSosTypes matches the firestore.rules enum (update BOTH if editing)',
      () {
    expect(kSosTypes,
        ['Stuck in the mud', 'Injured', 'Vehicle trouble', 'Other']);
  });

  group('smsUri', () {
    test('encodes spaces as %20 (never +, which iOS Messages shows literally)',
        () {
      final uri = SosAlert.smsUri(
          ['3181234567', '3187654321'], 'SOS from Chad — Stuck in the mud');
      final s = uri.toString();
      expect(s, startsWith('sms:3181234567,3187654321?body='));
      expect(s, isNot(contains('+')));
      expect(s, contains('%20'));
      // Round-trips back to the original text.
      expect(Uri.decodeComponent(s.split('body=').last),
          'SOS from Chad — Stuck in the mud');
    });
  });
}
