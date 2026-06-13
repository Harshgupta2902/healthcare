import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/glass_nav_bar.dart';
import '../../auth/providers/auth_providers.dart';
import '../../blog/screens/blog_list_screen.dart';
import '../../client/screens/appointments_screen.dart';
import '../../client/screens/client_home_screen.dart';
import '../../client/screens/client_account_screen.dart';
import '../../professional/screens/professional_home_screen.dart';
import '../../professional/screens/professional_profile_screen.dart';

class DashboardShell extends ConsumerWidget {
  const DashboardShell({super.key, required this.child});

  final Widget child;

  static const _clientTabs = [
    GlassNavDestination(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home_rounded),
    GlassNavDestination(label: 'Visits', icon: Icons.event_outlined, selectedIcon: Icons.event_rounded),
    GlassNavDestination(
      label: 'Doctors',
      icon: Icons.people_outline,
      selectedIcon: Icons.people_rounded,
    ),
    GlassNavDestination(label: 'Blog', icon: Icons.article_outlined, selectedIcon: Icons.article_rounded),
    GlassNavDestination(
      label: 'Profile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person_rounded,
    ),
  ];

  static const _proTabs = [
    GlassNavDestination(
      label: 'Consults',
      icon: Icons.medical_services_outlined,
      selectedIcon: Icons.medical_services_rounded,
    ),
    GlassNavDestination(
      label: 'Calendar',
      icon: Icons.calendar_month_outlined,
      selectedIcon: Icons.calendar_month_rounded,
    ),
    GlassNavDestination(
      label: 'Network',
      icon: Icons.people_outline,
      selectedIcon: Icons.people_rounded,
    ),
    GlassNavDestination(label: 'Blog', icon: Icons.article_outlined, selectedIcon: Icons.article_rounded),
    GlassNavDestination(
      label: 'Profile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person_rounded,
    ),
  ];

  int _indexFromLocation(String location) {
    const paths = ['/home', '/appointments', '/consultants', '/blog', '/profile'];
    for (var i = 0; i < paths.length; i++) {
      if (location.startsWith(paths[i])) return i;
    }
    return 0;
  }

  String _pathForTab(int index, List<GlassNavDestination> tabs) {
    const paths = ['/home', '/appointments', '/consultants', '/blog', '/profile'];
    return paths[index];
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final isPro = role == UserRole.professional;
    final tabs = isPro ? _proTabs : _clientTabs;
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = _indexFromLocation(location);

    Widget body;
    if (location.startsWith('/consultants/') && !location.endsWith('/consultants')) {
      body = child;
    } else {
      switch (location) {
        case '/home':
          body = isPro ? const ProfessionalHomeScreen() : const ClientHomeScreen();
        case '/appointments':
          body = const AppointmentsScreen();
        case '/consultants':
          body = child;
        case '/blog':
          body = const BlogListScreen();
        case '/profile':
          body = isPro ? const ProfessionalProfileScreen() : const ClientAccountScreen();
        default:
          body = isPro ? const ProfessionalHomeScreen() : const ClientHomeScreen();
      }
    }

    final showBottomNav = !RegExp(r'^/consultants/[^/]+$').hasMatch(location);

    return Scaffold(
      extendBody: true,
      backgroundColor: AppColors.surface,
      body: AmbientBackground(child: body),
      bottomNavigationBar: showBottomNav
          ? GlassNavBar(
              selectedIndex: selectedIndex,
              onSelected: (i) => context.go(_pathForTab(i, tabs)),
              destinations: tabs,
            )
          : null,
    );
  }
}
