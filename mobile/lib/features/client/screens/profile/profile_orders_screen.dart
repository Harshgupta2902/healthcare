import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../data/client_repository.dart';

class ProfileOrdersScreen extends ConsumerWidget {
  const ProfileOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(clientBookingOrdersProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Orders', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: orders.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No orders yet',
              subtitle: 'Consultation order history will appear here after checkout.',
            );
          }

          return RefreshIndicator(
            color: AppColors.brand,
            onRefresh: () async => ref.invalidate(clientBookingOrdersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _OrderCard(item: items[i]),
            ),
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.item});

  final ClientBookingOrderItem item;

  Color _statusColor() {
    switch (item.status) {
      case 'paid':
      case 'fulfilled':
        return AppColors.tealSoft;
      case 'failed':
      case 'expired':
        return AppColors.error;
      default:
        return AppColors.brand;
    }
  }

  String _formatSchedule() {
    if (item.appointmentDate.isEmpty) {
      return DateFormat('MMM d, yyyy').format(item.createdAt);
    }
    try {
      final parts = item.appointmentDate.split('-');
      final date = DateTime(
        int.parse(parts[0]),
        int.parse(parts[1]),
        int.parse(parts[2]),
      );
      return '${DateFormat('EEE, MMM d').format(date)} · ${item.appointmentTime}';
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
                  item.consultantName,
                  style: AppTypography.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor().withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadii.pill),
                ),
                child: Text(
                  item.status.toUpperCase(),
                  style: AppTypography.fieldLabel.copyWith(color: _statusColor(), fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '#${item.orderNumber}',
            style: AppTypography.pageSubtitle.copyWith(fontSize: 12),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(_formatSchedule(), style: AppTypography.bodyMedium),
              Text(
                item.amountLabel,
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.tealSoft,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
