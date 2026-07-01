import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_providers.dart';
import '../widgets/profile_menu_row.dart';
import 'client_profile_screen.dart';
import 'profile/profile_documents_hub_screen.dart';

/// Patient profile tab — reference menu hub (avatar + navigation list).
class ClientDashboardProfileScreen extends ConsumerWidget {
  const ClientDashboardProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;

    return ColoredBox(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            Center(
              child: CircleAvatar(
                radius: 52,
                backgroundColor: AppColors.surfaceContainer,
                backgroundImage: user?.image != null
                    ? CachedNetworkImageProvider(user!.image!)
                    : null,
                child: user?.image == null
                    ? Text(
                        (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                        style: AppTypography.pageTitle.copyWith(
                          fontSize: 32,
                          color: AppColors.brand,
                        ),
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                user?.name ?? 'Patient',
                style: AppTypography.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 28),
            Expanded(
              child: ListView(
                children: [
                  ProfileMenuRow(
                    icon: Icons.favorite_outline,
                    label: 'Requests',
                    onTap: () => context.push('/profile/requests'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.receipt_long_outlined,
                    label: 'Orders',
                    onTap: () => context.push('/profile/orders'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.person_outline,
                    label: 'Personal Information',
                    onTap: () => context.push('/profile/personal-info'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.history_edu_outlined,
                    label: 'Medical History',
                    onTap: () => context.push('/profile/medical-history'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.medication_outlined,
                    label: 'Medications',
                    onTap: () => context.push('/profile/medications'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.shield_outlined,
                    label: 'Insurance',
                    onTap: () => context.push('/profile/insurance'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.folder_outlined,
                    label: 'Documents',
                    onTap: () => context.push('/profile/documents'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.settings_outlined,
                    label: 'Settings',
                    onTap: () => context.push('/settings'),
                  ),
                  const ProfileMenuDivider(),
                  ProfileMenuRow(
                    icon: Icons.logout_rounded,
                    label: 'Logout',
                    destructive: true,
                    iconColor: AppColors.error,
                    onTap: () async {
                      await ref.read(authRepositoryProvider).signOut();
                      if (context.mounted) context.go('/login');
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Full-screen health section wrappers routed from profile menu.
class ProfileMedicalHistoryScreen extends StatelessWidget {
  const ProfileMedicalHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Medical History', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: const ClientHealthSectionScreen(
        section: ClientHealthSection.history,
        showTitle: false,
      ),
    );
  }
}

class ProfileMedicationsScreen extends StatelessWidget {
  const ProfileMedicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Medications', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: const ClientHealthSectionScreen(
        section: ClientHealthSection.medications,
        showTitle: false,
      ),
    );
  }
}

class ProfileInsuranceScreen extends StatelessWidget {
  const ProfileInsuranceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Insurance', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: const ClientHealthSectionScreen(
        section: ClientHealthSection.insurance,
        showTitle: false,
      ),
    );
  }
}

class ProfileDocumentsScreen extends StatelessWidget {
  const ProfileDocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ProfileDocumentsHubScreen();
  }
}
