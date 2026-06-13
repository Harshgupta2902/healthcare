import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_repository.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';

final assistantContextProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(apiRepositoryProvider).getAssistantContext();
});

class AssistantScreen extends ConsumerWidget {
  const AssistantScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contextData = ref.watch(assistantContextProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Health assistant')),
      body: contextData.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          final greeting = data['greeting'] as String? ??
              data['displayName'] as String? ??
              'Hello';
          final role = data['role'] as String? ?? 'client';
          final appointments = (data['appointments'] as List?) ?? [];
          final tips = (data['tips'] as List?) ?? [];

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(assistantContextProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                SectionHeader(
                  title: greeting.toString(),
                  subtitle: 'Personalized context for your $role account',
                ),
                if (appointments.isEmpty)
                  const EmptyState(
                    title: 'No recent activity',
                    subtitle: 'Book a consultation or update your health records.',
                    icon: Icons.smart_toy_outlined,
                  )
                else ...[
                  Text('RECENT ACTIVITY', style: AppTypography.sectionLabel),
                  const SizedBox(height: 12),
                  ...appointments.take(6).map((raw) {
                    final item = Map<String, dynamic>.from(raw as Map);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title'] as String? ?? 'Appointment',
                              style: AppTypography.textTheme.titleMedium,
                            ),
                            if (item['appointmentDate'] != null)
                              Text(
                                '${item['appointmentDate']} ${item['appointmentTime'] ?? ''}',
                                style: AppTypography.pageSubtitle,
                              ),
                            if (item['status'] != null)
                              Text(
                                (item['status'] as String).toUpperCase(),
                                style: AppTypography.sectionLabel.copyWith(fontSize: 10),
                              ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
                if (tips.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('TIPS', style: AppTypography.sectionLabel),
                  const SizedBox(height: 8),
                  ...tips.map(
                    (t) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(child: Text(t.toString(), style: AppTypography.body)),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
