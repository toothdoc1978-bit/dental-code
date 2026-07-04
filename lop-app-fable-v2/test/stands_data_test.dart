import 'package:flutter_test/flutter_test.dart';
import 'package:lop_app/data/stands_data.dart';

void main() {
  test('130 stands: 90 gold + 40 bow-only', () {
    expect(kStands.length, 130);
    expect(kStands.where((s) => !s.bowOnly).length, 90);
    expect(kStands.where((s) => s.bowOnly).length, 40);
  });

  test('codes are unique', () {
    final codes = kStands.map((s) => s.code).toSet();
    expect(codes.length, kStands.length);
  });

  test('bow-only codes carry a B suffix; gold codes do not', () {
    expect(standByCode('12B')?.bowOnly, true);
    expect(standByCode('12')?.bowOnly, false);
    expect(standByCode('999'), isNull);
  });
}
