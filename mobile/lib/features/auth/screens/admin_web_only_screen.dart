import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/env.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/auth_repository.dart';

/// Admin accounts are not supported on mobile — web only.
class AdminWebOnlyScreen extends ConsumerWidget {
  const AdminWebOnlyScreen({super.key});

  Future<void> _openWebAdmin() async {
    final uri = Uri.parse(Env.adminWebUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(Icons.admin_panel_settings_outlined,
                    size: 36, color: AppColors.brand),
              ),
              const SizedBox(height: 24),
              Text('Admin access is web only', style: AppTypography.pageTitle, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Text(
                'The HealthHere mobile app is for patients and professionals. '
                'Please use the web admin panel to manage users, appointments, and content.',
                style: AppTypography.pageSubtitle,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              PrimaryGradientButton(
                label: 'Open web admin',
                icon: Icons.open_in_browser,
                onPressed: _openWebAdmin,
              ),
              const SizedBox(height: 12),
              SecondaryButton(
                label: 'Sign out',
                onPressed: () async {
                  await ref.read(authRepositoryProvider).signOut();
                  if (context.mounted) context.go('/login');
                },
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
