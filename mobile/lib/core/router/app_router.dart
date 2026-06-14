import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/providers/auth_providers.dart';
import '../../features/auth/screens/admin_web_only_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/booking/screens/book_consultation_screen.dart';
import '../../features/booking/screens/booking_success_screen.dart';
import '../../features/client/screens/client_profile_edit_screen.dart';
import '../../features/consultants/screens/consultant_detail_screen.dart';
import '../../features/consultants/screens/consultants_list_screen.dart';
import '../../features/contact/screens/contact_screen.dart';
import '../../features/dashboard/screens/dashboard_shell.dart';
import '../../features/auth/screens/welcome_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/onboarding/screens/splash_screen.dart';
import '../../features/professional/screens/prescription_screen.dart';
import '../../features/profile/screens/notifications_screen.dart';
import '../../features/profile/screens/settings_screen.dart';
import '../../shared/models/models.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  final appUser = ref.watch(currentAppUserProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoading = authState.isLoading || appUser.isLoading;
      final location = state.matchedLocation;

      if (location == '/splash') return null;
      if (isLoading) return null;

      final session = authState.valueOrNull?.session;
      final role = appUser.valueOrNull?.role;
      final isAuthRoute = location == '/login' ||
          location == '/register' ||
          location == '/forgot-password' ||
          location == '/onboarding' ||
          location == '/welcome';

      final isPublicRoute = location.startsWith('/book/') ||
          location.startsWith('/booking/success/') ||
          location == '/contact';

      if (session == null) {
        if (isAuthRoute || location == '/onboarding' || location == '/welcome' || isPublicRoute) return null;
        return '/login';
      }

      if (role == UserRole.admin) {
        if (location != '/admin-web-only') return '/admin-web-only';
        return null;
      }

      if (isAuthRoute) return '/home';
      if (location == '/admin-web-only') return '/home';

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(path: '/admin-web-only', builder: (_, __) => const AdminWebOnlyScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/settings/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/contact', builder: (_, __) => const ContactScreen()),
      GoRoute(path: '/profile/edit', builder: (_, __) => const ClientProfileEditScreen()),
      GoRoute(
        path: '/book/:professionalUserId',
        builder: (_, state) => BookConsultationScreen(
          professionalUserId: state.pathParameters['professionalUserId']!,
        ),
      ),
      GoRoute(
        path: '/booking/success/:id',
        builder: (_, state) => BookingSuccessScreen(
          bookingId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/prescription/:guestAppointmentId',
        builder: (_, state) => PrescriptionScreen(
          guestAppointmentId: state.pathParameters['guestAppointmentId']!,
        ),
      ),
      GoRoute(
        path: '/consultants/:userId',
        builder: (_, state) => ConsultantDetailScreen(
          userId: state.pathParameters['userId']!,
        ),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (_, __, child) => DashboardShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/book', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/my-doctor', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/chat', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/appointments', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/consultants', builder: (_, __) => const ConsultantsListScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const SizedBox.shrink()),
        ],
      ),
    ],
  );
});

class OnboardingPrefs {
  static const _key = 'onboarding_complete';

  static Future<bool> isComplete() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_key) ?? false;
  }

  static Future<void> setComplete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, true);
  }
}
