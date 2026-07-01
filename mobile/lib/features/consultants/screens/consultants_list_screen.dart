import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/consultants_repository.dart';
import '../models/consultant_search_filters.dart';
import '../widgets/consultant_filter_sheet.dart';

class ConsultantsListScreen extends ConsumerStatefulWidget {
  const ConsultantsListScreen({super.key});

  @override
  ConsumerState<ConsultantsListScreen> createState() =>
      _ConsultantsListScreenState();
}

class _ConsultantsListScreenState extends ConsumerState<ConsultantsListScreen> {
  final _searchController = TextEditingController();
  ConsultantSearchFilters _filters = const ConsultantSearchFilters();
  String? _lastRouteCategory;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _filters = _filters.copyWith(query: _searchController.text);
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncCategoryFromRoute();
  }

  void _syncCategoryFromRoute() {
    final category = GoRouterState.of(context).uri.queryParameters['category'];
    if (category == _lastRouteCategory) return;
    _lastRouteCategory = category;

    if (category != null && category.isNotEmpty) {
      setState(() {
        _filters = _filters.copyWith(healthCategory: category);
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openFilters(List<String> cities) async {
    final result = await ConsultantFilterSheet.show(
      context,
      initialFilters: _filters,
      cities: cities,
    );
    if (result != null && mounted) {
      setState(() => _filters = result);
    }
  }

  void _resetAll() {
    setState(() {
      _filters = const ConsultantSearchFilters();
      _searchController.clear();
      _lastRouteCategory = null;
    });
    context.go('/search');
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
            child: Text(
              'Find a specialist',
              style: AppTypography.pageTitle.copyWith(fontSize: 22),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
            child: Text(
              'Verified healthcare professionals',
              style: AppTypography.pageSubtitle,
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: consultants.when(
              data: (list) {
                final cities = extractConsultantCities(list);
                return _SearchFilterRow(
                  controller: _searchController,
                  activeFilterCount: _filters.activeFilterCount,
                  onFilterTap: () => _openFilters(cities),
                );
              },
              loading: () => _SearchFilterRow(
                controller: _searchController,
                activeFilterCount: _filters.activeFilterCount,
                onFilterTap: () => _openFilters(const []),
              ),
              error: (_, __) => _SearchFilterRow(
                controller: _searchController,
                activeFilterCount: _filters.activeFilterCount,
                onFilterTap: () => _openFilters(const []),
              ),
            ),
          ),
          if (_filters.healthCategory != null &&
              _filters.healthCategory!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: InputChip(
                  label: Text(_filters.healthCategory!),
                  deleteIcon: const Icon(Icons.close, size: 16),
                  onDeleted: () => setState(
                    () => _filters = _filters.copyWith(clearHealthCategory: true),
                  ),
                  backgroundColor: AppColors.surfaceContainer,
                  labelStyle: AppTypography.bodyMedium.copyWith(
                    color: AppColors.brand,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          Expanded(
            child: consultants.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.brand),
              ),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (list) {
                final filtered = filterAndSortConsultants(list, _filters);

                if (filtered.isEmpty) {
                  return Center(
                    child: EmptyState(
                      title: 'No consultants found',
                      subtitle: 'Try another search term or adjust filters.',
                      icon: Icons.person_search_outlined,
                      actionLabel: 'Reset search',
                      onAction: _resetAll,
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(consultantsListProvider),
                  color: AppColors.brand,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '${filtered.length}',
                            style: AppTypography.textTheme.titleMedium!.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Experts found',
                            style: AppTypography.pageSubtitle.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            _filters.sort.label,
                            style: AppTypography.pageSubtitle.copyWith(
                              fontSize: 12,
                              color: AppColors.brand,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...filtered.asMap().entries.map((e) {
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
          ),
        ],
      ),
    );
  }
}

class _SearchFilterRow extends StatelessWidget {
  const _SearchFilterRow({
    required this.controller,
    required this.activeFilterCount,
    required this.onFilterTap,
  });

  final TextEditingController controller;
  final int activeFilterCount;
  final VoidCallback onFilterTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: PillSearchBar(
            hint: 'Search by name or specialty…',
            controller: controller,
          ),
        ),
        const SizedBox(width: 10),
        Material(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            onTap: onFilterTap,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: activeFilterCount > 0
                      ? AppColors.brand.withValues(alpha: 0.45)
                      : AppColors.outline.withValues(alpha: 0.25),
                ),
              ),
              child: Badge(
                isLabelVisible: activeFilterCount > 0,
                label: Text('$activeFilterCount'),
                child: Icon(
                  Icons.tune_rounded,
                  color: activeFilterCount > 0
                      ? AppColors.brand
                      : AppColors.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
