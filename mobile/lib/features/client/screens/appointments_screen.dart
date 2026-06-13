import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';
import '../../professional/data/professional_repository.dart';
import '../data/client_repository.dart';

class AppointmentsScreen extends ConsumerWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final dateFmt = DateFormat('EEEE, MMM d • h:mm a');

    if (role == UserRole.professional) {
      final dashboard = ref.watch(professionalDashboardProvider);
      return SafeArea(
        child: dashboard.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (data) {
            final items = data.appointments;
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(professionalDashboardProvider),
              color: AppColors.brand,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  const SectionHeader(
                    title: 'Calendar',
                    subtitle: 'Client appointments and guest bookings',
                  ),
                  if (items.isEmpty)
                    const EmptyState(
                      title: 'No appointments scheduled',
                      subtitle: 'Confirmed visits appear on your calendar.',
                      icon: Icons.calendar_month_outlined,
                    )
                  else
                    ...items.map(
                      (a) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: GlassCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                a.clientName ?? 'Client',
                                style: AppTypography.textTheme.titleMedium,
                              ),
                              const SizedBox(height: 6),
                              Text(dateFmt.format(a.startTime), style: AppTypography.pageSubtitle),
                              const SizedBox(height: 8),
                              Text(
                                a.status.toUpperCase(),
                                style: AppTypography.sectionLabel.copyWith(fontSize: 10),
                              ),
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

    final dashboard = ref.watch(clientDashboardProvider);
    return SafeArea(
      child: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(clientDashboardProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const SectionHeader(
                  title: 'Appointments',
                  subtitle: 'Your scheduled consultations',
                ),
                if (data.upcomingAppointments.isEmpty)
                  const EmptyState(
                    title: 'No appointments scheduled',
                    subtitle: 'When you book a visit it will appear here.',
                    icon: Icons.event_outlined,
                  )
                else
                  ...data.upcomingAppointments.map(
                    (a) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              a.professionalName ?? a.clientName ?? 'Consultation',
                              style: AppTypography.textTheme.titleMedium,
                            ),
                            const SizedBox(height: 6),
                            Text(dateFmt.format(a.startTime), style: AppTypography.pageSubtitle),
                            const SizedBox(height: 8),
                            Text(
                              a.status.toUpperCase(),
                              style: AppTypography.sectionLabel.copyWith(fontSize: 10),
                            ),
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
