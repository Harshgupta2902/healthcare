import 'package:flutter/material.dart';

import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';

/// Payments tab placeholder — full payments UI lives on web dashboard for now.
class ProfessionalPaymentsScreen extends StatelessWidget {
  const ProfessionalPaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Text('Payments', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          const Expanded(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: EmptyState(
                  title: 'No payments yet',
                  subtitle: 'Earnings and payout history appear here once consultations are completed.',
                  icon: Icons.currency_rupee_rounded,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
