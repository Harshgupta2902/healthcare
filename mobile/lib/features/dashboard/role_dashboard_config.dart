import 'package:flutter/material.dart';

import '../../shared/widgets/glass_nav_bar.dart';

/// Role-based bottom navigation (simplified from web dashboard).
abstract final class RoleDashboardConfig {
  static const clientTabs = [
    GlassNavDestination(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home_rounded),
    GlassNavDestination(label: 'Search', icon: Icons.search_rounded, selectedIcon: Icons.search_rounded),
    GlassNavDestination(label: 'History', icon: Icons.history_rounded, selectedIcon: Icons.history_rounded),
    GlassNavDestination(label: 'Profile', icon: Icons.person_outline, selectedIcon: Icons.person_rounded),
  ];

  static const clientPaths = ['/home', '/search', '/history', '/profile'];

  static const professionalTabs = [
    GlassNavDestination(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home_rounded),
    GlassNavDestination(
      label: 'Requests',
      icon: Icons.inbox_outlined,
      selectedIcon: Icons.inbox_rounded,
    ),
    GlassNavDestination(
      label: 'Calendar',
      icon: Icons.calendar_month_outlined,
      selectedIcon: Icons.calendar_month_rounded,
    ),
    GlassNavDestination(label: 'Clients', icon: Icons.people_outline, selectedIcon: Icons.people_rounded),
    GlassNavDestination(label: 'Profile', icon: Icons.person_outline, selectedIcon: Icons.person_rounded),
  ];

  static const professionalPaths = ['/home', '/requests', '/calendar', '/clients', '/profile'];

  static List<GlassNavDestination> tabsFor(bool isProfessional) =>
      isProfessional ? professionalTabs : clientTabs;

  static List<String> pathsFor(bool isProfessional) =>
      isProfessional ? professionalPaths : clientPaths;

  static int indexForPath(String location, bool isProfessional) {
    final paths = pathsFor(isProfessional);
    for (var i = 0; i < paths.length; i++) {
      if (location == paths[i] || location.startsWith('${paths[i]}/')) return i;
    }
    return 0;
  }

  static bool isShellPath(String location, bool isProfessional) {
    return pathsFor(isProfessional).any((p) => location == p || location.startsWith('$p/'));
  }
}
