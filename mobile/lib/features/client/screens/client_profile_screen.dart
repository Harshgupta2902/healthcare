import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/client_repository.dart';

/// Single health-record section for profile sub-routes.
enum ClientHealthSection { history, medications, insurance }

class ClientHealthSectionScreen extends ConsumerWidget {
  const ClientHealthSectionScreen({super.key, required this.section, this.showTitle = true});

  final ClientHealthSection section;
  final bool showTitle;

  String get _title => switch (section) {
        ClientHealthSection.history => 'Medical history',
        ClientHealthSection.medications => 'Medications',
        ClientHealthSection.insurance => 'Insurance',
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(clientDashboardProvider);

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showTitle)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Text(_title, style: AppTypography.pageTitle.copyWith(fontSize: 22)),
            ),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) => switch (section) {
                ClientHealthSection.history => _HistoryTab(items: data.medicalHistory),
                ClientHealthSection.medications => _MedicationsTab(items: data.medications),
                ClientHealthSection.insurance => _InsuranceTab(items: data.insurance),
              },
            ),
          ),
        ],
      ),
    );
  }
}

void _refresh(WidgetRef ref) => ref.invalidate(clientDashboardProvider);

class _HistoryTab extends ConsumerWidget {
  const _HistoryTab({required this.items});
  final List<MedicalHistoryItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _HealthListScaffold(
      emptyTitle: 'No medical history',
      emptySubtitle: 'Add conditions to keep your care team informed.',
      emptyIcon: Icons.history_edu_outlined,
      addLabel: 'Add condition',
      itemCount: items.length,
      onAdd: () => _showAddDialog(context, ref),
      itemBuilder: (i) {
        final item = items[i];
        return _HealthRecordCard(
          icon: Icons.favorite_outline,
          title: item.conditionName,
          subtitle: [
            if (item.diagnosisDate != null) 'Diagnosed: ${item.diagnosisDate}',
            if (item.status.isNotEmpty) 'Status: ${item.status}',
          ].join(' · '),
          onDelete: () async {
            await ref.read(clientRepositoryProvider).deleteMedicalCondition(item.id);
            _refresh(ref);
          },
        );
      },
    );
  }

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final controller = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add condition'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Condition name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
        ],
      ),
    );
    if (ok == true && controller.text.trim().isNotEmpty) {
      await ref.read(clientRepositoryProvider).addMedicalCondition(conditionName: controller.text.trim());
      _refresh(ref);
    }
    controller.dispose();
  }
}

class _MedicationsTab extends ConsumerWidget {
  const _MedicationsTab({required this.items});
  final List<MedicationItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _HealthListScaffold(
      emptyTitle: 'No medications',
      emptySubtitle: 'Track prescriptions and dosages here.',
      emptyIcon: Icons.medication_outlined,
      addLabel: 'Add medication',
      itemCount: items.length,
      onAdd: () => _showAddDialog(context, ref),
      itemBuilder: (i) {
        final item = items[i];
        return _HealthRecordCard(
          icon: Icons.medication_liquid_outlined,
          title: item.medicationName,
          subtitle: '${item.dosage} · ${item.frequency}',
          onDelete: () async {
            await ref.read(clientRepositoryProvider).deleteMedication(item.id);
            _refresh(ref);
          },
        );
      },
    );
  }

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final name = TextEditingController();
    final dosage = TextEditingController();
    final frequency = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add medication'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: name, decoration: const InputDecoration(hintText: 'Medication name')),
            TextField(controller: dosage, decoration: const InputDecoration(hintText: 'Dosage')),
            TextField(controller: frequency, decoration: const InputDecoration(hintText: 'Frequency')),
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
            medicationName: name.text.trim(),
            dosage: dosage.text.trim().isEmpty ? '—' : dosage.text.trim(),
            frequency: frequency.text.trim().isEmpty ? '—' : frequency.text.trim(),
            startDate: DateTime.now().toIso8601String().split('T').first,
          );
      _refresh(ref);
    }
    name.dispose();
    dosage.dispose();
    frequency.dispose();
  }
}

class _InsuranceTab extends ConsumerWidget {
  const _InsuranceTab({required this.items});
  final List<InsuranceItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _HealthListScaffold(
      emptyTitle: 'No insurance policies',
      emptySubtitle: 'Store your policy details for quick access.',
      emptyIcon: Icons.shield_outlined,
      addLabel: 'Add insurance',
      itemCount: items.length,
      onAdd: () => _showAddDialog(context, ref),
      itemBuilder: (i) {
        final item = items[i];
        return _HealthRecordCard(
          icon: Icons.shield_outlined,
          title: item.providerName,
          subtitle: 'Policy ${item.policyNumber}',
          onDelete: () async {
            await ref.read(clientRepositoryProvider).deleteInsurance(item.id);
            _refresh(ref);
          },
        );
      },
    );
  }

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final provider = TextEditingController();
    final policy = TextEditingController();
    final holder = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add insurance'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: provider, decoration: const InputDecoration(hintText: 'Provider')),
            TextField(controller: policy, decoration: const InputDecoration(hintText: 'Policy number')),
            TextField(controller: holder, decoration: const InputDecoration(hintText: 'Policy holder')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
        ],
      ),
    );
    if (ok == true && provider.text.trim().isNotEmpty) {
      await ref.read(clientRepositoryProvider).addInsurance(
            providerName: provider.text.trim(),
            policyNumber: policy.text.trim(),
            policyHolderName: holder.text.trim().isEmpty ? provider.text.trim() : holder.text.trim(),
          );
      _refresh(ref);
    }
    provider.dispose();
    policy.dispose();
    holder.dispose();
  }
}

class _HealthListScaffold extends StatelessWidget {
  const _HealthListScaffold({
    required this.emptyTitle,
    required this.emptySubtitle,
    required this.emptyIcon,
    required this.addLabel,
    required this.itemCount,
    required this.onAdd,
    required this.itemBuilder,
  });

  final String emptyTitle;
  final String emptySubtitle;
  final IconData emptyIcon;
  final String addLabel;
  final int itemCount;
  final VoidCallback onAdd;
  final Widget Function(int index) itemBuilder;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (itemCount == 0)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: EmptyState(
                title: emptyTitle,
                subtitle: emptySubtitle,
                icon: emptyIcon,
                actionLabel: addLabel,
                onAction: onAdd,
              ),
            ),
          )
        else
          ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 88),
            itemCount: itemCount,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => itemBuilder(i),
          ),
        Positioned(
          left: 20,
          right: 20,
          bottom: 20,
          child: PrimaryGradientButton(
            label: addLabel,
            icon: Icons.add,
            onPressed: onAdd,
          ),
        ),
      ],
    );
  }
}

class _HealthRecordCard extends StatelessWidget {
  const _HealthRecordCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onDelete,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(
              color: Color(0xFFE8F4FC),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.brand, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(subtitle, style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }
}
