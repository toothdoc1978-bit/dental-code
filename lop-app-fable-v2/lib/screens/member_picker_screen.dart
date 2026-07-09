import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import '../data/members.dart';
import '../models/member.dart';
import '../providers/app_providers.dart';
import '../services/member_store.dart';
import 'rules_screen.dart';

/// First-launch identity screen: pick your name from the roster and confirm
/// your phone once. Saved on the device and remembered after that.
class MemberPickerScreen extends ConsumerStatefulWidget {
  const MemberPickerScreen({super.key});

  @override
  ConsumerState<MemberPickerScreen> createState() => _MemberPickerScreenState();
}

class _MemberPickerScreenState extends ConsumerState<MemberPickerScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = kMembers
        .where((m) =>
            _query.isEmpty || m.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Who are you?'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // Club logo — drop the file in assets/lop_logo.png and it appears.
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Image.asset(
              'assets/lop_logo.png',
              height: 88,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Find your name…',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final m = filtered[i];
                final sub = m.role.isEmpty ? m.phone : '${m.role} · ${m.phone}';
                return ListTile(
                  leading: CircleAvatar(child: Text(_initials(m.name))),
                  title: Text(m.name),
                  subtitle: Text(sub),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _confirm(m),
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton.icon(
                    icon: const Icon(Icons.menu_book, size: 18),
                    label: const Text('Read the club rules'),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RulesScreen()),
                    ),
                  ),
                  Text(kAppVersion,
                      style: TextStyle(
                          color: Colors.grey.shade500, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirm(Member member) async {
    final controller = TextEditingController(text: member.phone);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("You're ${member.name}"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Confirm your cell number so other members can text '
                'you when you’re on a stand:'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Cell number',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('This is me'),
          ),
        ],
      ),
    );

    if (ok == true) {
      final chosen = Member(
        id: member.id,
        name: member.name,
        phone: controller.text.trim(),
        role: member.role,
        shares: member.shares,
      );
      await MemberStore.save(chosen);
      ref.read(currentMemberProvider.notifier).state = chosen;
    }
  }

  String _initials(String name) {
    final parts = name.split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }
}
