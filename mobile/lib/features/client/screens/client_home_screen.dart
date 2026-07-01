import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/health_categories.dart';
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
  String? _locationLabel(ClientDashboardData data) {
    final profile = data.medicalProfile;
    if (profile == null) return null;
    final city = profile.city?.trim();
    final state = profile.state?.trim();
    if (city != null && city.isNotEmpty && state != null && state.isNotEmpty) {
      return 'Location: $city, $state';
    }
    if (city != null && city.isNotEmpty) return 'Location: $city';
    return null;
  }

  String _consultationLabel(AppointmentItem appointment) {
    final type = appointment.appointmentType?.trim();
    if (type == null || type.isEmpty) return 'Virtual Consultation';
    if (type.toLowerCase().contains('video') ||
        type.toLowerCase().contains('virtual')) {
      return 'Virtual Consultation';
    }
    return type;
  }

  String? _specialtyForAppointment(
    AppointmentItem appointment,
    List<ProfessionalProfile> consultants,
  ) {
    final proId = appointment.professionalId;
    if (proId == null) return null;
    for (final p in consultants) {
      if (p.userId == proId || p.id == proId) {
        return p.specialization;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);
    final consultants = ref.watch(consultantsListProvider);

    final displayName = user?.name?.trim().isNotEmpty == true
        ? user!.name!.trim()
        : 'Guest';

    return SafeArea(
      bottom: false,
      child: dashboard.when(
        loading: () => const LoadingView(message: 'Loading your dashboard…'),
        error: (e, _) => Padding(
          padding: const EdgeInsets.all(24),
          child: ErrorBanner(message: e.toString()),
        ),
        data: (data) {
          final dateFmt = DateFormat('EEE, d MMM y');
          final timeFmt = DateFormat('h:mm a');
          final now = DateTime.now();
          final upcomingCandidates = data.allAppointments
              .where((a) => a.isUpcomingForClientHome(now))
              .toList();
          final upcoming =
              upcomingCandidates.isEmpty ? null : upcomingCandidates.first;
          final hasUpcoming = upcoming != null;

          final consultantList = consultants.maybeWhen(
            data: (list) => list,
            orElse: () => <ProfessionalProfile>[],
          );

          final categoryItems = healthCategories
              .map((c) => (label: c.label, icon: c.icon))
              .toList();

          final doctors = consultantList.take(5).toList();

          String? proImage = upcoming?.professionalImage;
          String? proSpecialty;
          if (upcoming != null) {
            proSpecialty = _specialtyForAppointment(upcoming, consultantList);
            if (proImage == null && upcoming.professionalId != null) {
              for (final p in consultantList) {
                if (p.userId == upcoming.professionalId) {
                  proImage = p.image;
                  proSpecialty ??= p.specialization;
                  break;
                }
              }
            }
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(clientDashboardProvider);
              ref.invalidate(consultantsListProvider);
            },
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
              children: [
                ClientHomeHeader(
                  name: displayName,
                  imageUrl: user?.image,
                  locationLabel: _locationLabel(data),
                ),
                const SizedBox(height: 16),
                PillSearchBar(
                  hint: 'Search doctor, specialty…',
                  readOnly: true,
                  onTap: () => context.go('/search'),
                ),
                const SizedBox(height: 22),
                HealthCategoryRow(
                  categories: categoryItems,
                  onSelected: (category) {
                    context.go(
                      '/search?category=${Uri.encodeQueryComponent(category)}',
                    );
                  },
                ),
                if (hasUpcoming) ...[
                  const SizedBox(height: 24),
                  Text(
                    'Upcoming Appointments',
                    style: AppTypography.textTheme.titleMedium!.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClientUpcomingAppointmentCard(
                    doctorName: upcoming.professionalName ?? 'Consultation',
                    specialty: proSpecialty ?? 'General Physician',
                    consultationLabel: _consultationLabel(upcoming),
                    dateLabel: dateFmt.format(upcoming.startTime),
                    timeLabel:
                        '${timeFmt.format(upcoming.startTime)} - ${timeFmt.format(upcoming.endTime)}',
                    imageUrl: proImage,
                    onTap: () => context.go('/history'),
                  ),
                ],
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Popular Doctors',
                      style: AppTypography.textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.go('/search'),
                      child: Text(
                        'See all',
                        style: AppTypography.bodyMedium
                            .copyWith(color: AppColors.brand),
                      ),
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
                        specialty:
                            p.specialization ?? 'Healthcare professional',
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
