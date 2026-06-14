import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../consultants/data/consultants_repository.dart';

/// Book tab — search and browse doctors to schedule appointments.
class BookScreen extends ConsumerStatefulWidget {
  const BookScreen({super.key});

  @override
  ConsumerState<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends ConsumerState<BookScreen> {
  final _searchController = TextEditingController();
  final _locationController = TextEditingController();
  String _query = '';
  DateTime? _selectedDate;

  @override
  void dispose() {
    _searchController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.brand),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final consultants = ref.watch(consultantsListProvider);
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
            child: Text('Find Results', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Text(
              'Search doctors and book appointments',
              style: AppTypography.pageSubtitle,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                _FilterField(
                  controller: _searchController,
                  hint: 'Search doctor, medicine',
                  icon: Icons.search_rounded,
                  onChanged: (v) => setState(() => _query = v.toLowerCase()),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _FilterField(
                        controller: _locationController,
                        hint: 'Select location',
                        icon: Icons.location_on_outlined,
                        readOnly: true,
                        onTap: () {},
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _FilterField(
                        hint: dateLabel,
                        icon: Icons.calendar_today_outlined,
                        readOnly: true,
                        onTap: _pickDate,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _FilterField(
                  hint: 'Insurance',
                  icon: Icons.shield_outlined,
                  readOnly: true,
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: consultants.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (list) {
                final filtered = list.where((p) {
                  if (_query.isEmpty) return true;
                  final hay = '${p.displayName} ${p.specialization} ${p.city}'.toLowerCase();
                  return hay.contains(_query);
                }).toList();

                if (filtered.isEmpty) {
                  return const Center(
                    child: EmptyState(
                      title: 'No doctors found',
                      subtitle: 'Try adjusting your search or filters.',
                      icon: Icons.person_search_outlined,
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(consultantsListProvider),
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) {
                      final p = filtered[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _BookDoctorCard(
                          profile: p,
                          onTap: () => context.push('/consultants/${p.id}'),
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

class _FilterField extends StatelessWidget {
  const _FilterField({
    this.controller,
    required this.hint,
    required this.icon,
    this.onChanged,
    this.onTap,
    this.readOnly = false,
  });

  final TextEditingController? controller;
  final String hint;
  final IconData icon;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadii.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadii.lg),
            border: Border.all(color: AppColors.outline.withValues(alpha: 0.5)),
          ),
          child: TextField(
            controller: controller,
            readOnly: readOnly,
            onTap: onTap,
            onChanged: onChanged,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant, fontSize: 13),
              prefixIcon: Icon(icon, color: AppColors.brand, size: 20),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
      ),
    );
  }
}

class _BookDoctorCard extends StatelessWidget {
  const _BookDoctorCard({
    required this.profile,
    required this.onTap,
    this.animationIndex = 0,
  });

  final ProfessionalProfile profile;
  final VoidCallback onTap;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    return DoctorListCard(
      name: profile.displayName,
      specialty: profile.specialization ?? 'Healthcare professional',
      fee: '${profile.displayFee} / Consultation',
      imageUrl: profile.image,
      isVerified: profile.isVerified,
      animationIndex: animationIndex,
      onTap: onTap,
    );
  }
}
