import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/auth_repository.dart';
import '../data/registration_settings_service.dart';
import '../models/registration_settings.dart';

enum RegisterStep { form, otp }

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();

  UserRole _role = UserRole.client;
  RegisterStep _step = RegisterStep.form;
  RegistrationSettings _settings = RegistrationSettings.defaults();
  bool _isLoading = false;
  bool _settingsLoaded = false;
  bool _showPassword = false;
  String? _error;
  int _resendCooldown = 0;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    try {
      final settings = await ref.read(authRepositoryProvider).getRegistrationSettings();
      if (!mounted) return;
      setState(() {
        _settings = settings;
        _settingsLoaded = true;
      });
    } catch (_) {
      if (!mounted) return;
      final fallback = await RegistrationSettingsService.load();
      setState(() {
        _settings = fallback;
        _settingsLoaded = true;
      });
    }
  }

  String get _fullName =>
      '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}'
          .trim();

  bool get _passwordLength => _passwordController.text.length >= 8;
  bool get _passwordLower =>
      RegExp(r'[a-z]').hasMatch(_passwordController.text);
  bool get _passwordUpper =>
      RegExp(r'[A-Z]').hasMatch(_passwordController.text);
  bool get _passwordNumber =>
      RegExp(r'[0-9]').hasMatch(_passwordController.text);
  bool get _passwordSymbol =>
      RegExp(r'[^A-Za-z0-9]').hasMatch(_passwordController.text);

  bool get _isPasswordValid =>
      _passwordLength &&
      _passwordLower &&
      _passwordUpper &&
      _passwordNumber &&
      _passwordSymbol;

  void _startResendCooldown(int seconds) {
    setState(() => _resendCooldown = seconds);
    _tickResendCooldown();
  }

  void _tickResendCooldown() {
    if (_resendCooldown <= 0 || !mounted) return;
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() => _resendCooldown -= 1);
      if (_resendCooldown > 0) _tickResendCooldown();
    });
  }

  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final local = parts[0];
    final visible = local.length <= 2 ? local : local.substring(0, 2);
    final masked = local.length > 2 ? '$visible***' : visible;
    return '$masked@${parts[1]}';
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repo = ref.read(authRepositoryProvider);

      if (_step == RegisterStep.otp) {
        final user = await repo.completeRegistration(
          email: _emailController.text,
          password: _passwordController.text,
          name: _fullName,
          role: _role,
          otp: _otpController.text,
        );
        if (!mounted) return;
        _goAfterAuth(user);
        return;
      }

      if (_settings.emailOtpEnabled) {
        final result = await repo.requestRegistrationOtp(
          email: _emailController.text,
          password: _passwordController.text,
          name: _fullName,
          role: _role,
        );
        if (!mounted) return;
        setState(() {
          _step = RegisterStep.otp;
          _settings = RegistrationSettings(
            emailOtpEnabled: _settings.emailOtpEnabled,
            otpLength: result.otpLength,
            otpExpiryMinutes: result.expiresInMinutes,
            resendCooldownSeconds: result.resendCooldownSeconds,
          );
          _otpController.clear();
          _isLoading = false;
        });
        _startResendCooldown(result.resendCooldownSeconds);
        return;
      }

      final user = await repo.completeRegistration(
        email: _emailController.text,
        password: _passwordController.text,
        name: _fullName,
        role: _role,
      );
      if (!mounted) return;
      _goAfterAuth(user);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '').replaceFirst('AuthException: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0 || _isLoading) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final result = await ref.read(authRepositoryProvider).requestRegistrationOtp(
            email: _emailController.text,
            password: _passwordController.text,
            name: _fullName,
            role: _role,
          );
      if (!mounted) return;
      setState(() => _isLoading = false);
      _startResendCooldown(result.resendCooldownSeconds);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _goAfterAuth(AppUser user) {
    if (user.isAdmin) {
      context.go('/admin-web-only');
    } else {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_settingsLoaded) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Center(child: CircularProgressIndicator(color: AppColors.brand)),
        ),
      );
    }

    final isOtpStep = _step == RegisterStep.otp;
    final otpLength = _settings.otpLength;

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
                  isOtpStep ? 'Verify email' : 'Create account',
                  style: AppTypography.pageTitle.copyWith(fontSize: 28),
                ),
                const SizedBox(height: 8),
                Text(
                  isOtpStep
                      ? 'Enter the $otpLength-character code sent to ${_maskEmail(_emailController.text.trim())}. It expires in ${_settings.otpExpiryMinutes} minutes.'
                      : 'Sign up with your email — no third-party accounts needed.',
                  style: AppTypography.pageSubtitle,
                ),
                const SizedBox(height: 32),
                if (_error != null) ...[
                  ErrorBanner(message: _error!),
                  const SizedBox(height: 16),
                ],
                if (isOtpStep) ...[
                  AppTextField(
                    controller: _otpController,
                    hint: 'Enter verification code',
                    textCapitalization: TextCapitalization.characters,
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                      LengthLimitingTextInputFormatter(otpLength),
                    ],
                    prefixIcon: Icons.lock_clock_outlined,
                    validator: (v) {
                      final value = v?.trim().toUpperCase() ?? '';
                      if (value.length != otpLength) {
                        return 'Enter the $otpLength-character code';
                      }
                      return null;
                    },
                  ),
                ] else ...[
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
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(
                          controller: _firstNameController,
                          hint: 'First name',
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Required'
                              : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppTextField(
                          controller: _lastNameController,
                          hint: 'Last name',
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Required'
                              : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _emailController,
                    hint: 'Enter email',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: Icons.email_outlined,
                    validator: (v) {
                      final value = v?.trim() ?? '';
                      if (value.isEmpty) return 'Email is required';
                      if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                          .hasMatch(value)) {
                        return 'Enter a valid email address';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _passwordController,
                    hint: 'Create password',
                    obscureText: !_showPassword,
                    prefixIcon: Icons.lock_outline,
                    onChanged: (_) => setState(() {}),
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
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Required';
                      if (!_isPasswordValid) return 'Weak password';
                      return null;
                    },
                  ),
                  if (_passwordController.text.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _PasswordChecklist(
                      length: _passwordLength,
                      lowercase: _passwordLower,
                      uppercase: _passwordUpper,
                      number: _passwordNumber,
                      symbol: _passwordSymbol,
                    ),
                  ],
                ],
                const SizedBox(height: 32),
                PrimaryGradientButton(
                  label: isOtpStep
                      ? 'Verify & create account'
                      : (_settings.emailOtpEnabled
                          ? 'Send verification code'
                          : 'Create account'),
                  isLoading: _isLoading,
                  onPressed: _submit,
                ),
                if (isOtpStep) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      TextButton.icon(
                        onPressed: _isLoading
                            ? null
                            : () => setState(() {
                                  _step = RegisterStep.form;
                                  _otpController.clear();
                                  _error = null;
                                }),
                        icon: const Icon(Icons.arrow_back, size: 18),
                        label: const Text('Back to form'),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: (_isLoading || _resendCooldown > 0)
                            ? null
                            : _resendOtp,
                        child: Text(
                          _resendCooldown > 0
                              ? 'Resend in ${_resendCooldown}s'
                              : 'Resend code',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.brand,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                if (!isOtpStep) ...[
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

class _PasswordChecklist extends StatelessWidget {
  const _PasswordChecklist({
    required this.length,
    required this.lowercase,
    required this.uppercase,
    required this.number,
    required this.symbol,
  });

  final bool length;
  final bool lowercase;
  final bool uppercase;
  final bool number;
  final bool symbol;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outline.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Security requirements',
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          _ChecklistItem(label: '8+ characters', met: length),
          _ChecklistItem(label: 'Lowercase letter', met: lowercase),
          _ChecklistItem(label: 'Uppercase letter', met: uppercase),
          _ChecklistItem(label: 'One number', met: number),
          _ChecklistItem(label: 'Special character', met: symbol),
        ],
      ),
    );
  }
}

class _ChecklistItem extends StatelessWidget {
  const _ChecklistItem({required this.label, required this.met});

  final String label;
  final bool met;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(
            met ? Icons.check_circle : Icons.circle_outlined,
            size: 16,
            color: met ? AppColors.brand : AppColors.onSurfaceVariant,
          ),
          const SizedBox(width: 8),
          Text(label, style: AppTypography.pageSubtitle),
        ],
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
