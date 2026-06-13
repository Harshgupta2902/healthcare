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
import '../../consultants/data/consultants_repository.dart';
import '../data/client_repository.dart';

class ClientHomeScreen extends ConsumerStatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  ConsumerState<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends ConsumerState<ClientHomeScreen> {
  String? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);
    final consultants = ref.watch(consultantsListProvider);

    final firstName = user?.name?.split(' ').first ?? 'there';

    return SafeArea(
      bottom: false,
      child: dashboard.when(
        loading: () => const LoadingView(message: 'Loading your dashboard…'),
        error: (e, _) => Padding(
          padding: const EdgeInsets.all(24),
          child: ErrorBanner(message: e.toString()),
        ),
        data: (data) {
          final dateFmt = DateFormat('MMM d, y');
          final timeFmt = DateFormat('h:mm a');
          final upcoming = data.upcomingAppointments.isNotEmpty ? data.upcomingAppointments.first : null;

          final categories = consultants.maybeWhen(
            data: (list) {
              final specs = list
                  .map((p) => p.specialization)
                  .whereType<String>()
                  .where((s) => s.trim().isNotEmpty)
                  .toSet()
                  .take(6)
                  .toList();
              return specs;
            },
            orElse: () => <ProfessionalProfile>[],
          );

          final doctors = consultants.maybeWhen(
            data: (list) {
              var filtered = list;
              if (_selectedCategory != null) {
                filtered = list
                    .where((p) => p.specialization?.toLowerCase() == _selectedCategory!.toLowerCase())
                    .toList();
              }
              return filtered.take(5).toList();
            },
            orElse: () => <ProfessionalProfile>[],
          );

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(clientDashboardProvider);
              ref.invalidate(consultantsListProvider);
            },
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
              children: [
                HomeGreetingHeader(
                  name: firstName,
                  imageUrl: user?.image,
                ),
                const SizedBox(height: 18),
                PillSearchBar(
                  hint: 'Search doctor, specialty…',
                  readOnly: true,
                  onTap: () => context.go('/consultants'),
                ),
                const SizedBox(height: 20),
                if (upcoming != null)
                  UpcomingVisitHeroCard(
                    doctorName: upcoming.professionalName ?? 'Consultation',
                    specialty: upcoming.appointmentType ?? 'Video consultation',
                    dateLabel: dateFmt.format(upcoming.startTime),
                    timeLabel: timeFmt.format(upcoming.startTime),
                    onTap: () => context.go('/appointments'),
                  )
                else
                  UpcomingVisitHeroCard(
                    doctorName: 'Book your first visit',
                    specialty: 'Find a verified specialist',
                    dateLabel: '—',
                    timeLabel: '—',
                    onTap: () => context.go('/consultants'),
                  ),
                if (categories.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Categories', style: AppTypography.textTheme.titleMedium),
                      TextButton(
                        onPressed: () => context.go('/consultants'),
                        child: Text('See all', style: AppTypography.bodyMedium.copyWith(color: AppColors.brand)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SpecialtyCategoryRow(
                    categories: categories,
                    selected: _selectedCategory,
                    onSelected: (c) => setState(() => _selectedCategory = _selectedCategory == c ? null : c),
                  ),
                ],
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Popular Doctors', style: AppTypography.textTheme.titleMedium),
                    TextButton(
                      onPressed: () => context.go('/consultants'),
                      child: Text('See all', style: AppTypography.bodyMedium.copyWith(color: AppColors.brand)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (doctors.isEmpty)
                  const EmptyState(
                    title: 'No doctors yet',
                    subtitle: 'Browse verified professionals to book a visit.',
                    icon: Icons.person_search_outlined,
                  )
                else
                  ...doctors.asMap().entries.map((e) {
                    final p = e.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: DoctorListCard(
                        name: p.displayName,
                        specialty: p.specialization ?? 'Healthcare professional',
                        fee: '${p.displayFee} / Consultation',
                        imageUrl: p.image,
                        isVerified: p.isVerified,
                        animationIndex: e.key,
                        onTap: () => context.push('/consultants/${p.id}'),
                      ),
                    );
                  }),
              ],
            ),
          );
        },
      ),
    );
  }
}
