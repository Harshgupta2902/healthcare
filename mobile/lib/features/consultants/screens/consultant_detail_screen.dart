import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
import '../data/consultants_repository.dart';

class ConsultantDetailScreen extends ConsumerWidget {
  const ConsultantDetailScreen({super.key, required this.userId});

  final String userId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(consultantDetailProvider(userId));
    final availability = ref.watch(consultantAvailabilityProvider(userId));

    return Scaffold(
      appBar: AppBar(title: const Text('Consultant')),
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (p) {
          if (p == null) {
            return const Center(child: Text('Consultant not found'));
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              GlassCard(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.surfaceContainer,
                      backgroundImage: p.image != null
                          ? CachedNetworkImageProvider(p.image!)
                          : null,
                      child: p.image == null
                          ? Text(p.displayName[0], style: AppTypography.pageTitle)
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.displayName, style: AppTypography.pageTitle.copyWith(fontSize: 20)),
                          if (p.specialization != null)
                            Text(p.specialization!, style: AppTypography.pageSubtitle),
                          if (p.isVerified) ...[
                            const SizedBox(height: 6),
                            const VerifiedBadge(),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (p.bio != null) ...[
                Text('ABOUT', style: AppTypography.sectionLabel),
                const SizedBox(height: 8),
                Text(p.bio!, style: AppTypography.body),
                const SizedBox(height: 16),
              ],
              Row(
                children: [
                  _InfoChip(icon: Icons.location_on_outlined, label: p.city ?? '—'),
                  const SizedBox(width: 8),
                  _InfoChip(icon: Icons.payments_outlined, label: p.displayFee),
                  if (p.yearsOfExperience != null) ...[
                    const SizedBox(width: 8),
                    _InfoChip(icon: Icons.work_outline, label: '${p.yearsOfExperience} yrs'),
                  ],
                ],
              ),
              const SizedBox(height: 20),
              Text('AVAILABILITY', style: AppTypography.sectionLabel),
              const SizedBox(height: 8),
              availability.when(
                data: (slots) => slots.isEmpty
                    ? Text('No slots published yet.', style: AppTypography.pageSubtitle)
                    : Column(
                        children: slots
                            .map(
                              (s) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.schedule, color: AppColors.brand),
                                title: Text('Day ${s.dayOfWeek}'),
                                subtitle: Text('${s.startTime} – ${s.endTime}'),
                              ),
                            )
                            .toList(),
                      ),
                loading: () => const LinearProgressIndicator(color: AppColors.brand),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),
              PrimaryGradientButton(
                label: 'Book consultation',
                icon: Icons.calendar_month,
                onPressed: () => context.push('/book/${p.userId}'),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.brand),
          const SizedBox(width: 4),
          Text(label, style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
        ],
      ),
    );
  }
}
