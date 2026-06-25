import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/hunt.dart';
import '../providers/app_providers.dart';

/// Checkout form shown as a modal bottom sheet.
///
/// Three required, non-negative integer fields (doe / fawn / buck) default to
/// 0. On submit it completes the hunt and clears the map selection.
class CheckOutSheet extends ConsumerStatefulWidget {
  final Hunt hunt;
  const CheckOutSheet({super.key, required this.hunt});

  @override
  ConsumerState<CheckOutSheet> createState() => _CheckOutSheetState();
}

class _CheckOutSheetState extends ConsumerState<CheckOutSheet> {
  final _formKey = GlobalKey<FormState>();
  final _doe = TextEditingController(text: '0');
  final _fawn = TextEditingController(text: '0');
  final _buck = TextEditingController(text: '0');
  bool _submitting = false;

  @override
  void dispose() {
    _doe.dispose();
    _fawn.dispose();
    _buck.dispose();
    super.dispose();
  }

  String? _validateCount(String? v) {
    if (v == null || v.trim().isEmpty) return 'Required';
    final n = int.tryParse(v.trim());
    if (n == null) return 'Whole number';
    if (n < 0) return 'Cannot be negative';
    return null;
  }

  Widget _countField(String label, TextEditingController c) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: c,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        validator: _validateCount,
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ref.read(firestoreServiceProvider).checkOut(
            huntId: widget.hunt.id,
            doe: int.parse(_doe.text.trim()),
            fawn: int.parse(_fawn.text.trim()),
            buck: int.parse(_buck.text.trim()),
          );
      ref.read(selectedStandProvider.notifier).state = null;
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Checked out of Stand ${widget.hunt.standId}')),
        );
      }
    } catch (e) {
      setState(() => _submitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Checkout failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Pad above the keyboard.
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Check Out — Stand ${widget.hunt.standId}',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text('Log what you saw this sit.',
                style: TextStyle(color: Colors.black54)),
            const SizedBox(height: 12),
            _countField('Does seen', _doe),
            _countField('Fawns seen', _fawn),
            _countField('Bucks seen', _buck),
            const SizedBox(height: 16),
            FilledButton(
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
              ),
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Confirm Check Out',
                      style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
