import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/behance_ui.dart';
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
      backgroundColor: AppColors.surface,
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Doctor Details'),
      ),
      body: AmbientBackground(
        child: profile.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (p) {
            if (p == null) {
              return const Center(child: Text('Consultant not found'));
            }

            return Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(p.displayName, style: AppTypography.pageTitle.copyWith(fontSize: 22)),
                                if (p.specialization != null) ...[
                                  const SizedBox(height: 4),
                                  Text(p.specialization!, style: AppTypography.pageSubtitle),
                                ],
                                if (p.isVerified) ...[
                                  const SizedBox(height: 8),
                                  const VerifiedBadge(),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          CircleAvatar(
                            radius: 52,
                            backgroundColor: AppColors.surfaceContainer,
                            backgroundImage: p.image != null ? CachedNetworkImageProvider(p.image!) : null,
                            child: p.image == null
                                ? Text(p.displayName[0], style: AppTypography.pageTitle.copyWith(fontSize: 28))
                                : null,
                          ).animate().fadeIn(duration: 450.ms).scale(),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          StatHighlightCard(
                            value: p.yearsOfExperience != null ? '${p.yearsOfExperience}' : '—',
                            label: 'YRS\nExperience',
                          ),
                          const SizedBox(width: 10),
                          const StatHighlightCard(value: '4.5', label: 'Rating'),
                          const SizedBox(width: 10),
                          const StatHighlightCard(value: '—', label: 'Patients'),
                        ],
                      ),
                      const SizedBox(height: 20),
                      if (p.bio != null) ...[
                        Text('About', style: AppTypography.textTheme.titleMedium),
                        const SizedBox(height: 8),
                        Text(p.bio!, style: AppTypography.body),
                        const SizedBox(height: 20),
                      ],
                      Text('Working Time', style: AppTypography.textTheme.titleMedium),
                      const SizedBox(height: 10),
                      GlassCard(
                        elevated: false,
                        padding: EdgeInsets.zero,
                        child: availability.when(
                          data: (slots) => slots.isEmpty
                              ? Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Text('No slots published yet.', style: AppTypography.pageSubtitle),
                                )
                              : Column(
                                  children: slots.map((s) {
                                    return ListTile(
                                      title: Text('Day ${s.dayOfWeek}', style: AppTypography.bodyMedium),
                                      trailing: Text(
                                        '${s.startTime} – ${s.endTime}',
                                        style: AppTypography.pageSubtitle.copyWith(fontSize: 13),
                                      ),
                                    );
                                  }).toList(),
                                ),
                          loading: () => const LinearProgressIndicator(color: AppColors.brand),
                          error: (_, __) => const SizedBox.shrink(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: [
                          if (p.city != null)
                            Chip(
                              label: Text(p.city!),
                              avatar: const Icon(Icons.location_on_outlined, size: 16),
                            ),
                          Chip(
                            label: Text(p.displayFee),
                            avatar: const Icon(Icons.payments_outlined, size: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: profile.maybeWhen(
        data: (p) => p == null
            ? null
            : SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: PrimaryGradientButton(
                    label: 'Book Appointment',
                    icon: Icons.calendar_month,
                    onPressed: () => context.push('/book/${p.userId}'),
                  ),
                ),
              ),
        orElse: () => null,
      ),
    );
  }
}
