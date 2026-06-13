import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../auth/providers/auth_providers.dart';
import '../../client/screens/client_home_screen.dart';
import '../../client/screens/client_profile_screen.dart';
import '../../client/screens/appointments_screen.dart';
import '../../professional/screens/professional_home_screen.dart';
import '../../professional/screens/professional_profile_screen.dart';
import '../widgets/blog_placeholder_screen.dart';

class DashboardShell extends ConsumerWidget {
  const DashboardShell({super.key, required this.child});

  final Widget child;

  static const _clientTabs = [
    _TabItem('/home', 'Home', Icons.home_outlined, Icons.home_rounded),
    _TabItem('/appointments', 'Visits', Icons.event_outlined, Icons.event_rounded),
    _TabItem('/consultants', 'Doctors', Icons.people_outline, Icons.people_rounded),
    _TabItem('/blog', 'Blog', Icons.article_outlined, Icons.article_rounded),
    _TabItem('/profile', 'Profile', Icons.person_outline, Icons.person_rounded),
  ];

  static const _proTabs = [
    _TabItem('/home', 'Consults', Icons.medical_services_outlined, Icons.medical_services_rounded),
    _TabItem('/appointments', 'Calendar', Icons.calendar_month_outlined, Icons.calendar_month_rounded),
    _TabItem('/consultants', 'Network', Icons.people_outline, Icons.people_rounded),
    _TabItem('/blog', 'Blog', Icons.article_outlined, Icons.article_rounded),
    _TabItem('/profile', 'Profile', Icons.person_outline, Icons.person_rounded),
  ];

  int _indexFromLocation(String location) {
    final tabs = _clientTabs;
    for (var i = 0; i < tabs.length; i++) {
      if (location.startsWith(tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final isPro = role == UserRole.professional;
    final tabs = isPro ? _proTabs : _clientTabs;
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = _indexFromLocation(location);

    Widget body;
    if (location.startsWith('/consultants/')) {
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
          body = const BlogPlaceholderScreen();
        case '/profile':
          body = isPro ? const ProfessionalProfileScreen() : const ClientProfileScreen();
        default:
          body = isPro ? const ProfessionalHomeScreen() : const ClientHomeScreen();
      }
    }

    final showBottomNav = !location.contains(RegExp(r'^/consultants/[^/]+$'));

    return Scaffold(
      body: body,
      bottomNavigationBar: showBottomNav
          ? NavigationBar(
              selectedIndex: selectedIndex,
              onDestinationSelected: (i) => context.go(tabs[i].path),
              destinations: [
                for (final tab in tabs)
                  NavigationDestination(
                    icon: Icon(tab.icon),
                    selectedIcon: Icon(tab.selectedIcon, color: AppColors.brand),
                    label: tab.label,
                  ),
              ],
            )
          : null,
    );
  }
}

class _TabItem {
  const _TabItem(this.path, this.label, this.icon, this.selectedIcon);
  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
