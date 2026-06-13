import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_providers.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool? _biometricEnabled;
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _loadBiometric();
  }

  Future<void> _loadBiometric() async {
    final bio = ref.read(biometricServiceProvider);
    final enabled = await bio.isEnabled();
    final available = await bio.canCheckBiometrics();
    if (mounted) {
      setState(() {
        _biometricEnabled = enabled;
        _biometricAvailable = available;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Settings'),
      ),
      body: AmbientBackground(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            GlassCard(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.surfaceContainer,
                    child: Text(
                      (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.brand),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'User', style: AppTypography.textTheme.titleMedium),
                        Text(user?.email ?? '', style: AppTypography.pageSubtitle),
                        Text(
                          _roleLabel(user?.role),
                          style: AppTypography.sectionLabel.copyWith(fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (user?.isClient == true)
              ProfileMenuTile(
                icon: Icons.edit_outlined,
                label: 'Edit health profile',
                animationIndex: 0,
                onTap: () => context.push('/profile/edit'),
              ),
            if (_biometricAvailable)
              GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                elevated: false,
                child: SwitchListTile(
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.fingerprint, color: AppColors.brand),
                  ),
                  title: const Text('Biometric unlock'),
                  subtitle: const Text('Require Face ID / fingerprint on app open'),
                  value: _biometricEnabled ?? false,
                  activeThumbColor: AppColors.brand,
                  onChanged: (v) async {
                    if (v) {
                      final ok = await ref.read(biometricServiceProvider).authenticate();
                      if (!ok) return;
                    }
                    await ref.read(biometricServiceProvider).setEnabled(v);
                    setState(() => _biometricEnabled = v);
                  },
                ),
              ),
            ProfileMenuTile(
              icon: Icons.mail_outline,
              label: 'Contact support',
              animationIndex: 1,
              onTap: () => context.push('/contact'),
            ),
            ProfileMenuTile(
              icon: Icons.lock_outline,
              label: 'Change password',
              animationIndex: 2,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Use forgot password flow or web settings')),
                );
              },
            ),
            ProfileMenuTile(
              icon: Icons.privacy_tip_outlined,
              label: 'Privacy policy',
              animationIndex: 3,
              onTap: () {},
            ),
            const SizedBox(height: 16),
            SecondaryButton(
              label: 'Sign out',
              onPressed: () async {
                await ref.read(authRepositoryProvider).signOut();
                if (context.mounted) context.go('/login');
              },
            ),
          ],
        ),
      ),
    );
  }

  String _roleLabel(UserRole? role) {
    switch (role) {
      case UserRole.client:
        return 'PATIENT';
      case UserRole.professional:
        return 'PROFESSIONAL';
      case UserRole.admin:
        return 'ADMIN (WEB ONLY)';
      default:
        return 'USER';
    }
  }
}
