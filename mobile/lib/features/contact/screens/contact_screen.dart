import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_repository.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';

const _contactSubjects = [
  'General Inquiry',
  'Technical Support',
  'Clinical Consultation',
  'Partnership Opportunities',
];

class ContactScreen extends ConsumerStatefulWidget {
  const ContactScreen({super.key});

  @override
  ConsumerState<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends ConsumerState<ContactScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  String _subject = _contactSubjects.first;
  bool _submitting = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().length < 2 ||
        _email.text.trim().isEmpty ||
        _message.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all fields (message min 10 chars).')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(apiRepositoryProvider).submitContact(
            name: _name.text.trim(),
            email: _email.text.trim(),
            subject: _subject,
            message: _message.text.trim(),
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message sent — we will reply soon.')),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Contact us'),
      ),
      body: AmbientBackground(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Get in touch', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
            const SizedBox(height: 4),
            Text('Questions about care, billing, or partnerships', style: AppTypography.pageSubtitle),
            const SizedBox(height: 20),
            GlassCard(
              gradientBorder: true,
              child: Column(
                children: [
                  AppTextField(controller: _name, label: 'Name'),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _email,
                    label: 'Email',
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text('SUBJECT', style: AppTypography.fieldLabel),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _subject,
                    borderRadius: BorderRadius.circular(16),
                    items: _contactSubjects
                        .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                        .toList(),
                    onChanged: (v) => setState(() => _subject = v ?? _subject),
                  ),
                  const SizedBox(height: 12),
                  AppTextField(controller: _message, label: 'Message', maxLines: 5),
                ],
              ),
            ),
            const SizedBox(height: 20),
            PrimaryGradientButton(
              label: _submitting ? 'Sending…' : 'Send message',
              isLoading: _submitting,
              onPressed: _submitting ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
