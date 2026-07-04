/// A hunting stand on the Lookout Point property.
///
///   * **Gold** stands (numbers 1–90) — any legal method (rifle, bow, etc.)
///   * **Bow-only** stands (numbers 1–40, shown with a "B" on the map)
///
/// [code] is the stable, unique identifier used everywhere (list keys, Firestore
/// `standCode`): "28" for gold stand 28, "28B" for bow-only stand 28.
class Stand {
  final int number;
  final bool bowOnly;

  const Stand({required this.number, required this.bowOnly});

  String get code => bowOnly ? '${number}B' : '$number';
  String get label => code;
  String get category => bowOnly ? 'Bow-only' : 'Gold';
}
