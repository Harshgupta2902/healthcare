import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_providers.dart';
import 'professional_profile_screen.dart';

/// Profile account hub for professionals — same layout as patient profile.
class ProfessionalAccountScreen extends ConsumerWidget {
  const ProfessionalAccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
        children: [
          Text('Profile account', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          const SizedBox(height: 20),
          _ProfileHeroCard(
            name: user?.name ?? 'Your profile',
            email: user?.email ?? '',
            imageUrl: user?.image,
            badge: 'Healthcare professional',
          ),
          const SizedBox(height: 28),
          _SectionHeader(title: 'General'),
          _ProfileListCard(
            items: [
              _ProfileListItem(
                icon: Icons.badge_outlined,
                label: 'Professional information',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const ProfessionalProfileScreen()),
                ),
              ),
              _ProfileListItem(
                icon: Icons.schedule_outlined,
                label: 'Availability',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const ProfessionalProfileScreen()),
                ),
              ),
              _ProfileListItem(
                icon: Icons.settings_outlined,
                label: 'Settings',
                onTap: () => context.push('/settings'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _SectionHeader(title: 'Others'),
          _ProfileListCard(
            items: [
              _ProfileListItem(icon: Icons.help_outline, label: 'Help center', onTap: () => context.push('/contact')),
              _ProfileListItem(icon: Icons.info_outline, label: 'About us', onTap: () {}),
              _ProfileListItem(icon: Icons.description_outlined, label: 'Terms of use', onTap: () {}),
              _ProfileListItem(icon: Icons.privacy_tip_outlined, label: 'Privacy policy', onTap: () {}),
              _ProfileListItem(icon: Icons.feedback_outlined, label: 'Give a feedback', onTap: () => context.push('/contact')),
              _ProfileListItem(
                icon: Icons.logout_rounded,
                label: 'Logout',
                isDestructive: true,
                onTap: () => _confirmLogout(context, ref),
              ),
            ],
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

class _ProfileHeroCard extends StatelessWidget {
  const _ProfileHeroCard({
    required this.name,
    required this.email,
    this.imageUrl,
    this.badge,
  });

  final String name;
  final String email;
  final String? imageUrl;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.brand.withValues(alpha: 0.15),
            AppColors.brandBright.withValues(alpha: 0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.brand.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 52,
            backgroundColor: Colors.white,
            backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
            child: imageUrl == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: AppTypography.pageTitle.copyWith(fontSize: 32, color: AppColors.brand),
                  )
                : null,
          ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
          const SizedBox(height: 14),
          Text(name, style: AppTypography.textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(email, style: AppTypography.pageSubtitle),
          if (badge != null) ...[
            const SizedBox(height: 8),
            Text(
              badge!,
              style: AppTypography.fieldLabel.copyWith(color: AppColors.brand, fontSize: 10),
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 4),
      child: Text(title, style: AppTypography.textTheme.titleSmall),
    );
  }
}

class _ProfileListCard extends StatelessWidget {
  const _ProfileListCard({required this.items});
  final List<_ProfileListItem> items;

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
              Divider(height: 1, indent: 56, color: AppColors.outline.withValues(alpha: 0.35)),
          ],
        ],
      ),
    );
  }
}

class _ProfileListItem extends StatelessWidget {
  const _ProfileListItem({
    required this.icon,
    required this.label,
    this.onTap,
    this.isDestructive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? Colors.red : AppColors.onSurface;

    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: isDestructive ? Colors.red : AppColors.brand, size: 22),
      title: Text(label, style: AppTypography.bodyMedium.copyWith(color: color, fontWeight: FontWeight.w500)),
      trailing: isDestructive
          ? null
          : const Icon(Icons.chevron_right_rounded, color: AppColors.onSurfaceVariant, size: 22),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
    );
  }
}
