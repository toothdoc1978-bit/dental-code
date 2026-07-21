import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/members.dart';
import '../models/sos_alert.dart';
import '../providers/app_providers.dart';

/// Request help on the property. NOT a 911 replacement — the screen leads
/// with a Call 911 button. Sending writes an in-app alert (seen by everyone
/// with the app open) and then offers a prefilled group text to the Board
/// (SMS often gets through on one bar of signal where app data won't).
class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen> {
  String? _type;
  bool _sending = false;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final member = ref.watch(currentMemberProvider);
    final myActive = (ref.watch(activeSosProvider).valueOrNull ?? const [])
        .where((s) => s.memberId == member?.id)
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('SOS — request help')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: myActive.isNotEmpty
            ? _activeBody(myActive.first)
            : _sendBody(member != null),
      ),
    );
  }

  /// The send form: 911 first, then type + note + Send.
  Widget _sendBody(bool haveMember) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.red.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('If this is life-threatening, call 911 FIRST.',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.red.shade900)),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                      backgroundColor: Colors.red.shade700,
                      minimumSize: const Size.fromHeight(48)),
                  icon: const Icon(Icons.phone),
                  label: const Text('Call 911'),
                  onPressed: _call911,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        const Text('What\'s wrong?',
            style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final t in kSosTypes)
              ChoiceChip(
                label: Text(t),
                selected: _type == t,
                onSelected: (_) => setState(() => _type = t),
              ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _note,
          maxLength: 300,
          decoration: const InputDecoration(
            labelText: 'Details (optional)',
            hintText: 'e.g. truck buried past the axle on South Rd near 38',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              minimumSize: const Size.fromHeight(56),
            ),
            icon: const Icon(Icons.sos),
            label: Text(_sending ? 'Sending…' : 'Send SOS',
                style: const TextStyle(fontSize: 17)),
            onPressed:
                (_type == null || _sending || !haveMember) ? null : _send,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Sending opens a group text to the Board — the most reliable way '
          'to reach people out here — and posts a red alert with your GPS '
          'location in the app, which members see the next time they look at '
          'their phone. It does NOT contact emergency services.',
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
      ],
    );
  }

  /// I already have an open SOS: show it + resolve + re-offer the text.
  Widget _activeBody(SosAlert sos) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.red.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Your SOS is live — ${sos.type}',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.red.shade900)),
              const SizedBox(height: 4),
              Text(
                'Members will see this alert'
                '${sos.hasLocation ? ' and your location' : ''} next time '
                'they look at the app. The group text below is the most '
                'reliable way to reach people right now.',
                style: TextStyle(color: Colors.grey.shade800, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48)),
            icon: const Icon(Icons.sms_outlined),
            label: const Text('Text the Board my location'),
            onPressed: () => _textBoard(sos),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              minimumSize: const Size.fromHeight(52),
            ),
            icon: const Icon(Icons.check),
            label: const Text("I'm OK — mark resolved"),
            onPressed: () async {
              await ref.read(firestoreServiceProvider).resolveSos(sos.id);
              HapticFeedback.mediumImpact();
            },
          ),
        ),
      ],
    );
  }

  Future<void> _send() async {
    final member = ref.read(currentMemberProvider);
    if (member == null) return;
    setState(() => _sending = true);
    final messenger = ScaffoldMessenger.of(context);

    // Best-effort GPS, bounded HARD at 12s total. The inner 10s timeLimit
    // only covers the fix itself — the browser permission prompt can sit
    // unanswered indefinitely, and a panicked user must not be stuck behind
    // it. No fix → send without coordinates.
    var fix = (lat: null as double?, lng: null as double?, acc: null as double?);
    try {
      fix = await _getFix().timeout(const Duration(seconds: 12));
    } catch (_) {/* timeout/denied/unsupported — send anyway */}

    // Fire the Firestore write WITHOUT waiting for the server: offline it
    // stays queued (and pending) until signal returns, and the group text —
    // the channel that actually works on one bar — must not wait behind it.
    final res = ref.read(firestoreServiceProvider).sendSos(
          member: member,
          type: _type!,
          note: _note.text.trim(),
          lat: fix.lat,
          lng: fix.lng,
          accuracyM: fix.acc,
        );
    unawaited(res.ack.then<void>((_) {}, onError: (Object e) {
      // Definitive server rejection (not mere offline) — tell them the app
      // alert did NOT post, so the text/call is their only alert.
      if (mounted) {
        messenger.showSnackBar(SnackBar(
            content: Text('The in-app alert could not be posted ($e) — '
                'the group text or a phone call is your alert.')));
      }
    }));

    HapticFeedback.heavyImpact();
    if (!mounted) return;
    setState(() => _sending = false);
    final sos = SosAlert(
      id: res.id,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      type: _type!,
      note: _note.text.trim(),
      lat: fix.lat,
      lng: fix.lng,
    );
    await _textBoard(sos);
  }

  Future<void> _call911() async {
    final messenger = ScaffoldMessenger.of(context);
    var ok = false;
    try {
      ok = await launchUrl(Uri(scheme: 'tel', path: '911'));
    } catch (_) {
      ok = false;
    }
    if (!ok && mounted) {
      messenger.showSnackBar(const SnackBar(
          content: Text('This device cannot place calls — dial 911 from a '
              'phone.')));
    }
  }

  /// GPS permission + fix. Returns nulls on any failure; never throws except
  /// via the caller's outer timeout.
  Future<({double? lat, double? lng, double? acc})> _getFix() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return (lat: null, lng: null, acc: null);
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return (lat: pos.latitude, lng: pos.longitude, acc: pos.accuracy);
    } catch (_) {
      return (lat: null, lng: null, acc: null);
    }
  }

  /// Prefilled group text to Board members (SMS beats app data on weak signal).
  Future<void> _textBoard(SosAlert sos) async {
    final messenger = ScaffoldMessenger.of(context);
    final numbers = kMembers
        .where((m) => m.role == 'Board')
        .map((m) => m.digits)
        .where((d) => d.isNotEmpty)
        .toList();
    if (numbers.isEmpty) return;
    var opened = false;
    try {
      opened = await launchUrl(SosAlert.smsUri(numbers, sos.smsBody));
    } catch (_) {
      opened = false;
    }
    if (!opened && mounted) {
      // No Messages app (desktop browser, etc.) — don't let them assume a
      // text went out.
      messenger.showSnackBar(const SnackBar(
          content: Text('Could not open Messages on this device — no text '
              'was sent. Call a Board member directly.')));
    }
  }
}
