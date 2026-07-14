import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/providers/auth_providers.dart';
import '../../features/auth/screens/admin_web_only_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/booking/screens/appointment_checkout_screen.dart';
import '../../features/booking/screens/book_consultation_screen.dart';
import '../../features/client/screens/client_dashboard_profile_screen.dart';
import '../../features/client/screens/client_profile_edit_screen.dart';
import '../../features/client/screens/profile/profile_document_upload_screen.dart';
import '../../features/client/screens/profile/profile_document_upload_success_screen.dart';
import '../../features/client/screens/profile/profile_documents_hub_screen.dart';
import '../../features/client/screens/profile/profile_orders_screen.dart';
import '../../features/client/screens/profile/profile_personal_info_screen.dart';
import '../../features/client/screens/profile/profile_requests_screen.dart';
import '../../features/consultants/screens/consultant_detail_screen.dart';
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

      final isBookForm = RegExp(r'^/book/[^/]+$').hasMatch(location);
      final isPublicRoute = isBookForm || location == '/contact';

      if (session == null) {
        if (isAuthRoute || location == '/onboarding' || location == '/welcome' || isPublicRoute) {
          return null;
        }
        if (location.contains('/checkout')) {
          return '/login?redirect=${Uri.encodeComponent(location)}';
        }
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
      GoRoute(path: '/profile/requests', builder: (_, __) => const ProfileRequestsScreen()),
      GoRoute(path: '/profile/orders', builder: (_, __) => const ProfileOrdersScreen()),
      GoRoute(path: '/profile/personal-info', builder: (_, __) => const ProfilePersonalInfoScreen()),
      GoRoute(
        path: '/profile/medical-history',
        builder: (_, __) => const ProfileMedicalHistoryScreen(),
      ),
      GoRoute(
        path: '/profile/medications',
        builder: (_, __) => const ProfileMedicationsScreen(),
      ),
      GoRoute(path: '/profile/insurance', builder: (_, __) => const ProfileInsuranceScreen()),
      GoRoute(path: '/profile/documents', builder: (_, __) => const ProfileDocumentsHubScreen()),
      GoRoute(
        path: '/profile/documents/upload',
        builder: (_, __) => const ProfileDocumentUploadScreen(),
        routes: [
          GoRoute(
            path: 'success',
            builder: (_, __) => const ProfileDocumentUploadSuccessScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/book/:professionalUserId',
        builder: (_, state) => BookConsultationScreen(
          professionalUserId: state.pathParameters['professionalUserId']!,
        ),
        routes: [
          GoRoute(
            path: 'checkout',
            builder: (_, state) => AppointmentCheckoutScreen(
              professionalUserId: state.pathParameters['professionalUserId']!,
            ),
          ),
        ],
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
          GoRoute(path: '/search', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/history', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/profile', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/requests', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/calendar', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/clients', builder: (_, __) => const SizedBox.shrink()),
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
