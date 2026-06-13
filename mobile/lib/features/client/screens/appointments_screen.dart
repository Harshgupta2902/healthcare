import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../auth/providers/auth_providers.dart';
import '../../professional/data/professional_repository.dart';
import '../data/client_repository.dart';

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final role = ref.watch(userRoleProvider);

    if (role == UserRole.professional) {
      return _ProfessionalCalendar();
    }

    return _ClientAppointments(selectedTab: _tab, onTabChanged: (i) => setState(() => _tab = i));
  }
}

class _ClientAppointments extends ConsumerWidget {
  const _ClientAppointments({required this.selectedTab, required this.onTabChanged});

  final int selectedTab;
  final ValueChanged<int> onTabChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(clientDashboardProvider);
    final dateFmt = DateFormat('MMM d, y');
    final timeFmt = DateFormat('h:mm a');

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Text('Appointment', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: SegmentedUnderlineTabs(
              tabs: const ['Upcoming', 'Completed', 'Cancelled'],
              selectedIndex: selectedTab,
              onSelected: onTabChanged,
            ),
          ),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                final now = DateTime.now();
                final items = switch (selectedTab) {
                  0 => data.allAppointments.where((a) {
                      final s = a.status.toLowerCase();
                      return a.startTime.isAfter(now) && s != 'cancelled' && s != 'canceled';
                    }).toList(),
                  1 => data.allAppointments.where((a) {
                      final s = a.status.toLowerCase();
                      return a.startTime.isBefore(now) &&
                          s != 'cancelled' &&
                          s != 'canceled';
                    }).toList(),
                  _ => data.allAppointments.where((a) {
                      final s = a.status.toLowerCase();
                      return s == 'cancelled' || s == 'canceled';
                    }).toList(),
                };

                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: EmptyState(
                        title: switch (selectedTab) {
                          0 => 'No upcoming appointments',
                          1 => 'No completed visits',
                          _ => 'No cancelled appointments',
                        },
                        subtitle: 'Book a consultation from the home screen.',
                        icon: Icons.event_busy_outlined,
                        actionLabel: 'Find a doctor',
                        onAction: () => context.go('/consultants'),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(clientDashboardProvider),
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final a = items[i];
                      final isUpcoming = selectedTab == 0;
                      final isCancelled = selectedTab == 2;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: AppointmentListCard(
                          doctorName: a.professionalName ?? 'Consultation',
                          specialty: a.appointmentType ?? 'Video consultation',
                          dateLabel: dateFmt.format(a.startTime),
                          timeLabel: timeFmt.format(a.startTime),
                          animationIndex: i,
                          primaryLabel: isUpcoming ? 'Change Schedule' : 'Re-Book',
                          secondaryLabel: isCancelled ? 'Delete' : 'Cancel',
                          onPrimary: isCancelled
                              ? null
                              : () => context.go('/consultants'),
                          onSecondary: isCancelled
                              ? null
                              : () async {
                                  await ref.read(clientRepositoryProvider).updateAppointmentStatus(
                                        a.id,
                                        'cancelled',
                                      );
                                  ref.invalidate(clientDashboardProvider);
                                },
                        ),
                      );
                    },
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

class _ProfessionalCalendar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(professionalDashboardProvider);
    final dateFmt = DateFormat('MMM d, y');
    final timeFmt = DateFormat('h:mm a');

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Text('Calendar', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
          ),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                final items = data.appointments;
                if (items.isEmpty) {
                  return const Center(
                    child: EmptyState(
                      title: 'No appointments scheduled',
                      subtitle: 'Confirmed visits appear on your calendar.',
                      icon: Icons.calendar_month_outlined,
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(professionalDashboardProvider),
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final a = items[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: AppointmentListCard(
                          doctorName: a.clientName ?? 'Client',
                          specialty: a.status,
                          dateLabel: dateFmt.format(a.startTime),
                          timeLabel: timeFmt.format(a.startTime),
                          animationIndex: i,
                        ),
                      );
                    },
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
