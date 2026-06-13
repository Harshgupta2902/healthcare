import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';
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
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                SectionHeader(
                  title: user?.name ?? 'Professional',
                  subtitle: data.profile.specialization ?? 'Consultations overview',
                ),
                Row(
                  children: [
                    Expanded(
                      child: _Stat(
                        label: 'Appointments',
                        value: '${data.appointments.length}',
                        icon: Icons.event_rounded,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _Stat(
                        label: 'Guest requests',
                        value: '${data.guestAppointments.length}',
                        icon: Icons.person_add_alt_1_outlined,
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
                          title: Text(a.clientName ?? 'Client', style: AppTypography.bodyMedium),
                          subtitle: Text(dateFmt.format(a.startTime)),
                          trailing: Text(a.status.toUpperCase(), style: AppTypography.fieldLabel.copyWith(fontSize: 9)),
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

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Row(
        children: [
          Icon(icon, color: AppColors.brand),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: AppTypography.fieldLabel.copyWith(fontSize: 9)),
              Text(value, style: AppTypography.statValue.copyWith(fontSize: 20)),
            ],
          ),
        ],
      ),
    );
  }
}
