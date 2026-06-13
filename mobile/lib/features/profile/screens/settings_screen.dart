import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
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
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
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
                    style: AppTypography.bodyMedium,
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
            ListTile(
              leading: const Icon(Icons.edit_outlined, color: AppColors.brand),
              title: const Text('Edit health profile'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/profile/edit'),
            ),
          if (_biometricAvailable)
            SwitchListTile(
              secondary: const Icon(Icons.fingerprint, color: AppColors.brand),
              title: const Text('Biometric unlock'),
              subtitle: const Text('Require Face ID / fingerprint on app open'),
              value: _biometricEnabled ?? false,
              onChanged: (v) async {
                if (v) {
                  final ok = await ref.read(biometricServiceProvider).authenticate();
                  if (!ok) return;
                }
                await ref.read(biometricServiceProvider).setEnabled(v);
                setState(() => _biometricEnabled = v);
              },
            ),
          ListTile(
            leading: const Icon(Icons.mail_outline, color: AppColors.brand),
            title: const Text('Contact support'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/contact'),
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline, color: AppColors.brand),
            title: const Text('Change password'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Use forgot password flow or web settings')),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined, color: AppColors.brand),
            title: const Text('Privacy policy'),
            onTap: () {},
          ),
          const SizedBox(height: 32),
          SecondaryButton(
            label: 'Sign out',
            onPressed: () async {
              await ref.read(authRepositoryProvider).signOut();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
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
