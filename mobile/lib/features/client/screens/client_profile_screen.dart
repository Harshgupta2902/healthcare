import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/client_repository.dart';

class ClientProfileScreen extends ConsumerStatefulWidget {
  const ClientProfileScreen({super.key});

  @override
  ConsumerState<ClientProfileScreen> createState() => _ClientProfileScreenState();
}

class _ClientProfileScreenState extends ConsumerState<ClientProfileScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: SectionHeader(
              title: 'Health records',
              subtitle: user?.email ?? '',
              actionLabel: 'Settings',
              onAction: () => context.push('/settings'),
            ),
          ),
          TabBar(
            controller: _tabs,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            labelColor: AppColors.brand,
            unselectedLabelColor: AppColors.onSurfaceVariant,
            indicatorColor: AppColors.brand,
            tabs: const [
              Tab(text: 'HISTORY'),
              Tab(text: 'MEDS'),
              Tab(text: 'DOCS'),
              Tab(text: 'INSURANCE'),
            ],
          ),
          Expanded(
            child: dashboard.when(
              loading: () => const LoadingView(),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) => TabBarView(
                controller: _tabs,
                children: [
                  _HistoryTab(
                    items: data.medicalHistory,
                    onRefresh: () => ref.invalidate(clientDashboardProvider),
                  ),
                  _MedicationsTab(
                    items: data.medications,
                    onRefresh: () => ref.invalidate(clientDashboardProvider),
                  ),
                  const EmptyState(
                    title: 'Documents',
                    subtitle: 'Upload medical documents — Phase 2 (Storage SDK).',
                    icon: Icons.folder_open_outlined,
                  ),
                  const EmptyState(
                    title: 'Insurance',
                    subtitle: 'Manage policies — Phase 2.',
                    icon: Icons.shield_outlined,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryTab extends ConsumerWidget {
  const _HistoryTab({required this.items, required this.onRefresh});
  final List<dynamic> items;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _ListTab(
      emptyTitle: 'No medical history',
      emptyIcon: Icons.history_edu_outlined,
      items: items,
      itemBuilder: (item) => ListTile(
        title: Text(item.condition, style: AppTypography.bodyMedium),
        subtitle: item.notes != null ? Text(item.notes!) : null,
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
          onPressed: () async {
            await ref.read(clientRepositoryProvider).deleteMedicalCondition(item.id);
            onRefresh();
          },
        ),
      ),
      onAdd: () => _showAddConditionDialog(context, ref, onRefresh),
    );
  }

  Future<void> _showAddConditionDialog(
    BuildContext context,
    WidgetRef ref,
    VoidCallback onRefresh,
  ) async {
    final controller = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add condition'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'e.g. Hypertension'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
        ],
      ),
    );
    if (ok == true && controller.text.trim().isNotEmpty) {
      await ref.read(clientRepositoryProvider).addMedicalCondition(condition: controller.text.trim());
      onRefresh();
    }
    controller.dispose();
  }
}

class _MedicationsTab extends ConsumerWidget {
  const _MedicationsTab({required this.items, required this.onRefresh});
  final List<dynamic> items;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _ListTab(
      emptyTitle: 'No medications',
      emptyIcon: Icons.medication_outlined,
      items: items,
      itemBuilder: (item) => ListTile(
        title: Text(item.name, style: AppTypography.bodyMedium),
        subtitle: Text([item.dosage, item.frequency].whereType<String>().join(' • ')),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
          onPressed: () async {
            await ref.read(clientRepositoryProvider).deleteMedication(item.id);
            onRefresh();
          },
        ),
      ),
      onAdd: () => _showAddMedDialog(context, ref, onRefresh),
    );
  }

  Future<void> _showAddMedDialog(
    BuildContext context,
    WidgetRef ref,
    VoidCallback onRefresh,
  ) async {
    final name = TextEditingController();
    final dosage = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add medication'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: name, decoration: const InputDecoration(hintText: 'Name')),
            TextField(controller: dosage, decoration: const InputDecoration(hintText: 'Dosage')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
        ],
      ),
    );
    if (ok == true && name.text.trim().isNotEmpty) {
      await ref.read(clientRepositoryProvider).addMedication(
            name: name.text.trim(),
            dosage: dosage.text.trim().isEmpty ? null : dosage.text.trim(),
          );
      onRefresh();
    }
    name.dispose();
    dosage.dispose();
  }
}

class _ListTab extends StatelessWidget {
  const _ListTab({
    required this.emptyTitle,
    required this.emptyIcon,
    required this.items,
    required this.itemBuilder,
    required this.onAdd,
  });

  final String emptyTitle;
  final IconData emptyIcon;
  final List<dynamic> items;
  final Widget Function(dynamic item) itemBuilder;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryGradientButton(label: 'Add', icon: Icons.add, onPressed: onAdd),
        ),
        Expanded(
          child: items.isEmpty
              ? Center(child: EmptyState(title: emptyTitle, icon: emptyIcon))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: items.length,
                  itemBuilder: (_, i) => GlassCard(
                    padding: EdgeInsets.zero,
                    child: itemBuilder(items[i]),
                  ),
                ),
        ),
      ],
    );
  }
}
