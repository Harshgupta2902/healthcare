import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/booking_repository.dart';

class BookingSuccessScreen extends ConsumerWidget {
  const BookingSuccessScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final confirmation = ref.watch(_bookingConfirmationProvider(bookingId));

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: confirmation.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
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
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradient,
                        shape: BoxShape.circle,
                        boxShadow: AppColors.brandGlow,
                      ),
                      child: const Icon(Icons.check_rounded, size: 56, color: Colors.white),
                    ).animate().scale(duration: 450.ms, curve: Curves.easeOutBack),
                    const SizedBox(height: 24),
                    Text(
                      'Booking confirmed',
                      style: AppTypography.pageTitle,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We sent a confirmation to your email.',
                      style: AppTypography.pageSubtitle,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    GlassCard(
                      gradientBorder: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _Row(label: 'Patient', value: patient),
                          const SizedBox(height: 12),
                          _Row(label: 'Date & time', value: '$date • $time'),
                          if (professional != null) ...[
                            const SizedBox(height: 12),
                            _Row(label: 'Professional', value: professional),
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
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: AppTypography.fieldLabel),
        const SizedBox(height: 4),
        Text(value, style: AppTypography.bodyMedium),
      ],
    );
  }
}

final _bookingConfirmationProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  return ref.watch(bookingRepositoryProvider).getConfirmation(id);
});
