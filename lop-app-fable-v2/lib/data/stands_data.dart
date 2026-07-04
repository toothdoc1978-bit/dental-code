import 'package:collection/collection.dart';
import '../models/stand.dart';

/// Every hunting area: gold stands 1–90 (any method) + bow-only stands 1–40.
/// 130 stands total. Edit the two ranges to change the layout.
final List<Stand> kStands = [
  for (var n = 1; n <= 90; n++) Stand(number: n, bowOnly: false),
  for (var n = 1; n <= 40; n++) Stand(number: n, bowOnly: true),
];

/// Look up a stand by its [Stand.code] (e.g. "28" or "12B").
Stand? standByCode(String code) =>
    kStands.firstWhereOrNull((s) => s.code == code);
