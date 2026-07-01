import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/auth_repository.dart';

enum RegisterPhase { idle, sendingOtp, verifyingOtp }

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  UserRole _role = UserRole.client;
  bool _isLoading = false;
  bool _showPassword = false;
  String? _error;
  RegisterPhase _phase = RegisterPhase.idle;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      if (_phase == RegisterPhase.verifyingOtp) {
        await ref.read(authRepositoryProvider).verifyOtp(
              email: _emailController.text,
              otp: _otpController.text,
            );
        if (!mounted) return;
        context.go('/home');
        return;
      }

      await ref.read(authRepositoryProvider).signUp(
            email: _emailController.text,
            password: _passwordController.text,
            name: _nameController.text,
            role: _role,
          );

      final prefs = await SharedPreferences.getInstance();
      final otpEnabled = prefs.getBool('email_otp_enabled') ?? false;

      if (!mounted) return;

      if (otpEnabled) {
        setState(() {
          _phase = RegisterPhase.verifyingOtp;
          _isLoading = false;
        });
      } else {
        context.go('/home');
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('AuthException: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _phase == RegisterPhase.verifyingOtp
                      ? 'Verify OTP'
                      : 'Create account',
                  style: AppTypography.pageTitle.copyWith(fontSize: 28),
                ),
                const SizedBox(height: 8),
                Text(
                  _phase == RegisterPhase.verifyingOtp
                      ? 'Enter the 6-digit code sent to your email.'
                      : 'Sign up with your email — no third-party accounts needed.',
                  style: AppTypography.pageSubtitle,
                ),
                const SizedBox(height: 32),
                if (_error != null) ...[
                  ErrorBanner(message: _error!),
                  const SizedBox(height: 16),
                ],
                if (_phase == RegisterPhase.verifyingOtp) ...[
                  AppTextField(
                    controller: _otpController,
                    hint: 'Enter OTP',
                    keyboardType: TextInputType.number,
                    prefixIcon: Icons.lock_clock_outlined,
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'OTP is required'
                        : null,
                  ),
                ] else ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _RoleChip(
                          label: 'Patient',
                          icon: Icons.person_outline,
                          selected: _role == UserRole.client,
                          onTap: () => setState(() => _role = UserRole.client),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _RoleChip(
                          label: 'Professional',
                          icon: Icons.medical_services_outlined,
                          selected: _role == UserRole.professional,
                          onTap: () =>
                              setState(() => _role = UserRole.professional),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  AppTextField(
                    controller: _nameController,
                    hint: 'Full name',
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Name is required'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _emailController,
                    hint: 'Enter email',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: Icons.email_outlined,
                    validator: (v) {
                      if (v == null || !v.contains('@'))
                        return 'Valid email required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _passwordController,
                    hint: 'Create password',
                    obscureText: !_showPassword,
                    prefixIcon: Icons.lock_outline,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: AppColors.onSurfaceVariant,
                      ),
                      onPressed: () =>
                          setState(() => _showPassword = !_showPassword),
                    ),
                    validator: (v) =>
                        v != null && v.length >= 6 ? null : 'Min 6 characters',
                  ),
                ],
                const SizedBox(height: 32),
                PrimaryGradientButton(
                  label: _phase == RegisterPhase.verifyingOtp
                      ? 'Verify OTP'
                      : 'Create account',
                  isLoading: _isLoading,
                  onPressed: _submit,
                ),
                if (_phase == RegisterPhase.idle) ...[
                  const SizedBox(height: 24),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.go('/login'),
                      child: RichText(
                        text: TextSpan(
                          style: AppTypography.pageSubtitle,
                          children: [
                            const TextSpan(text: 'Already have an account? '),
                            TextSpan(
                              text: 'Login',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.brand,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          decoration: BoxDecoration(
            gradient: selected ? AppColors.brandGradient : null,
            color: selected ? null : AppColors.surfaceContainerLow,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected
                  ? Colors.transparent
                  : AppColors.outline.withValues(alpha: 0.4),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 18, color: selected ? Colors.white : AppColors.brand),
              const SizedBox(width: 8),
              Text(
                label,
                style: AppTypography.bodyMedium.copyWith(
                  color: selected ? Colors.white : AppColors.onSurface,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
