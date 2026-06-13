import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/client_repository.dart';

class ClientHomeScreen extends ConsumerWidget {
  const ClientHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);

    return SafeArea(
      child: dashboard.when(
        loading: () => const LoadingView(message: 'Loading your dashboard…'),
        error: (e, _) => Padding(
          padding: const EdgeInsets.all(24),
          child: ErrorBanner(message: e.toString()),
        ),
        data: (data) {
          final dateFmt = DateFormat('MMM d, y • h:mm a');
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(clientDashboardProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                SectionHeader(
                  title: 'Hello, ${user?.fullName?.split(' ').first ?? 'there'}',
                  subtitle: 'Your health overview',
                ),
                Row(
                  children: [
                    Expanded(
                      child: StatTile(
                        label: 'Appointments',
                        value: '${data.appointmentsCount}',
                        icon: Icons.event_rounded,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: StatTile(
                        label: 'Conditions',
                        value: '${data.conditionsCount}',
                        icon: Icons.favorite_border_rounded,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: StatTile(
                        label: 'Medications',
                        value: '${data.medicationsCount}',
                        icon: Icons.medication_outlined,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(child: SizedBox()),
                  ],
                ),
                const SizedBox(height: 24),
                Text('UPCOMING VISITS', style: AppTypography.sectionLabel),
                const SizedBox(height: 12),
                if (data.upcomingAppointments.isEmpty)
                  const EmptyState(
                    title: 'No upcoming appointments',
                    subtitle: 'Book a consultation with a verified professional.',
                    icon: Icons.event_busy_outlined,
                  )
                else
                  ...data.upcomingAppointments.map(
                    (a) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceContainer,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.video_call_rounded, color: AppColors.brand),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    a.professionalName ?? 'Consultation',
                                    style: AppTypography.textTheme.titleMedium,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(dateFmt.format(a.scheduledAt),
                                      style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
                                ],
                              ),
                            ),
                            _StatusChip(status: a.status),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.toUpperCase(),
        style: AppTypography.fieldLabel.copyWith(fontSize: 9),
      ),
    );
  }
}
