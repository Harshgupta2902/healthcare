import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_providers.dart';
import 'client_profile_screen.dart';

/// Behance-style account hub (profile tab).
class ClientAccountScreen extends ConsumerWidget {
  const ClientAccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 110),
        children: [
          Column(
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: AppColors.surfaceContainer,
                backgroundImage: user?.image != null ? CachedNetworkImageProvider(user!.image!) : null,
                child: user?.image == null
                    ? Text(
                        (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                        style: AppTypography.pageTitle.copyWith(fontSize: 28, color: AppColors.brand),
                      )
                    : null,
              ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 14),
              Text(user?.name ?? 'Your profile', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
              const SizedBox(height: 4),
              Text(user?.email ?? '', style: AppTypography.pageSubtitle),
            ],
          ),
          const SizedBox(height: 28),
          ProfileMenuTile(
            icon: Icons.folder_shared_outlined,
            label: 'Health Records',
            animationIndex: 0,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const ClientProfileScreen()),
            ),
          ),
          ProfileMenuTile(
            icon: Icons.edit_outlined,
            label: 'Edit Profile',
            animationIndex: 1,
            onTap: () => context.push('/profile/edit'),
          ),
          ProfileMenuTile(
            icon: Icons.event_outlined,
            label: 'My Appointments',
            animationIndex: 2,
            onTap: () => context.go('/appointments'),
          ),
          ProfileMenuTile(
            icon: Icons.settings_outlined,
            label: 'Settings & Security',
            animationIndex: 3,
            onTap: () => context.push('/settings'),
          ),
          ProfileMenuTile(
            icon: Icons.support_agent_outlined,
            label: 'Contact Support',
            animationIndex: 4,
            onTap: () => context.push('/contact'),
          ),
          const SizedBox(height: 8),
          ProfileMenuTile(
            icon: Icons.logout_rounded,
            label: 'Logout',
            animationIndex: 5,
            onTap: () => _confirmLogout(context, ref),
            trailing: const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.logout_rounded, color: AppColors.brand, size: 32),
              ),
              const SizedBox(height: 16),
              Text('Sure you want to leave?', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
              const SizedBox(height: 8),
              Text('You will need to sign in again.', style: AppTypography.pageSubtitle, textAlign: TextAlign.center),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: PrimaryGradientButton(
                      label: 'Logout',
                      onPressed: () => Navigator.pop(ctx, true),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    if (leave == true && context.mounted) {
      await ref.read(authRepositoryProvider).signOut();
      if (context.mounted) context.go('/login');
    }
  }
}
