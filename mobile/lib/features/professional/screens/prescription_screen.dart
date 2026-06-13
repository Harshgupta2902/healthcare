import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_repository.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
import '../../professional/data/professional_repository.dart';

class PrescriptionScreen extends ConsumerStatefulWidget {
  const PrescriptionScreen({super.key, required this.guestAppointmentId});

  final String guestAppointmentId;

  @override
  ConsumerState<PrescriptionScreen> createState() => _PrescriptionScreenState();
}

class _PrescriptionScreenState extends ConsumerState<PrescriptionScreen> {
  final _controller = TextEditingController();
  bool _sending = false;
  bool _htmlMode = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    final html = _htmlMode ? text : '<p>${text.replaceAll('\n', '</p><p>')}</p>';

    setState(() => _sending = true);
    try {
      await ref.read(apiRepositoryProvider).sendPrescription(
            guestAppointmentId: widget.guestAppointmentId,
            prescriptionHtml: html,
          );
      ref.invalidate(professionalGuestAppointmentsProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Prescription saved and emailed to patient.')),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Write prescription')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionHeader(
            title: 'Prescription',
            subtitle: 'Plain text or HTML — sent via secure API',
          ),
          SwitchListTile(
            title: const Text('HTML mode'),
            subtitle: const Text('Paste formatted HTML when enabled'),
            value: _htmlMode,
            onChanged: (v) => setState(() => _htmlMode = v),
          ),
          GlassCard(
            child: AppTextField(
              controller: _controller,
              label: _htmlMode ? 'Prescription HTML' : 'Prescription text',
              maxLines: 12,
            ),
          ),
          const SizedBox(height: 20),
          PrimaryGradientButton(
            label: _sending ? 'Sending…' : 'Send prescription',
            isLoading: _sending,
            onPressed: _sending ? null : _send,
          ),
        ],
      ),
    );
  }
}
