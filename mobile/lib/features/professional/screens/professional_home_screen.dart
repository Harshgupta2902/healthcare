import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';

class ProfessionalHomeScreen extends ConsumerWidget {
  const ProfessionalHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'Dr. ${user?.fullName ?? 'Professional'}',
              subtitle: 'Consultations overview',
            ),
            const Expanded(
              child: EmptyState(
                title: 'Consultations',
                subtitle: 'Appointment list and status updates via Supabase SDK — same as web professional tab.',
                icon: Icons.medical_services_outlined,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
