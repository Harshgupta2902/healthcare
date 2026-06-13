import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/consultants_repository.dart';

class ConsultantsListScreen extends ConsumerStatefulWidget {
  const ConsultantsListScreen({super.key});

  @override
  ConsumerState<ConsultantsListScreen> createState() => _ConsultantsListScreenState();
}

class _ConsultantsListScreenState extends ConsumerState<ConsultantsListScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final consultants = ref.watch(consultantsListProvider);

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Text('Find a specialist', style: AppTypography.pageTitle.copyWith(fontSize: 22)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
            child: Text('Verified healthcare professionals', style: AppTypography.pageSubtitle),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: PillSearchBar(
              hint: 'Search by name or specialty…',
              controller: _searchController,
              onChanged: (v) => setState(() => _query = v.toLowerCase()),
            ),
          ),
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
                      title: 'No consultants found',
                      subtitle: 'Try a different search term.',
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
                        padding: const EdgeInsets.only(bottom: 10),
                        child: DoctorListCard(
                          name: p.displayName,
                          specialty: p.specialization ?? 'Healthcare professional',
                          fee: '${p.displayFee} / Consultation',
                          imageUrl: p.image,
                          isVerified: p.isVerified,
                          animationIndex: i,
                          onTap: () => context.push('/consultants/${p.id}'),
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
