import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/professional_repository.dart';

const _dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class ProfessionalProfileScreen extends ConsumerStatefulWidget {
  const ProfessionalProfileScreen({super.key});

  @override
  ConsumerState<ProfessionalProfileScreen> createState() => _ProfessionalProfileScreenState();
}

class _ProfessionalProfileScreenState extends ConsumerState<ProfessionalProfileScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(professionalDashboardProvider);

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: SectionHeader(
              title: 'Professional profile',
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
              Tab(text: 'CREDENTIALS'),
              Tab(text: 'AVAILABILITY'),
              Tab(text: 'CLIENTS'),
            ],
          ),
          Expanded(
            child: dashboard.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
              error: (e, _) => Center(child: Text(e.toString())),
              data: (data) => TabBarView(
                controller: _tabs,
                children: [
                  _CredentialsTab(qualifications: data.qualifications),
                  _AvailabilityTab(slots: data.availability),
                  _ClientsTab(clients: data.clients),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CredentialsTab extends ConsumerWidget {
  const _CredentialsTab({required this.qualifications});
  final List<ProfessionalQualification> qualifications;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryGradientButton(
            label: 'Add qualification',
            icon: Icons.add,
            onPressed: () => _showAddDialog(context, ref),
          ),
        ),
        Expanded(
          child: qualifications.isEmpty
              ? const Center(
                  child: EmptyState(
                    title: 'No qualifications',
                    subtitle: 'Upload degrees for admin verification.',
                    icon: Icons.school_outlined,
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: qualifications.length,
                  itemBuilder: (_, i) {
                    final q = qualifications[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        child: ListTile(
                          title: Text(q.degree, style: AppTypography.bodyMedium),
                          subtitle: Text('${q.institution}${q.year != null ? ' • ${q.year}' : ''}'),
                          trailing: q.documentApproved == true
                              ? const Icon(Icons.verified, color: AppColors.brand)
                              : const Icon(Icons.hourglass_empty, size: 18),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Future<void> _showAddDialog(BuildContext context, WidgetRef ref) async {
    final degree = TextEditingController();
    final institution = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add qualification'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: degree, decoration: const InputDecoration(hintText: 'Degree')),
            TextField(controller: institution, decoration: const InputDecoration(hintText: 'Institution')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Save')),
        ],
      ),
    );
    if (ok == true && degree.text.trim().isNotEmpty) {
      await ref.read(professionalRepositoryProvider).addQualification(
            degree: degree.text.trim(),
            institution: institution.text.trim(),
          );
      ref.invalidate(professionalDashboardProvider);
    }
    degree.dispose();
    institution.dispose();
  }
}

class _AvailabilityTab extends ConsumerWidget {
  const _AvailabilityTab({required this.slots});
  final List<AvailabilitySlot> slots;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryGradientButton(
            label: 'Add slot',
            icon: Icons.add,
            onPressed: () => _showAddSlot(context, ref),
          ),
        ),
        Expanded(
          child: slots.isEmpty
              ? const Center(
                  child: EmptyState(
                    title: 'No availability',
                    subtitle: 'Publish weekly hours for booking.',
                    icon: Icons.schedule_outlined,
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: slots.length,
                  itemBuilder: (_, i) {
                    final s = slots[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        child: ListTile(
                          title: Text(_dayNames[s.dayOfWeek % 7], style: AppTypography.bodyMedium),
                          subtitle: Text('${s.startTime} – ${s.endTime}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                            onPressed: () async {
                              await ref.read(professionalRepositoryProvider).deleteAvailabilitySlot(s.id);
                              ref.invalidate(professionalDashboardProvider);
                            },
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

  Future<void> _showAddSlot(BuildContext context, WidgetRef ref) async {
    var day = 1;
    final start = TextEditingController(text: '09:00');
    final end = TextEditingController(text: '17:00');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add availability'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<int>(
              value: day,
              items: List.generate(
                7,
                (i) => DropdownMenuItem(value: i, child: Text(_dayNames[i])),
              ),
              onChanged: (v) => day = v ?? day,
            ),
            TextField(controller: start, decoration: const InputDecoration(hintText: 'Start (HH:MM)')),
            TextField(controller: end, decoration: const InputDecoration(hintText: 'End (HH:MM)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Save')),
        ],
      ),
    );
    if (ok == true) {
      await ref.read(professionalRepositoryProvider).addAvailabilitySlot(
            AvailabilitySlot(
              id: '',
              professionalId: '',
              dayOfWeek: day,
              startTime: start.text.trim(),
              endTime: end.text.trim(),
            ),
          );
      ref.invalidate(professionalDashboardProvider);
    }
    start.dispose();
    end.dispose();
  }
}

class _ClientsTab extends StatelessWidget {
  const _ClientsTab({required this.clients});
  final List<AppUser> clients;

  @override
  Widget build(BuildContext context) {
    if (clients.isEmpty) {
      return const Center(
        child: EmptyState(
          title: 'No clients yet',
          subtitle: 'Clients appear after confirmed appointments.',
          icon: Icons.people_outline,
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: clients.length,
      itemBuilder: (_, i) {
        final c = clients[i];
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: GlassCard(
            child: ListTile(
              leading: CircleAvatar(child: Text((c.name ?? c.email)[0].toUpperCase())),
              title: Text(c.name ?? 'Client', style: AppTypography.bodyMedium),
              subtitle: Text(c.email),
            ),
          ),
        );
      },
    );
  }
}
