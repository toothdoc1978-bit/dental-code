import 'package:flutter/material.dart';

import '../data/club_rules.dart';

/// The "read it in the truck" club rules: buck criteria up top, then the
/// quick-reference sections, then how to judge a mature buck on the hoof.
/// All content lives in `data/club_rules.dart` — edit that file each August.
class RulesScreen extends StatelessWidget {
  const RulesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Club Rules')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 32),
        children: [
          _header(),
          const SizedBox(height: 12),
          _buckCard(),
          const SizedBox(height: 12),
          for (final s in kRuleSections) ...[
            _sectionCard(s),
            const SizedBox(height: 12),
          ],
          _agingCard(),
        ],
      ),
    );
  }

  Widget _header() {
    return Column(
      children: [
        // Club logo — drop the file in assets/lop_logo.png and it appears.
        Image.asset(
          'assets/lop_logo.png',
          height: 110,
          errorBuilder: (_, __, ___) => Icon(Icons.shield_outlined,
              size: 64, color: Colors.green.shade800),
        ),
        const SizedBox(height: 8),
        const Text('Lookout Point Hunting Club — $kRulesSeason',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Text(kRulesDisclaimer,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
      ],
    );
  }

  /// The centerpiece: which buck can you shoot?
  Widget _buckCard() {
    return Card(
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.gps_fixed, size: 18, color: Colors.green.shade900),
                const SizedBox(width: 6),
                const Expanded(
                  child: Text('Buck rules — know before you shoot',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text('Max 5 bucks per membership if all criteria are met.',
                style: TextStyle(
                    color: Colors.green.shade900,
                    fontWeight: FontWeight.w600)),
            for (final r in kBuckRules) ...[
              const SizedBox(height: 12),
              Text(
                r.allowance.isEmpty ? r.title : '${r.title} — ${r.allowance}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 2),
              for (final b in r.bullets) _bullet(b),
            ],
          ],
        ),
      ),
    );
  }

  Widget _sectionCard(RuleSection s) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(s.icon, size: 18, color: Colors.green.shade800),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(s.title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            for (final b in s.bullets) _bullet(b),
          ],
        ),
      ),
    );
  }

  /// Judging a mature buck on the hoof — real club photos only.
  Widget _agingCard() {
    return Card(
      color: Colors.brown.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.visibility, size: 18, color: Colors.brown.shade800),
                const SizedBox(width: 6),
                const Expanded(
                  child: Text('Judging a mature buck',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(kAgingIntro, style: TextStyle(height: 1.35)),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              // Drop the comparison photo in assets/rules/buck_45_55.jpg.
              child: Image.asset(
                'assets/rules/buck_45_55.jpg',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 140,
                  color: Colors.brown.shade100,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    'Add assets/rules/buck_45_55.jpg\n(4½ vs 5½-year-old comparison photo)',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.brown.shade800),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            for (final c in kAgingCues) _bullet(c),
          ],
        ),
      ),
    );
  }

  Widget _bullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('•  '),
          Expanded(child: Text(text, style: const TextStyle(height: 1.3))),
        ],
      ),
    );
  }
}
