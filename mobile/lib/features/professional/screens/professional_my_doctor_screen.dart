import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/professional_repository.dart';

/// My doctor tab for professionals — Booked patients & Saved requests.
class ProfessionalMyDoctorScreen extends ConsumerStatefulWidget {
  const ProfessionalMyDoctorScreen({super.key});

  @override
  ConsumerState<ProfessionalMyDoctorScreen> createState() => _ProfessionalMyDoctorScreenState();
}

class _ProfessionalMyDoctorScreenState extends ConsumerState<ProfessionalMyDoctorScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Text('My Doctor', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _PillTabBar(
              tabs: const ['Booked', 'Saved'],
              selectedIndex: _tab,
              onSelected: (i) => setState(() => _tab = i),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _tab == 0 ? const _BookedPatientsTab() : const _SavedRequestsTab(),
          ),
        ],
      ),
    );
  }
}

class _PillTabBar extends StatelessWidget {
  const _PillTabBar({
    required this.tabs,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.pill),
      ),
      child: Row(
        children: [
          for (var i = 0; i < tabs.length; i++)
            Expanded(
              child: GestureDetector(
                onTap: () => onSelected(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: i == selectedIndex ? Colors.white : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppRadii.pill),
                    boxShadow: i == selectedIndex
                        ? [BoxShadow(color: AppColors.onSurface.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))]
                        : null,
                  ),
                  child: Text(
                    tabs[i],
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: i == selectedIndex ? FontWeight.w700 : FontWeight.w500,
                      color: i == selectedIndex ? AppColors.onSurface : AppColors.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _BookedPatientsTab extends ConsumerWidget {
  const _BookedPatientsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(professionalDashboardProvider);

    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
      error: (e, _) => Center(child: Text(e.toString())),
      data: (data) {
        final patientMap = <String, _PatientInfo>{};
        for (final apt in data.appointments) {
          final id = apt.clientId ?? apt.clientName ?? apt.id;
          final existing = patientMap[id];
          patientMap[id] = _PatientInfo(
            id: id,
            name: apt.clientName ?? 'Patient',
            specialty: apt.appointmentType ?? 'Consultation',
            visitCount: (existing?.visitCount ?? 0) + 1,
            lastVisit: apt.startTime,
          );
        }

        final patients = patientMap.values.toList()
          ..sort((a, b) => b.lastVisit.compareTo(a.lastVisit));

        if (patients.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: EmptyState(
                title: 'No booked patients yet',
                subtitle: 'Confirmed appointments with patients appear here.',
                icon: Icons.people_outline,
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(professionalDashboardProvider),
          color: AppColors.brand,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
            itemCount: patients.length,
            itemBuilder: (_, i) {
              final p = patients[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _PatientCard(
                  name: p.name,
                  subtitle: p.specialty,
                  visitCount: p.visitCount,
                  onPrimary: () => context.go('/appointments'),
                  animationIndex: i,
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _SavedRequestsTab extends ConsumerWidget {
  const _SavedRequestsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(professionalDashboardProvider);

    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
      error: (e, _) => Center(child: Text(e.toString())),
      data: (data) {
        final pending = data.guestAppointments;

        if (pending.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: EmptyState(
                title: 'No saved requests',
                subtitle: 'Guest booking requests you follow up on appear here.',
                icon: Icons.inbox_outlined,
                actionLabel: 'View requests',
                onAction: () => context.go('/book'),
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(professionalDashboardProvider),
          color: AppColors.brand,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
            itemCount: pending.length,
            itemBuilder: (_, i) {
              final g = pending[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _PatientCard(
                  name: g.patientName,
                  subtitle: '${g.appointmentDate} • ${g.appointmentTime}',
                  isSaved: true,
                  primaryLabel: 'Review',
                  onPrimary: () => context.push('/prescription/${g.id}'),
                  animationIndex: i,
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _PatientInfo {
  const _PatientInfo({
    required this.id,
    required this.name,
    required this.specialty,
    required this.visitCount,
    required this.lastVisit,
  });

  final String id;
  final String name;
  final String specialty;
  final int visitCount;
  final DateTime lastVisit;
}

class _PatientCard extends StatelessWidget {
  const _PatientCard({
    required this.name,
    required this.subtitle,
    required this.onPrimary,
    this.visitCount,
    this.isSaved = false,
    this.primaryLabel = 'View appointments',
    this.animationIndex = 0,
  });

  final String name;
  final String subtitle;
  final int? visitCount;
  final bool isSaved;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.outline.withValues(alpha: 0.4)),
        boxShadow: AppColors.softElevation,
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              children: [
                if (!isSaved)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: Color(0xFFFF9800)),
                        const SizedBox(width: 4),
                        Text('Patient', style: AppTypography.bodyMedium.copyWith(fontSize: 12, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                const Spacer(),
                if (isSaved) const Icon(Icons.favorite, color: Colors.red, size: 22),
              ],
            ),
          ),
          const SizedBox(height: 8),
          CircleAvatar(
            radius: 48,
            backgroundColor: AppColors.surfaceContainer,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : 'P',
              style: AppTypography.pageTitle.copyWith(fontSize: 28, color: AppColors.brand),
            ),
          ),
          const SizedBox(height: 12),
          Text(name, style: AppTypography.textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(subtitle, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          if (visitCount != null) ...[
            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Material(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: onPrimary,
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 18, color: AppColors.brand),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            '$visitCount total appointments made',
                            style: AppTypography.bodyMedium.copyWith(fontSize: 13),
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: AppColors.onSurfaceVariant),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: PrimaryGradientButton(label: primaryLabel, onPressed: onPrimary),
          ),
        ],
      ),
    ).animate(delay: (70 * animationIndex).ms).fadeIn(duration: 400.ms).slideY(begin: 0.04, end: 0);
  }
}
