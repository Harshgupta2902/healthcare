import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/saved_doctors_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../consultants/data/consultants_repository.dart';
import '../data/client_repository.dart';

final savedDoctorIdsProvider = FutureProvider<Set<String>>((ref) async {
  return ref.read(savedDoctorsServiceProvider).getSavedIds();
});

class MyDoctorScreen extends ConsumerStatefulWidget {
  const MyDoctorScreen({super.key});

  @override
  ConsumerState<MyDoctorScreen> createState() => _MyDoctorScreenState();
}

class _MyDoctorScreenState extends ConsumerState<MyDoctorScreen> {
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
            child: _tab == 0 ? const _BookedDoctorsTab() : const _SavedDoctorsTab(),
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
                        ? [
                            BoxShadow(
                              color: AppColors.onSurface.withValues(alpha: 0.08),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
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

class _BookedDoctorsTab extends ConsumerWidget {
  const _BookedDoctorsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(clientDashboardProvider);
    final consultants = ref.watch(consultantsListProvider);

    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
      error: (e, _) => Center(child: Text(e.toString())),
      data: (data) {
        final bookedMap = <String, _BookedDoctorInfo>{};
        for (final apt in data.allAppointments) {
          final id = apt.professionalId;
          if (id == null) continue;
          final existing = bookedMap[id];
          bookedMap[id] = _BookedDoctorInfo(
            userId: id,
            name: apt.professionalName ?? 'Doctor',
            specialty: apt.appointmentType ?? 'Healthcare professional',
            appointmentCount: (existing?.appointmentCount ?? 0) + 1,
          );
        }

        final booked = bookedMap.values.toList();

        if (booked.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: EmptyState(
                title: 'No booked doctors yet',
                subtitle: 'Doctors you book appointments with appear here.',
                icon: Icons.medical_services_outlined,
                actionLabel: 'Find a doctor',
                onAction: () => context.go('/book'),
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(clientDashboardProvider);
            ref.invalidate(consultantsListProvider);
          },
          color: AppColors.brand,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
            itemCount: booked.length,
            itemBuilder: (_, i) {
              final doc = booked[i];
              final profile = consultants.maybeWhen(
                data: (list) => list.cast<ProfessionalProfile?>().firstWhere(
                      (p) => p?.id == doc.userId,
                      orElse: () => null,
                    ),
                orElse: () => null,
              );

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _MyDoctorCard(
                  name: doc.name,
                  specialty: profile?.specialization ?? doc.specialty,
                  imageUrl: profile?.image,
                  rating: _displayRating(profile?.yearsOfExperience),
                  appointmentCount: doc.appointmentCount,
                  primaryLabel: 'Book again',
                  onPrimary: () => context.push('/consultants/${doc.userId}'),
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

class _SavedDoctorsTab extends ConsumerWidget {
  const _SavedDoctorsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedIds = ref.watch(savedDoctorIdsProvider);
    final consultants = ref.watch(consultantsListProvider);

    return savedIds.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
      error: (e, _) => Center(child: Text(e.toString())),
      data: (ids) {
        return consultants.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (list) {
            final saved = list.where((p) => ids.contains(p.id)).toList();

            if (saved.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: EmptyState(
                    title: 'No saved doctors',
                    subtitle: 'Tap the heart on a doctor profile to save them here.',
                    icon: Icons.favorite_border,
                    actionLabel: 'Browse doctors',
                    onAction: () => context.go('/book'),
                  ),
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(savedDoctorIdsProvider);
                ref.invalidate(consultantsListProvider);
              },
              color: AppColors.brand,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 110),
                itemCount: saved.length,
                itemBuilder: (_, i) {
                  final p = saved[i];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _MyDoctorCard(
                      name: p.displayName,
                      specialty: p.specialization ?? 'Healthcare professional',
                      imageUrl: p.image,
                      rating: _displayRating(p.yearsOfExperience),
                      isSaved: true,
                      primaryLabel: 'Book now',
                      onPrimary: () => context.push('/consultants/${p.id}'),
                      onUnsave: () async {
                        await ref.read(savedDoctorsServiceProvider).remove(p.id);
                        ref.invalidate(savedDoctorIdsProvider);
                      },
                      animationIndex: i,
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }
}

double _displayRating(int? years) {
  if (years == null) return 4.5;
  return (4.2 + (years % 8) * 0.1).clamp(4.0, 4.95);
}

class _BookedDoctorInfo {
  const _BookedDoctorInfo({
    required this.userId,
    required this.name,
    required this.specialty,
    required this.appointmentCount,
  });

  final String userId;
  final String name;
  final String specialty;
  final int appointmentCount;
}

class _MyDoctorCard extends StatelessWidget {
  const _MyDoctorCard({
    required this.name,
    required this.specialty,
    required this.rating,
    required this.primaryLabel,
    required this.onPrimary,
    this.imageUrl,
    this.appointmentCount,
    this.isSaved = false,
    this.onUnsave,
    this.animationIndex = 0,
  });

  final String name;
  final String specialty;
  final double rating;
  final String? imageUrl;
  final int? appointmentCount;
  final bool isSaved;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final VoidCallback? onUnsave;
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                      Text(
                        rating.toStringAsFixed(2),
                        style: AppTypography.bodyMedium.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (isSaved)
                  IconButton(
                    onPressed: onUnsave,
                    icon: const Icon(Icons.favorite, color: Colors.red, size: 22),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          CircleAvatar(
            radius: 48,
            backgroundColor: AppColors.surfaceContainer,
            backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
            child: imageUrl == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'D',
                    style: AppTypography.pageTitle.copyWith(fontSize: 28, color: AppColors.brand),
                  )
                : null,
          ),
          const SizedBox(height: 12),
          Text(name, style: AppTypography.textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(specialty, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          if (appointmentCount != null) ...[
            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Material(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: () => context.go('/appointments'),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 18, color: AppColors.brand),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            '$appointmentCount total appointments made',
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
            child: Row(
              children: [
                if (!isSaved)
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.outline.withValues(alpha: 0.5)),
                    ),
                    child: IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.share_outlined, size: 20),
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                if (!isSaved) const SizedBox(width: 10),
                Expanded(
                  child: PrimaryGradientButton(
                    label: primaryLabel,
                    onPressed: onPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate(delay: (70 * animationIndex).ms)
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.04, end: 0);
  }
}
