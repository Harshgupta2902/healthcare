import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/auth_repository.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _sent = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    if (!email.contains('@')) {
      setState(() => _error = 'Enter a valid email');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ref.read(authRepositoryProvider).resetPassword(email);
      setState(() => _sent = true);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset password')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _sent
              ? Column(
                  children: [
                    const Icon(Icons.mark_email_read_outlined, size: 56, color: AppColors.brand),
                    const SizedBox(height: 16),
                    Text('Check your email', style: AppTypography.pageTitle),
                    const SizedBox(height: 8),
                    Text(
                      'We sent a reset link to ${_emailController.text.trim()}',
                      style: AppTypography.pageSubtitle,
                      textAlign: TextAlign.center,
                    ),
                    const Spacer(),
                    SecondaryButton(label: 'Back to sign in', onPressed: () => context.go('/login')),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Forgot password?', style: AppTypography.pageTitle),
                    const SizedBox(height: 8),
                    Text('Enter your email and we will send a reset link.',
                        style: AppTypography.pageSubtitle),
                    const SizedBox(height: 24),
                    if (_error != null) ...[
                      ErrorBanner(message: _error!),
                      const SizedBox(height: 16),
                    ],
                    AppTextField(
                      controller: _emailController,
                      label: 'Email',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const Spacer(),
                    PrimaryGradientButton(
                      label: 'Send reset link',
                      isLoading: _loading,
                      onPressed: _submit,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
