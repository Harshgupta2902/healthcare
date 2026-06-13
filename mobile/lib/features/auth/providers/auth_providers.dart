import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../shared/models/models.dart';
import '../data/auth_repository.dart';

final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
});

final currentAppUserProvider = FutureProvider<AppUser?>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(authRepositoryProvider).getCurrentAppUser();
});

final userRoleProvider = Provider<UserRole?>((ref) {
  return ref.watch(currentAppUserProvider).valueOrNull?.role;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  final auth = ref.watch(authStateProvider).valueOrNull;
  return auth?.session != null;
});
