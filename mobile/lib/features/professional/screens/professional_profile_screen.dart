import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/section_header.dart';
import '../../auth/providers/auth_providers.dart';

class ProfessionalProfileScreen extends ConsumerWidget {
  const ProfessionalProfileScreen({super.key});

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
              title: 'Professional profile',
              subtitle: user?.email ?? '',
              actionLabel: 'Settings',
              onAction: () => context.push('/settings'),
            ),
            const Expanded(
              child: EmptyState(
                title: 'Credentials & availability',
                subtitle: 'Qualifications, calendar, and client list — Phase 2 via Supabase SDK.',
                icon: Icons.badge_outlined,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
