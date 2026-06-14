import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/glass_nav_bar.dart';
import '../../auth/providers/auth_providers.dart';
import '../../client/screens/appointments_screen.dart';
import '../../client/screens/book_screen.dart';
import '../../client/screens/chat_screen.dart';
import '../../client/screens/client_account_screen.dart';
import '../../client/screens/client_home_screen.dart';
import '../../client/screens/my_doctor_screen.dart';
import '../../professional/screens/professional_account_screen.dart';
import '../../professional/screens/professional_book_screen.dart';
import '../../professional/screens/professional_home_screen.dart';
import '../../professional/screens/professional_my_doctor_screen.dart';

class DashboardShell extends ConsumerWidget {
  const DashboardShell({super.key, required this.child});

  final Widget child;

  /// Shared bottom nav for client and professional roles.
  static const shellTabs = [
    GlassNavDestination(label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home_rounded),
    GlassNavDestination(
      label: 'Book',
      icon: Icons.calendar_today_outlined,
      selectedIcon: Icons.calendar_today_rounded,
    ),
    GlassNavDestination(
      label: 'My doctor',
      icon: Icons.medical_information_outlined,
      selectedIcon: Icons.medical_information_rounded,
      centerFab: true,
    ),
    GlassNavDestination(
      label: 'Chat',
      icon: Icons.chat_bubble_outline,
      selectedIcon: Icons.chat_bubble_rounded,
    ),
    GlassNavDestination(label: 'Profile', icon: Icons.person_outline, selectedIcon: Icons.person_rounded),
  ];

  static const shellPaths = ['/home', '/book', '/my-doctor', '/chat', '/profile'];

  int _indexFromLocation(String location) {
    for (var i = 0; i < shellPaths.length; i++) {
      if (location.startsWith(shellPaths[i])) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);
    final isPro = role == UserRole.professional;
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = _indexFromLocation(location);

    Widget body;
    if (location.startsWith('/consultants/') && !location.endsWith('/consultants')) {
      body = child;
    } else if (isPro) {
      switch (location) {
        case '/home':
          body = const ProfessionalHomeScreen();
        case '/book':
          body = const ProfessionalBookScreen();
        case '/my-doctor':
          body = const ProfessionalMyDoctorScreen();
        case '/chat':
          body = const ChatScreen();
        case '/profile':
          body = const ProfessionalAccountScreen();
        case '/appointments':
          body = const AppointmentsScreen();
        default:
          body = const ProfessionalHomeScreen();
      }
    } else {
      switch (location) {
        case '/home':
          body = const ClientHomeScreen();
        case '/book':
          body = const BookScreen();
        case '/my-doctor':
          body = const MyDoctorScreen();
        case '/chat':
          body = const ChatScreen();
        case '/profile':
          body = const ClientAccountScreen();
        case '/appointments':
          body = const AppointmentsScreen();
        default:
          body = const ClientHomeScreen();
      }
    }

    final showBottomNav = !RegExp(r'^/consultants/[^/]+$').hasMatch(location) &&
        location != '/appointments';

    return Scaffold(
      extendBody: true,
      backgroundColor: AppColors.surface,
      body: AmbientBackground(child: body),
      bottomNavigationBar: showBottomNav
          ? GlassNavBar(
              selectedIndex: selectedIndex,
              onSelected: (i) => context.go(shellPaths[i]),
              destinations: shellTabs,
            )
          : null,
    );
  }
}
