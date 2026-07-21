import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart' show FirebaseException;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/hunt_types.dart';
import '../data/members.dart';
import '../models/hunt.dart';
import '../models/member.dart';
import '../models/stand.dart';
import '../providers/app_providers.dart';
import '../services/firestore_service.dart';
import '../utils/format.dart';

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
  String? _selectedActivity;
  String? _selectedMethod;
  bool _busy = false;
  bool _allDay = false;
  Member? _responsibleAdult;

  final _doe = TextEditingController();
  final _buck = TextEditingController();
  final _fawn = TextEditingController();
  final _guestNames = TextEditingController();

  Stand get stand => widget.stand;

  @override
  void dispose() {
    _doe.dispose();
    _buck.dispose();
    _fawn.dispose();
    _guestNames.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final memberId = ref.watch(currentMemberProvider)?.id;
    final myHunt = ref.watch(myActiveHuntProvider).valueOrNull;
    var hunt = ref.watch(activeHuntsByCodeProvider)[stand.code];
    // If I hold an active hunt on THIS stand, always show it as mine. The
    // by-code map keeps only one hunt per stand, so if the accepted
    // double-occupancy race ever puts two hunts on a stand, the dropped
    // hunter would otherwise see _takenBody with no Check Out path at all.
    if (myHunt != null && myHunt.standCode == stand.code) hunt = myHunt;

    // SingleChildScrollView is required, not decorative: the open-check-in
    // body now stacks hunt-type chips + an all-day switch + a guest expander,
    // which can overflow a short phone screen once the keyboard is up for the
    // guest-name field.
    return SingleChildScrollView(
      child: Padding(
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
            else if (hunt.memberId == memberId)
              _mineBody(hunt)
            else
              _takenBody(hunt),
          ],
        ),
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
    final activities =
        allowedActivities(bowOnly: stand.bowOnly, highWater: highWater);
    // If the stand/high-water combo changed under a stale selection (e.g.
    // high water just kicked in), drop choices that are no longer legal.
    if (_selectedActivity != null && !activities.contains(_selectedActivity)) {
      _selectedActivity = null;
      _selectedMethod = null;
    }
    final methods = _selectedActivity == null
        ? const <String>[]
        : allowedMethods(
            activity: _selectedActivity!,
            bowOnly: stand.bowOnly,
            highWater: highWater,
          );
    if (_selectedMethod != null && !methods.contains(_selectedMethod)) {
      _selectedMethod = null;
    }
    // Skip the method step entirely when there's only one legal choice
    // (Scouting/Camera Service → always just 'None').
    if (methods.length == 1 && _selectedMethod == null) {
      _selectedMethod = methods.first;
    }

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
            for (final a in activities)
              ChoiceChip(
                avatar: Icon(activityIcon(a), size: 18),
                label: Text(a),
                selected: _selectedActivity == a,
                onSelected: (_) => setState(() {
                  _selectedActivity = a;
                  _selectedMethod = null;
                }),
              ),
          ],
        ),
        if (_selectedActivity != null && methods.length > 1) ...[
          const SizedBox(height: 14),
          const Text('How?', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final m in methods)
                ChoiceChip(
                  label: Text(m),
                  selected: _selectedMethod == m,
                  onSelected: (_) => setState(() => _selectedMethod = m),
                ),
            ],
          ),
        ] else if (_selectedMethod != null && _selectedMethod != 'None') ...[
          // Single legal method auto-picked (e.g. Duck → Shotgun): say so
          // instead of silently recording a choice the member never saw.
          const SizedBox(height: 8),
          Text('Method: $_selectedMethod',
              style: TextStyle(color: Colors.grey.shade700, fontSize: 13)),
        ],
        const SizedBox(height: 12),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          dense: true,
          title: const Text('Hunting all day? (Yellow Tag)'),
          subtitle: const Text(
              "Lets others avoid driving past you unnecessarily.",
              style: TextStyle(fontSize: 12)),
          value: _allDay,
          onChanged: (v) => setState(() => _allDay = v),
        ),
        _guestExpander(),
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
            onPressed: (_selectedActivity == null ||
                    _selectedMethod == null ||
                    _busy)
                ? null
                : _checkIn,
          ),
        ),
      ],
    );
  }

  /// Collapsed by default (most check-ins are solo). Optional guest name(s) +
  /// a responsible-adult picker, purely for whereabouts/safety visibility —
  /// NOT a hunter-safety certification (no age field exists to enforce
  /// "adult"). Draws from the full roster, not just active hunters, since the
  /// picker is most useful at the very first check-in of the day when nobody
  /// else is active yet.
  Widget _guestExpander() {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        title: const Text('Add a guest', style: TextStyle(fontSize: 14)),
        childrenPadding: const EdgeInsets.only(bottom: 8),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _guestNames,
            decoration: const InputDecoration(
              labelText: 'Guest name(s)',
              hintText: 'e.g. John Smith, Sam Smith',
              isDense: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 10),
          DropdownButtonFormField<Member?>(
            initialValue: _responsibleAdult,
            decoration: const InputDecoration(
              labelText: 'Responsible adult (optional)',
              isDense: true,
              border: OutlineInputBorder(),
            ),
            items: [
              const DropdownMenuItem<Member?>(value: null, child: Text('—')),
              for (final m in kMembers)
                DropdownMenuItem<Member?>(value: m, child: Text(m.name)),
            ],
            onChanged: (m) => setState(() => _responsibleAdult = m),
          ),
        ],
      ),
    );
  }

  // --- Mine: show + check out (deer count if applicable) ---------------------

  Widget _mineBody(Hunt hunt) {
    final needsDeer = requiresDeerCount(hunt.activity);
    final riverAge = (hunt.riverObservedAt != null && hunt.checkInTime != null)
        ? hunt.checkInTime!.difference(hunt.riverObservedAt!)
        : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _huntLine(hunt, prefix: 'You', mine: true),
        if (hunt.riverVicksburgFt != null || hunt.riverGreenvilleFt != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'MS River: '
              '${hunt.riverVicksburgFt != null ? 'Vicksburg ${hunt.riverVicksburgFt!.toStringAsFixed(1)} ft' : ''}'
              '${hunt.riverVicksburgFt != null && hunt.riverGreenvilleFt != null ? ' · ' : ''}'
              '${hunt.riverGreenvilleFt != null ? 'Greenville ${hunt.riverGreenvilleFt!.toStringAsFixed(1)} ft' : ''}'
              '${riverAge != null && riverAge > Duration.zero ? ' (reading was ${fmtDuration(riverAge)} old at check-in)' : ''}',
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
    final extras = <String>[
      if (hunt.guestNames.isNotEmpty) 'with ${hunt.guestNames.join(', ')}',
      if (hunt.responsibleAdultName != null)
        'responsible adult: ${hunt.responsibleAdultName}',
    ];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: mine ? Colors.green.shade50 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(activityIcon(hunt.activity),
              color: Colors.grey.shade800, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                          '$prefix · ${huntLabel(hunt.activity, hunt.method)}',
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                    if (hunt.allDay)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade200,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('ALL DAY',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber.shade900)),
                      ),
                  ],
                ),
                if (since.isNotEmpty)
                  Text('Checked in at $since',
                      style: TextStyle(color: Colors.grey.shade700)),
                for (final e in extras)
                  Text(e,
                      style: TextStyle(
                          color: Colors.grey.shade700, fontSize: 12)),
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
      // Never fetch river data live at check-in — read whatever's already
      // cached (kept warm by HomeScreen). Zero network wait, and more
      // reliable than a live call: a momentary NOAA outage can't null it out.
      final river = ref.read(riverStatusProvider).valueOrNull;
      final guestNames = _guestNames.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      final res = await ref.read(firestoreServiceProvider).checkIn(
            stand: stand,
            activity: _selectedActivity!,
            method: _selectedMethod!,
            member: member,
            userId: uid,
            riverVicksburgFt: river?.vicksburg.observedFt,
            riverGreenvilleFt: river?.greenville.observedFt,
            riverObservedAt: river?.fetchedAt,
            allDay: _allDay,
            guestNames: guestNames,
            responsibleAdult: _responsibleAdult,
          );
      // Success feedback must not wait on the server: with no signal the
      // write is queued locally and the ack stays pending until sync. Race
      // it briefly, then be honest either way.
      var synced = true;
      try {
        await res.ack.timeout(const Duration(seconds: 3));
      } on TimeoutException {
        synced = false;
        unawaited(res.ack.catchError((_) {})); // board stream is the truth
      }
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(
            content: Text(synced
                ? 'Checked in to Stand ${stand.code}'
                : 'Checked in to Stand ${stand.code} — no signal, saved on '
                    'this phone and will sync')),
      );
    } on StandOccupiedException catch (e) {
      if (mounted) setState(() => _busy = false);
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    } on AlreadyCheckedInException catch (e) {
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
      final ack = ref
          .read(firestoreServiceProvider)
          .checkOut(hunt.id, doe: doe, buck: buck, fawn: fawn);
      var synced = true;
      try {
        await ack.timeout(const Duration(seconds: 3));
      } on TimeoutException {
        synced = false;
        unawaited(ack.catchError((_) {}));
      }
      HapticFeedback.mediumImpact();
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(
            content: Text(synced
                ? 'Checked out of Stand ${stand.code}'
                : 'Checked out of Stand ${stand.code} — no signal, saved on '
                    'this phone and will sync')),
      );
    } on FirebaseException catch (e) {
      if (mounted) setState(() => _busy = false);
      // permission-denied here almost always means the 8 PM sweep closed
      // this hunt first — point at the recovery path instead of jargon.
      messenger.showSnackBar(SnackBar(
          content: Text(e.code == 'permission-denied'
              ? 'This hunt was already auto-closed (8 PM sweep). Your deer '
                  'count can be added from the notice on the home screen.'
              : 'Check-out failed: ${e.message ?? e.code}')));
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
