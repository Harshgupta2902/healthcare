import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/glass_nav_bar.dart';
import '../../auth/providers/auth_providers.dart';
import '../../client/screens/appointments_screen.dart';
import '../../client/screens/client_dashboard_profile_screen.dart';
import '../../client/screens/client_home_screen.dart';
import '../../consultants/screens/consultants_list_screen.dart';
import '../../professional/screens/professional_consultations_screen.dart';
import '../../professional/screens/professional_dashboard_profile_screen.dart';
import '../../professional/screens/professional_home_screen.dart';
import '../../professional/screens/professional_profile_screen.dart';
import '../role_dashboard_config.dart';

/// Role-aware shell: client Home·Search·History·Profile, pro Home·Requests·Calendar·Clients·Profile.
class DashboardShell extends ConsumerWidget {
  const DashboardShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final isPro = role == UserRole.professional;
    final location = GoRouterState.of(context).uri.path;
    final tabs = RoleDashboardConfig.tabsFor(isPro);
    final paths = RoleDashboardConfig.pathsFor(isPro);
    final selectedIndex = RoleDashboardConfig.indexForPath(location, isPro);

    final body = isPro
        ? switch (location) {
            '/home' => const ProfessionalHomeScreen(),
            '/requests' => const ProfessionalConsultationsScreen(),
            '/calendar' => const ProfessionalSectionScreen(section: ProfessionalSection.calendar),
            '/clients' => const ProfessionalSectionScreen(section: ProfessionalSection.clients),
            '/profile' => const ProfessionalDashboardProfileScreen(),
            _ => const ProfessionalHomeScreen(),
          }
        : switch (location) {
            '/home' => const ClientHomeScreen(),
            '/search' => const ConsultantsListScreen(),
            '/history' => const AppointmentsScreen(),
            '/profile' => const ClientDashboardProfileScreen(),
            _ => const ClientHomeScreen(),
          };

    return Scaffold(
      extendBody: true,
      backgroundColor: AppColors.surface,
      body: AmbientBackground(child: body),
      bottomNavigationBar: GlassNavBar(
        selectedIndex: selectedIndex,
        onSelected: (i) => context.go(paths[i]),
        destinations: tabs,
      ),
    );
  }
}
