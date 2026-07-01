import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../data/client_repository.dart';

class ProfileRequestsScreen extends ConsumerWidget {
  const ProfileRequestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requests = ref.watch(clientConsultationRequestsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Requests', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: requests.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.calendar_today_outlined,
              title: 'No requests yet',
              subtitle: 'Your consultation requests will appear here after you book.',
            );
          }

          return RefreshIndicator(
            color: AppColors.brand,
            onRefresh: () async => ref.invalidate(clientConsultationRequestsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _RequestCard(item: items[i]),
            ),
          );
        },
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  const _RequestCard({required this.item});

  final GuestAppointmentItem item;

  String _formatSchedule() {
    try {
      final parts = item.appointmentDate.split('-');
      final date = DateTime(
        int.parse(parts[0]),
        int.parse(parts[1]),
        int.parse(parts[2]),
      );
      return '${DateFormat('EEE, MMM d, yyyy').format(date)} · ${item.appointmentTime}';
    } catch (_) {
      return '${item.appointmentDate} · ${item.appointmentTime}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.specialistLabel,
                  style: AppTypography.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(AppRadii.pill),
                ),
                child: Text(
                  item.category,
                  style: AppTypography.fieldLabel.copyWith(color: AppColors.brand),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _MetaRow(icon: Icons.calendar_today_outlined, text: _formatSchedule()),
          _MetaRow(icon: Icons.location_on_outlined, text: '${item.city}, ${item.state}'),
          if (item.message?.isNotEmpty == true) ...[
            const SizedBox(height: 8),
            Text(item.message!, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          ],
          if (item.calendarInviteUrl?.isNotEmpty == true) ...[
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: () => launchUrl(Uri.parse(item.calendarInviteUrl!)),
              icon: const Icon(Icons.videocam_outlined, size: 18),
              label: const Text('Join meeting'),
            ),
          ],
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  const _MetaRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: AppTypography.bodyMedium)),
        ],
      ),
    );
  }
}
