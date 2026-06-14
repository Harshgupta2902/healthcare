import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
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

/// Single health-record section for web-aligned dashboard tabs.
enum ClientHealthSection { history, medications, documents, insurance }

class ClientHealthSectionScreen extends ConsumerWidget {
  const ClientHealthSectionScreen({super.key, required this.section});

  final ClientHealthSection section;

  String get _title => switch (section) {
        ClientHealthSection.history => 'Medical history',
        ClientHealthSection.medications => 'Medications',
        ClientHealthSection.documents => 'Documents',
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
                ClientHealthSection.documents => _DocumentsTab(documents: data.documents),
                ClientHealthSection.insurance => _InsuranceTab(items: data.insurance),
              },
            ),
          ),
        ],
      ),
    );
  }
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

    return Scaffold(
      appBar: AppBar(title: const Text('Health Records')),
      body: SafeArea(
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: SectionHeader(
              title: 'Health records',
              subtitle: user?.email ?? '',
              actionLabel: 'Edit',
              onAction: () => context.push('/profile/edit'),
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
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) => TabBarView(
                controller: _tabs,
                children: [
                  _HistoryTab(items: data.medicalHistory),
                  _MedicationsTab(items: data.medications),
                  _DocumentsTab(documents: data.documents),
                  _InsuranceTab(items: data.insurance),
                ],
              ),
            ),
          ),
        ],
        ),
      ),
    );
  }
}

void refreshClientDashboard(WidgetRef ref) => ref.invalidate(clientDashboardProvider);

class ClientMedicationsPanel extends ConsumerWidget {
  const ClientMedicationsPanel({super.key, required this.items});
  final List<MedicationItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) => _MedicationsTab(items: items);
}

class ClientDocumentsPanel extends ConsumerWidget {
  const ClientDocumentsPanel({super.key, required this.documents});
  final List<MedicalDocumentItem> documents;

  @override
  Widget build(BuildContext context, WidgetRef ref) => _DocumentsTab(documents: documents);
}

class ClientInsurancePanel extends ConsumerWidget {
  const ClientInsurancePanel({super.key, required this.items});
  final List<InsuranceItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) => _InsuranceTab(items: items);
}

void _refresh(WidgetRef ref) => refreshClientDashboard(ref);

class _HistoryTab extends ConsumerWidget {
  const _HistoryTab({required this.items});
  final List<MedicalHistoryItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _ListTab(
      emptyTitle: 'No medical history',
      emptyIcon: Icons.history_edu_outlined,
      items: items,
      itemBuilder: (item) => ListTile(
        title: Text(item.conditionName, style: AppTypography.bodyMedium),
        subtitle: Text([item.diagnosisDate, item.status].whereType<String>().join(' • ')),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
          onPressed: () async {
            await ref.read(clientRepositoryProvider).deleteMedicalCondition(item.id);
            _refresh(ref);
          },
        ),
      ),
      onAdd: () => _showAddConditionDialog(context, ref),
    );
  }

  Future<void> _showAddConditionDialog(BuildContext context, WidgetRef ref) async {
    final controller = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add condition'),
        content: TextField(controller: controller, decoration: const InputDecoration(hintText: 'Condition name')),
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
    return _ListTab(
      emptyTitle: 'No medications',
      emptyIcon: Icons.medication_outlined,
      items: items,
      itemBuilder: (item) => ListTile(
        title: Text(item.medicationName, style: AppTypography.bodyMedium),
        subtitle: Text('${item.dosage} • ${item.frequency}'),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
          onPressed: () async {
            await ref.read(clientRepositoryProvider).deleteMedication(item.id);
            _refresh(ref);
          },
        ),
      ),
      onAdd: () => _showAddMedDialog(context, ref),
    );
  }

  Future<void> _showAddMedDialog(BuildContext context, WidgetRef ref) async {
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

class _DocumentsTab extends ConsumerWidget {
  const _DocumentsTab({required this.documents});
  final List<MedicalDocumentItem> documents;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryGradientButton(
            label: 'Upload document',
            icon: Icons.upload_file,
            onPressed: () => _upload(context, ref),
          ),
        ),
        Expanded(
          child: documents.isEmpty
              ? const Center(
                  child: EmptyState(
                    title: 'No documents',
                    subtitle: 'Upload lab results, imaging, or referrals.',
                    icon: Icons.folder_open_outlined,
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: documents.length,
                  itemBuilder: (_, i) {
                    final d = documents[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        child: ListTile(
                          title: Text(d.documentName, style: AppTypography.bodyMedium),
                          subtitle: Text(d.documentType),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.open_in_new, size: 18),
                                onPressed: () => launchUrl(Uri.parse(d.fileUrl)),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                                onPressed: () async {
                                  await ref.read(clientRepositoryProvider).deleteDocument(d.id);
                                  _refresh(ref);
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Future<void> _upload(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    await ref.read(clientRepositoryProvider).uploadDocument(
          fileName: picked.name,
          documentType: 'medical',
          bytes: bytes,
        );
    _refresh(ref);
  }
}

class _InsuranceTab extends ConsumerWidget {
  const _InsuranceTab({required this.items});
  final List<InsuranceItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _ListTab(
      emptyTitle: 'No insurance policies',
      emptyIcon: Icons.shield_outlined,
      items: items,
      itemBuilder: (item) => ListTile(
        title: Text(item.providerName, style: AppTypography.bodyMedium),
        subtitle: Text('Policy ${item.policyNumber}'),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
          onPressed: () async {
            await ref.read(clientRepositoryProvider).deleteInsurance(item.id);
            _refresh(ref);
          },
        ),
      ),
      onAdd: () => _showAddInsurance(context, ref),
    );
  }

  Future<void> _showAddInsurance(BuildContext context, WidgetRef ref) async {
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
