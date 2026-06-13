import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: SectionHeader(
              title: 'Find a specialist',
              subtitle: 'Verified healthcare professionals',
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Search by name or specialty…',
                prefixIcon: Icon(Icons.search, color: AppColors.onSurfaceVariant),
              ),
              onChanged: (v) => setState(() => _query = v.toLowerCase()),
            ),
          ),
          Expanded(
            child: consultants.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.brand),
              ),
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
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) {
                      final p = filtered[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: GlassCard(
                          onTap: () => context.push('/consultants/${p.id}'),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 28,
                                backgroundColor: AppColors.surfaceContainer,
                                backgroundImage: p.image != null
                                    ? CachedNetworkImageProvider(p.image!)
                                    : null,
                                child: p.image == null
                                    ? Text(
                                        p.displayName[0].toUpperCase(),
                                        style: AppTypography.bodyMedium,
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.displayName,
                                      style: AppTypography.textTheme.titleMedium,
                                    ),
                                    if (p.specialization != null)
                                      Text(p.specialization!, style: AppTypography.pageSubtitle),
                                    if (p.city != null)
                                      Text(p.city!, style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  if (p.isVerified) const VerifiedBadge(),
                                  const SizedBox(height: 4),
                                  Text(p.displayFee, style: AppTypography.statValue.copyWith(fontSize: 16)),
                                ],
                              ),
                            ],
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
