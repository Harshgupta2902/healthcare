import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/professional_repository.dart';
import 'professional_profile_screen.dart';

/// Professional profile tab — practice summary + credentials.
class ProfessionalDashboardProfileScreen extends ConsumerWidget {
  const ProfessionalDashboardProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(professionalDashboardProvider);

    return SafeArea(
      bottom: false,
      child: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          final p = data.profile;
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(professionalDashboardProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
              children: [
                Text('Profile', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
                const SizedBox(height: 4),
                Text('Healthcare provider account', style: AppTypography.pageSubtitle),
                const SizedBox(height: 20),
                GlassCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 48,
                        backgroundColor: AppColors.surfaceContainer,
                        backgroundImage:
                            user?.image != null ? CachedNetworkImageProvider(user!.image!) : null,
                        child: user?.image == null
                            ? Text(
                                (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                                style: AppTypography.pageTitle.copyWith(fontSize: 28, color: AppColors.brand),
                              )
                            : null,
                      ),
                      const SizedBox(height: 12),
                      Text(p.displayName, style: AppTypography.textTheme.titleLarge),
                      Text(user?.email ?? '', style: AppTypography.pageSubtitle),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: p.isVerified
                              ? AppColors.brand.withValues(alpha: 0.12)
                              : AppColors.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(AppRadii.pill),
                        ),
                        child: Text(
                          p.isVerified ? 'Verified professional' : 'Pending verification',
                          style: AppTypography.fieldLabel.copyWith(color: AppColors.brand, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                GlassCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Practice details', style: AppTypography.textTheme.titleMedium),
                      const SizedBox(height: 16),
                      _SummaryRow(label: 'Specialization', value: p.specialization ?? '—'),
                      _SummaryRow(label: 'License', value: p.licenseNumber ?? '—'),
                      _SummaryRow(
                        label: 'Experience',
                        value: p.yearsOfExperience != null ? '${p.yearsOfExperience} years' : '—',
                      ),
                      _SummaryRow(label: 'Consultation fee', value: p.displayFee),
                      _SummaryRow(label: 'City', value: p.city ?? '—'),
                      const SizedBox(height: 16),
                      PrimaryGradientButton(
                        label: 'Settings',
                        icon: Icons.settings_outlined,
                        onPressed: () => context.push('/settings'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Text('CREDENTIALS', style: AppTypography.sectionLabel),
                const SizedBox(height: 10),
                ProfessionalCredentialsPanel(qualifications: data.qualifications),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
