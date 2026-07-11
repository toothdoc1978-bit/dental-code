import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config.dart';
import '../models/sos_alert.dart';
import '../providers/app_providers.dart';
import '../utils/format.dart';

/// Unmissable red strip shown while any SOS is active. One row per alert
/// (usually zero or one): who, what, how long ago, plus Map / Call, and
/// Resolve for the sender or an admin (rules let anyone resolve; the UI just
/// keeps the button off screens where it'd invite accidental taps).
class SosBanner extends ConsumerWidget {
  const SosBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alerts = ref.watch(activeSosProvider).valueOrNull ?? const [];
    if (alerts.isEmpty) return const SizedBox.shrink();
    final memberId = ref.watch(currentMemberProvider)?.id;

    return Column(
      children: [
        for (final sos in alerts)
          _row(context, ref, sos,
              canResolve: sos.memberId == memberId ||
                  kAdminMemberIds.contains(memberId)),
      ],
    );
  }

  Widget _row(BuildContext context, WidgetRef ref, SosAlert sos,
      {required bool canResolve}) {
    final elapsed = fmtElapsed(sos.createdAt);
    return Material(
      color: Colors.red.shade700,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 8, 8, 8),
        child: Row(
          children: [
            const Text('🆘', style: TextStyle(fontSize: 18)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${sos.memberFirstName} needs help — ${sos.type}'
                    '${elapsed.isEmpty ? '' : ' · $elapsed'}',
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  if (sos.note.isNotEmpty)
                    Text(sos.note,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            if (sos.mapsUrl != null)
              IconButton(
                tooltip: 'Open location in Maps',
                icon: const Icon(Icons.map, color: Colors.white),
                onPressed: () => launchUrl(Uri.parse(sos.mapsUrl!)),
              ),
            if (sos.memberPhone.isNotEmpty)
              IconButton(
                tooltip: 'Call ${sos.memberFirstName}',
                icon: const Icon(Icons.phone, color: Colors.white),
                onPressed: () => launchUrl(Uri(
                    scheme: 'tel',
                    path: sos.memberPhone
                        .replaceAll(RegExp(r'[^0-9]'), ''))),
              ),
            if (canResolve)
              IconButton(
                tooltip: 'Mark resolved',
                icon: const Icon(Icons.check_circle_outline,
                    color: Colors.white),
                onPressed: () =>
                    ref.read(firestoreServiceProvider).resolveSos(sos.id),
              ),
          ],
        ),
      ),
    );
  }
}
