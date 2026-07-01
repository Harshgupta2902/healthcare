import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/data/auth_repository.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.surfaceAlt,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border:
                  Border.all(color: AppColors.outline.withValues(alpha: 0.4)),
            ),
            child: const Icon(Icons.arrow_back_rounded, size: 20),
          ),
        ),
        title: Text('Settings',
            style: AppTypography.pageTitle.copyWith(fontSize: 20)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _SettingsCard(
            items: [
              _SettingsItem(
                icon: Icons.notifications_outlined,
                label: 'Notifications',
                onTap: () => context.push('/settings/notifications'),
              ),
              const _SettingsItem(
                  icon: Icons.language_outlined,
                  label: 'Language',
                  trailing: 'English'),
              _SettingsItem(
                icon: Icons.lock_outline,
                label: 'Forgot password',
                onTap: () => context.push('/forgot-password'),
              ),
              const _SettingsItem(
                  icon: Icons.security_outlined, label: '2FA authentication'),
              const _SettingsItem(
                  icon: Icons.brightness_6_outlined,
                  label: 'Theme',
                  trailing: 'Light mode'),
              const _SettingsItem(
                  icon: Icons.sync_outlined, label: 'Sync with calendar'),
              _SettingsItem(
                icon: Icons.logout,
                label: 'Logout',
                onTap: () => _confirmLogout(context, ref),
              ),
            ],
          ),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
            label: const Text('Delete account',
                style: TextStyle(color: Colors.red)),
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.white,
              side: const BorderSide(color: Colors.red),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadii.lg)),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (leave == true && context.mounted) {
      await ref.read(authRepositoryProvider).signOut();
      if (context.mounted) context.go('/login');
    }
  }
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.items});

  final List<_SettingsItem> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.outline.withValues(alpha: 0.35)),
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            items[i],
            if (i < items.length - 1)
              Divider(
                  height: 1,
                  indent: 56,
                  color: AppColors.outline.withValues(alpha: 0.35)),
          ],
        ],
      ),
    );
  }
}

class _SettingsItem extends StatelessWidget {
  const _SettingsItem({
    required this.icon,
    required this.label,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: AppColors.brand, size: 22),
      title: Text(label,
          style:
              AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w500)),
      trailing: trailing != null
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(trailing!,
                    style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
                const SizedBox(width: 4),
                const Icon(Icons.chevron_right_rounded,
                    color: AppColors.onSurfaceVariant, size: 22),
              ],
            )
          : const Icon(Icons.chevron_right_rounded,
              color: AppColors.onSurfaceVariant, size: 22),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
    );
  }
}
