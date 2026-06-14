import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/professional_repository.dart';

/// Book tab for professionals — manage schedule & incoming requests.
class ProfessionalBookScreen extends ConsumerStatefulWidget {
  const ProfessionalBookScreen({super.key});

  @override
  ConsumerState<ProfessionalBookScreen> createState() => _ProfessionalBookScreenState();
}

class _ProfessionalBookScreenState extends ConsumerState<ProfessionalBookScreen> {
  DateTime? _selectedDate;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(colorScheme: const ColorScheme.light(primary: AppColors.brand)),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(professionalDashboardProvider);
    final dateLabel = _selectedDate != null
        ? DateFormat('MMM d, yyyy').format(_selectedDate!)
        : 'Choose date';

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Text('Book', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Text('Manage your schedule and booking requests', style: AppTypography.pageSubtitle),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                _FilterField(
                  hint: 'Search patient or request',
                  icon: Icons.search_rounded,
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _FilterField(
                        hint: dateLabel,
                        icon: Icons.calendar_today_outlined,
                        readOnly: true,
                        onTap: _pickDate,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _FilterField(
                        hint: 'Availability',
                        icon: Icons.schedule_outlined,
                        readOnly: true,
                        onTap: () => context.go('/profile'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) {
                final guests = data.guestAppointments;
                if (guests.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: EmptyState(
                        title: 'No booking requests',
                        subtitle: 'New patient requests appear here. Add availability from your profile.',
                        icon: Icons.inbox_outlined,
                        actionLabel: 'Set availability',
                        onAction: () => context.go('/profile'),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(professionalDashboardProvider),
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                    itemCount: guests.length,
                    itemBuilder: (_, i) {
                      final g = guests[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(AppRadii.xl),
                            border: Border.all(color: AppColors.outline.withValues(alpha: 0.35)),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: CircleAvatar(
                              backgroundColor: AppColors.surfaceContainer,
                              child: Text(g.patientName.isNotEmpty ? g.patientName[0] : 'P'),
                            ),
                            title: Text(g.patientName, style: AppTypography.textTheme.titleMedium),
                            subtitle: Text('${g.appointmentDate} • ${g.appointmentTime}'),
                            trailing: const Icon(Icons.chevron_right_rounded),
                            onTap: () => context.push('/prescription/${g.id}'),
                          ),
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

class _FilterField extends StatelessWidget {
  const _FilterField({
    required this.hint,
    required this.icon,
    this.readOnly = false,
    this.onTap,
  });

  final String hint;
  final IconData icon;
  final bool readOnly;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadii.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadii.lg),
            border: Border.all(color: AppColors.outline.withValues(alpha: 0.5)),
          ),
          child: Row(
            children: [
              Icon(icon, color: AppColors.brand, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(hint, style: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant, fontSize: 13)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
