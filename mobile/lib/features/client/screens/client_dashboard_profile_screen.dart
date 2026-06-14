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
import '../data/client_repository.dart';
import 'client_profile_screen.dart';

/// Patient profile tab — summary + meds, docs, insurance sections.
class ClientDashboardProfileScreen extends ConsumerWidget {
  const ClientDashboardProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);

    return SafeArea(
      bottom: false,
      child: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          final profile = data.medicalProfile;
          return DefaultTabController(
            length: 3,
            child: NestedScrollView(
              headerSliverBuilder: (context, _) => [
                SliverToBoxAdapter(
                  child: RefreshIndicator(
                    onRefresh: () async => ref.invalidate(clientDashboardProvider),
                    color: AppColors.brand,
                    child: ListView(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      children: [
                        Text('Profile', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
                        const SizedBox(height: 4),
                        Text('Patient account', style: AppTypography.pageSubtitle),
                        const SizedBox(height: 20),
                        GlassCard(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 48,
                                backgroundColor: AppColors.surfaceContainer,
                                backgroundImage: user?.image != null
                                    ? CachedNetworkImageProvider(user!.image!)
                                    : null,
                                child: user?.image == null
                                    ? Text(
                                        (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                                        style: AppTypography.pageTitle
                                            .copyWith(fontSize: 28, color: AppColors.brand),
                                      )
                                    : null,
                              ),
                              const SizedBox(height: 12),
                              Text(user?.name ?? 'Patient', style: AppTypography.textTheme.titleLarge),
                              Text(user?.email ?? '', style: AppTypography.pageSubtitle),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerLow,
                                  borderRadius: BorderRadius.circular(AppRadii.pill),
                                ),
                                child: Text(
                                  'Standard Account',
                                  style: AppTypography.fieldLabel
                                      .copyWith(color: AppColors.brand, fontSize: 10),
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
                              Text('Health summary', style: AppTypography.textTheme.titleMedium),
                              const SizedBox(height: 16),
                              _SummaryRow(label: 'Blood type', value: profile?.bloodType ?? 'N/A'),
                              _SummaryRow(label: 'Gender', value: profile?.gender ?? 'N/A'),
                              _SummaryRow(
                                label: 'Weight',
                                value: profile?.weight != null ? '${profile!.weight} kg' : 'N/A',
                              ),
                              _SummaryRow(
                                label: 'Height',
                                value: profile?.height != null ? '${profile!.height} cm' : 'N/A',
                              ),
                              const SizedBox(height: 16),
                              PrimaryGradientButton(
                                label: 'Edit profile',
                                icon: Icons.edit_outlined,
                                onPressed: () => context.push('/profile/edit'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        GlassCard(
                          onTap: () => context.push('/settings'),
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              const Icon(Icons.settings_outlined, color: AppColors.brand),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Text('Settings & security', style: AppTypography.bodyMedium)),
                              const Icon(Icons.chevron_right_rounded, color: AppColors.onSurfaceVariant),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _ProfileTabBarDelegate(
                    TabBar(
                      labelColor: AppColors.brand,
                      unselectedLabelColor: AppColors.onSurfaceVariant,
                      indicatorColor: AppColors.brand,
                      tabs: const [
                        Tab(text: 'MEDS'),
                        Tab(text: 'DOCS'),
                        Tab(text: 'INSURANCE'),
                      ],
                    ),
                  ),
                ),
              ],
              body: TabBarView(
                children: [
                  ClientMedicationsPanel(items: data.medications),
                  ClientDocumentsPanel(documents: data.documents),
                  ClientInsurancePanel(items: data.insurance),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ProfileTabBarDelegate extends SliverPersistentHeaderDelegate {
  _ProfileTabBarDelegate(this.tabBar);

  final TabBar tabBar;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Material(
      color: AppColors.surface,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(covariant _ProfileTabBarDelegate oldDelegate) => false;
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          Text(value, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
