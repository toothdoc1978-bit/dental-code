import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/members.dart';
import '../models/sos_alert.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';

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
                  onPressed: () => launchUrl(Uri(scheme: 'tel', path: '911')),
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
          'Sending shows a red alert with your GPS location to everyone who '
          'has the app open, then offers a group text to the Board. It does '
          'NOT contact emergency services.',
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
                'Sent ${fmtElapsed(sos.createdAt)} ago. Everyone with the app '
                'open can see it${sos.hasLocation ? ' and your location' : ''}.',
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

    // Best-effort GPS with a hard timeout — a denied prompt or a slow fix
    // must never block a call for help.
    double? lat, lng, accuracyM;
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission != LocationPermission.denied &&
          permission != LocationPermission.deniedForever) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );
        lat = pos.latitude;
        lng = pos.longitude;
        accuracyM = pos.accuracy;
      }
    } catch (_) {
      // No fix — send anyway.
    }

    try {
      final id = await ref.read(firestoreServiceProvider).sendSos(
            member: member,
            type: _type!,
            note: _note.text.trim(),
            lat: lat,
            lng: lng,
            accuracyM: accuracyM,
          );
      HapticFeedback.heavyImpact();
      if (!mounted) return;
      setState(() => _sending = false);
      // Offer the SMS fallback immediately with the freshly-built alert.
      final sos = SosAlert(
        id: id,
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        type: _type!,
        note: _note.text.trim(),
        lat: lat,
        lng: lng,
      );
      await _textBoard(sos);
    } catch (e) {
      if (mounted) setState(() => _sending = false);
      messenger.showSnackBar(
        SnackBar(
            content: Text('SOS could not be sent: $e — '
                'call or text someone directly.')),
      );
    }
  }

  /// Prefilled group text to Board members (SMS beats app data on weak signal).
  Future<void> _textBoard(SosAlert sos) async {
    final numbers = kMembers
        .where((m) => m.role == 'Board')
        .map((m) => m.digits)
        .where((d) => d.isNotEmpty)
        .toList();
    if (numbers.isEmpty) return;
    final uri = Uri(
      scheme: 'sms',
      path: numbers.join(','),
      queryParameters: {'body': sos.smsBody},
    );
    try {
      await launchUrl(uri);
    } catch (_) {
      // Messages app unavailable (e.g. desktop browser) — in-app alert is
      // already live, so nothing further to do.
    }
  }
}
