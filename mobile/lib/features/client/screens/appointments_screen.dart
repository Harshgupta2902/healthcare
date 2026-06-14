import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/client_repository.dart';

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _ClientAppointments(
      query: _query,
      searchController: _searchController,
      onQueryChanged: (q) => setState(() => _query = q),
    );
  }
}

class _ClientAppointments extends ConsumerWidget {
  const _ClientAppointments({
    required this.query,
    required this.searchController,
    required this.onQueryChanged,
  });

  final String query;
  final TextEditingController searchController;
  final ValueChanged<String> onQueryChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(clientDashboardProvider);
    final dateFmt = DateFormat('d MMM, yyyy');
    final timeFmt = DateFormat('hh:mm a');

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Text('History', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadii.lg),
                border: Border.all(color: AppColors.outline.withValues(alpha: 0.4)),
              ),
              child: TextField(
                controller: searchController,
                onChanged: onQueryChanged,
                decoration: InputDecoration(
                  hintText: 'Search appointment',
                  hintStyle: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant, fontSize: 14),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.brand),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.tune_rounded, color: AppColors.onSurfaceVariant),
                    onPressed: () {},
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                final now = DateTime.now();
                var items = data.allAppointments.toList()
                  ..sort((a, b) => b.startTime.compareTo(a.startTime));

                if (query.isNotEmpty) {
                  final q = query.toLowerCase();
                  items = items.where((a) {
                    final hay = '${a.professionalName} ${a.appointmentType} ${a.status}'.toLowerCase();
                    return hay.contains(q);
                  }).toList();
                }

                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: EmptyState(
                        title: 'No appointments found',
                        subtitle: 'Book a consultation with a healthcare professional.',
                        icon: Icons.event_busy_outlined,
                        actionLabel: 'Find a doctor',
                        onAction: () => context.go('/search'),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(clientDashboardProvider),
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final a = items[i];
                      final status = _resolveStatus(a, now);
                      final isUpcoming = status == _AppointmentStatus.upcoming;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _AppointmentStatusCard(
                          doctorName: a.professionalName ?? 'Consultation',
                          specialty: a.appointmentType ?? 'Video consultation',
                          dateLabel: dateFmt.format(a.startTime),
                          timeLabel: timeFmt.format(a.startTime),
                          status: status,
                          animationIndex: i,
                          onMessage: () => context.push('/contact'),
                          onCall: () {},
                          onRebook: isUpcoming ? null : () => context.go('/search'),
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

  _AppointmentStatus _resolveStatus(AppointmentItem a, DateTime now) {
    final s = a.status.toLowerCase();
    if (s == 'cancelled' || s == 'canceled') return _AppointmentStatus.cancelled;
    if (s == 'pending' || s == 'submitted') return _AppointmentStatus.pending;
    if (a.startTime.isAfter(now)) return _AppointmentStatus.upcoming;
    return _AppointmentStatus.completed;
  }
}

enum _AppointmentStatus { upcoming, pending, completed, cancelled }

class _AppointmentStatusCard extends StatelessWidget {
  const _AppointmentStatusCard({
    required this.doctorName,
    required this.specialty,
    required this.dateLabel,
    required this.timeLabel,
    required this.status,
    this.animationIndex = 0,
    this.onMessage,
    this.onCall,
    this.onRebook,
  });

  final String doctorName;
  final String specialty;
  final String dateLabel;
  final String timeLabel;
  final _AppointmentStatus status;
  final int animationIndex;
  final VoidCallback? onMessage;
  final VoidCallback? onCall;
  final VoidCallback? onRebook;

  (String, Color, Color) get _statusStyle => switch (status) {
        _AppointmentStatus.upcoming => ('Upcoming', const Color(0xFFE8F5E9), const Color(0xFF2E7D32)),
        _AppointmentStatus.pending => ('Pending Confirmation', const Color(0xFFFFF3E0), const Color(0xFFE65100)),
        _AppointmentStatus.completed => ('Completed', const Color(0xFFF5F5F5), AppColors.onSurfaceVariant),
        _AppointmentStatus.cancelled => ('Cancelled', const Color(0xFFFFEBEE), Colors.red),
      };

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = _statusStyle;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.outline.withValues(alpha: 0.35)),
        boxShadow: AppColors.softElevation,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
            child: Text(
              label,
              style: AppTypography.fieldLabel.copyWith(fontSize: 11, color: fg, fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: AppColors.surfaceContainer,
                child: Text(doctorName.isNotEmpty ? doctorName[0] : 'D'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(doctorName, style: AppTypography.textTheme.titleMedium),
                    Text(specialty, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
                  ],
                ),
              ),
              Icon(
                specialty.toLowerCase().contains('video') ? Icons.videocam_outlined : Icons.location_on_outlined,
                color: AppColors.brand,
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '$dateLabel • $timeLabel',
            style: AppTypography.bodyMedium.copyWith(fontSize: 13, color: AppColors.onSurfaceVariant),
          ),
          if (status == _AppointmentStatus.upcoming || status == _AppointmentStatus.pending) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onMessage,
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadii.pill)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Message', style: TextStyle(fontSize: 13)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCall,
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadii.pill)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Call doctor', style: TextStyle(fontSize: 13)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

