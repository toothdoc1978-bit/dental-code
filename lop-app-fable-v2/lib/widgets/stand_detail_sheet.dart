import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/hunt_types.dart';
import '../models/hunt.dart';
import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../services/firestore_service.dart';

/// Bottom sheet shown when a stand is tapped. Open → pick a hunt type and Check
/// In (records exact time + river levels). Mine → Check Out (deer-hunting
/// methods must enter does/bucks/fawns first). Taken → who/what + Text button.
class StandDetailSheet extends ConsumerStatefulWidget {
  final Stand stand;
  const StandDetailSheet({super.key, required this.stand});

  @override
  ConsumerState<StandDetailSheet> createState() => _StandDetailSheetState();
}

class _StandDetailSheetState extends ConsumerState<StandDetailSheet> {
  String? _selectedType;
  bool _busy = false;

  final _doe = TextEditingController();
  final _buck = TextEditingController();
  final _fawn = TextEditingController();

  Stand get stand => widget.stand;

  @override
  void dispose() {
    _doe.dispose();
    _buck.dispose();
    _fawn.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final uid = ref.watch(authUidProvider);
    final hunt = ref.watch(activeHuntsByCodeProvider)[stand.code];
    final myHunt = ref.watch(myActiveHuntProvider).valueOrNull;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        16 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _header(),
          const SizedBox(height: 16),
          if (hunt == null)
            _openBody(myHunt)
          else if (hunt.userId == uid)
            _mineBody(hunt)
          else
            _takenBody(hunt),
        ],
      ),
    );
  }

  Widget _header() {
    final bow = stand.bowOnly;
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: bow ? Colors.brown.shade600 : Colors.green.shade700,
          child: Text(
            stand.code,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Stand ${stand.code}',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold)),
              Text(bow ? 'Bow-only stand' : 'Gold stand · any method',
                  style: TextStyle(color: Colors.grey.shade700)),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    );
  }

  // --- Open: pick a type + check in -----------------------------------------

  Widget _openBody(Hunt? myHunt) {
    if (myHunt != null) {
      return _notice(
        Icons.info_outline,
        "You're checked in at Stand ${myHunt.standCode}. "
        'Check out there before taking another stand.',
      );
    }

    final highWater = ref.watch(highWaterProvider);
    final types = allowedHuntTypes(bowOnly: stand.bowOnly, highWater: highWater);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (highWater) ...[
          _notice(
            Icons.water,
            'High water — archery only for deer (LDWF Area 1 rule while '
            'Vicksburg is above 43 ft).',
          ),
          const SizedBox(height: 12),
        ],
        const Text('What are you hunting?',
            style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final t in types)
              ChoiceChip(
                avatar: Icon(huntTypeIcon(t), size: 18),
                label: Text(t),
                selected: _selectedType == t,
                onSelected: (_) => setState(() => _selectedType = t),
              ),
          ],
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.login),
            label: Text(_busy ? 'Checking in…' : 'Check In',
                style: const TextStyle(fontSize: 17)),
            onPressed: (_selectedType == null || _busy) ? null : _checkIn,
          ),
        ),
      ],
    );
  }

  // --- Mine: show + check out (deer count if applicable) ---------------------

  Widget _mineBody(Hunt hunt) {
    final needsDeer = requiresDeerCount(hunt.huntType);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _huntLine(hunt, prefix: 'You', mine: true),
        if (hunt.riverVicksburgFt != null || hunt.riverGreenvilleFt != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'MS River @ check-in: '
              '${hunt.riverVicksburgFt != null ? 'Vicksburg ${hunt.riverVicksburgFt!.toStringAsFixed(1)} ft' : ''}'
              '${hunt.riverVicksburgFt != null && hunt.riverGreenvilleFt != null ? ' · ' : ''}'
              '${hunt.riverGreenvilleFt != null ? 'Greenville ${hunt.riverGreenvilleFt!.toStringAsFixed(1)} ft' : ''}',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ),
        if (needsDeer) ...[
          const SizedBox(height: 16),
          const Text('Deer seen — required to check out',
              style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              _countField(_doe, 'Does'),
              _countField(_buck, 'Bucks'),
              _countField(_fawn, 'Fawns'),
            ],
          ),
          const SizedBox(height: 6),
          Text('Enter 0 if you saw none.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        ],
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.logout),
            label: Text(_busy ? 'Checking out…' : 'Check Out',
                style: const TextStyle(fontSize: 17)),
            onPressed: (_busy || (needsDeer && !_deerCountsValid))
                ? null
                : () => _checkOut(
                      hunt,
                      doe: needsDeer ? int.parse(_doe.text.trim()) : null,
                      buck: needsDeer ? int.parse(_buck.text.trim()) : null,
                      fawn: needsDeer ? int.parse(_fawn.text.trim()) : null,
                    ),
          ),
        ),
      ],
    );
  }

  Widget _countField(TextEditingController c, String label) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: TextField(
          controller: c,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(
            labelText: label,
            isDense: true,
            border: const OutlineInputBorder(),
          ),
          onChanged: (_) => setState(() {}),
        ),
      ),
    );
  }

  bool get _deerCountsValid {
    final d = int.tryParse(_doe.text.trim());
    final b = int.tryParse(_buck.text.trim());
    final f = int.tryParse(_fawn.text.trim());
    return d != null && d >= 0 && b != null && b >= 0 && f != null && f >= 0;
  }

  // --- Taken by someone else: show + text ------------------------------------

  Widget _takenBody(Hunt hunt) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _huntLine(hunt, prefix: hunt.memberName),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.sms_outlined),
            label: Text('Text ${hunt.memberFirstName}',
                style: const TextStyle(fontSize: 17)),
            onPressed:
                hunt.memberPhone.isEmpty ? null : () => _text(hunt.memberPhone),
          ),
        ),
      ],
    );
  }

  Widget _huntLine(Hunt hunt, {required String prefix, bool mine = false}) {
    final since = _fmtTime(hunt.checkInTime);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: mine ? Colors.green.shade50 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(huntTypeIcon(hunt.huntType),
              color: Colors.grey.shade800, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$prefix · ${hunt.huntType}',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600)),
                if (since.isNotEmpty)
                  Text('Checked in at $since',
                      style: TextStyle(color: Colors.grey.shade700)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _notice(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.amber.shade900),
          const SizedBox(width: 12),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }

  // --- Actions ---------------------------------------------------------------

  Future<void> _checkIn() async {
    final member = ref.read(currentMemberProvider);
    final uid = ref.read(authUidProvider);
    if (member == null || uid == null) return;

    setState(() => _busy = true);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      // Record the Mississippi River stage at check-in (null if offline).
      final river = await ref.read(riverServiceProvider).currentLevels();
      await ref.read(firestoreServiceProvider).checkIn(
            stand: stand,
            huntType: _selectedType!,
            member: member,
            userId: uid,
            riverVicksburgFt: river.vicksburgFt,
            riverGreenvilleFt: river.greenvilleFt,
          );
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(content: Text('Checked in to Stand ${stand.code}')),
      );
    } on StandOccupiedException catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    } catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text('Check-in failed: $e')));
    }
  }

  Future<void> _checkOut(Hunt hunt, {int? doe, int? buck, int? fawn}) async {
    setState(() => _busy = true);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await ref
          .read(firestoreServiceProvider)
          .checkOut(hunt.id, doe: doe, buck: buck, fawn: fawn);
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(content: Text('Checked out of Stand ${stand.code}')),
      );
    } catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text('Check-out failed: $e')));
    }
  }

  Future<void> _text(String phone) async {
    final messenger = ScaffoldMessenger.of(context);
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri(scheme: 'sms', path: digits);
    try {
      final ok = await launchUrl(uri);
      if (!ok) messenger.showSnackBar(SnackBar(content: Text('Text $phone')));
    } catch (_) {
      messenger.showSnackBar(SnackBar(content: Text('Text $phone')));
    }
  }

  String _fmtTime(DateTime? dt) {
    if (dt == null) return '';
    final local = dt.toLocal();
    var h = local.hour;
    final m = local.minute.toString().padLeft(2, '0');
    final ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h == 0) h = 12;
    return '$h:$m $ampm';
  }
}
