import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
import '../data/booking_repository.dart';

class BookingSuccessScreen extends ConsumerWidget {
  const BookingSuccessScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final confirmation = ref.watch(_bookingConfirmationProvider(bookingId));

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: confirmation.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text(e.toString())),
            data: (data) {
              final patient = '${data['first_name'] ?? ''} ${data['last_name'] ?? ''}'.trim();
              final date = data['appointment_date'] as String? ?? '';
              final time = data['appointment_time'] as String? ?? '';
              final professional = data['professional_name'] as String?;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Spacer(),
                  const Icon(Icons.check_circle_outline, size: 72, color: Colors.teal),
                  const SizedBox(height: 16),
                  const SectionHeader(
                    title: 'Booking confirmed',
                    subtitle: 'We sent a confirmation to your email.',
                  ),
                  GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Patient', style: AppTypography.fieldLabel),
                        Text(patient, style: AppTypography.bodyMedium),
                        const SizedBox(height: 12),
                        Text('Date & time', style: AppTypography.fieldLabel),
                        Text('$date • $time', style: AppTypography.bodyMedium),
                        if (professional != null) ...[
                          const SizedBox(height: 12),
                          Text('Professional', style: AppTypography.fieldLabel),
                          Text(professional, style: AppTypography.bodyMedium),
                        ],
                      ],
                    ),
                  ),
                  const Spacer(),
                  PrimaryGradientButton(
                    label: 'Back to home',
                    onPressed: () => context.go('/home'),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

final _bookingConfirmationProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return ref.watch(bookingRepositoryProvider).getConfirmation(id);
});
