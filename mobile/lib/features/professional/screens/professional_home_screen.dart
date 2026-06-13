import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/professional_repository.dart';

class ProfessionalHomeScreen extends ConsumerWidget {
  const ProfessionalHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(professionalDashboardProvider);
    final dateFmt = DateFormat('MMM d • h:mm a');

    return SafeArea(
      bottom: false,
      child: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Padding(
          padding: const EdgeInsets.all(24),
          child: Text(e.toString()),
        ),
        data: (data) {
          final now = DateTime.now();
          final upcoming = data.appointments
              .where((a) => a.startTime.isAfter(now))
              .take(5)
              .toList();
          final pendingGuests = data.guestAppointments.take(5).toList();

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(professionalDashboardProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
              children: [
                HomeGreetingHeader(
                  name: user?.name?.split(' ').first ?? 'Doctor',
                  imageUrl: user?.image,
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: StatHighlightCard(
                        value: '${data.appointments.length}',
                        label: 'Appointments',
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: StatHighlightCard(
                        value: '${data.guestAppointments.length}',
                        label: 'Guest\nrequests',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text('UPCOMING CONSULTS', style: AppTypography.sectionLabel),
                const SizedBox(height: 12),
                if (upcoming.isEmpty)
                  const EmptyState(
                    title: 'No upcoming appointments',
                    subtitle: 'Client bookings will appear here.',
                    icon: Icons.event_busy_outlined,
                  )
                else
                  ...upcoming.map(
                    (a) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              gradient: AppColors.brandGradient,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.person_outline, color: Colors.white, size: 20),
                          ),
                          title: Text(a.clientName ?? 'Client', style: AppTypography.bodyMedium),
                          subtitle: Text(dateFmt.format(a.startTime)),
                          trailing: Text(
                            a.status.toUpperCase(),
                            style: AppTypography.fieldLabel.copyWith(fontSize: 9, color: AppColors.brand),
                          ),
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 20),
                Text('GUEST BOOKINGS', style: AppTypography.sectionLabel),
                const SizedBox(height: 12),
                if (pendingGuests.isEmpty)
                  const EmptyState(
                    title: 'No guest bookings',
                    subtitle: 'Patients can book via your public profile.',
                    icon: Icons.inbox_outlined,
                  )
                else
                  ...pendingGuests.map(
                    (g) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        onTap: () => context.push('/prescription/${g.id}'),
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainer,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.inbox_outlined, color: AppColors.brand, size: 20),
                          ),
                          title: Text(g.patientName, style: AppTypography.bodyMedium),
                          subtitle: Text('${g.appointmentDate} • ${g.appointmentTime}'),
                          trailing: g.prescriptionHtml != null
                              ? const Icon(Icons.check_circle, color: AppColors.brand, size: 18)
                              : const Icon(Icons.edit_note_outlined, size: 18),
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
