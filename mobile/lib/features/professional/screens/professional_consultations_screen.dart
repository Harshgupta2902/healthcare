import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../data/professional_repository.dart';

/// Professional consultation requests tab — mirrors web Requests tab.
class ProfessionalConsultationsScreen extends ConsumerWidget {
  const ProfessionalConsultationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(professionalDashboardProvider);
    final dateFmt = DateFormat('MMM d • h:mm a');

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Text('Consultation requests', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
          ),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                final now = DateTime.now();
                final upcoming = data.appointments.where((a) => a.startTime.isAfter(now)).toList();
                final guests = data.guestAppointments;

                if (upcoming.isEmpty && guests.isEmpty) {
                  return const Center(
                    child: EmptyState(
                      title: 'No consultation requests',
                      subtitle: 'Patient bookings and guest requests appear here.',
                      icon: Icons.inbox_outlined,
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(professionalDashboardProvider),
                  color: AppColors.brand,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                    children: [
                      if (guests.isNotEmpty) ...[
                        Text('GUEST BOOKINGS', style: AppTypography.sectionLabel),
                        const SizedBox(height: 10),
                        ...guests.map(
                          (g) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: GlassCard(
                              onTap: () => context.push('/prescription/${g.id}'),
                              child: ListTile(
                                title: Text(g.patientName, style: AppTypography.bodyMedium),
                                subtitle: Text('${g.appointmentDate} • ${g.appointmentTime}'),
                                trailing: const Icon(Icons.chevron_right_rounded),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      if (upcoming.isNotEmpty) ...[
                        Text('UPCOMING APPOINTMENTS', style: AppTypography.sectionLabel),
                        const SizedBox(height: 10),
                        ...upcoming.map(
                          (a) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: GlassCard(
                              child: ListTile(
                                title: Text(a.clientName ?? 'Client', style: AppTypography.bodyMedium),
                                subtitle: Text(dateFmt.format(a.startTime)),
                                trailing: Text(
                                  a.status.toUpperCase(),
                                  style: AppTypography.fieldLabel.copyWith(
                                    fontSize: 9,
                                    color: AppColors.brand,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
