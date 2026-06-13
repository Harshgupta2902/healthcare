import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/dio_client.dart';
import '../../core/supabase/supabase_client.dart';
import '../../shared/models/models.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    supabase: ref.watch(supabaseClientProvider),
    dio: ref.watch(dioProvider),
  );
});

class AuthRepository {
  AuthRepository({required SupabaseClient supabase, required Dio dio})
      : _supabase = supabase,
        _dio = dio;

  final SupabaseClient _supabase;
  final Dio _dio;

  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  User? get currentUser => _supabase.auth.currentUser;

  Future<AppUser?> getCurrentAppUser() async {
    final user = currentUser;
    if (user == null) return null;
    return _fetchAppUser(user);
  }

  Future<AppUser> signIn({required String email, required String password}) async {
    final response = await _supabase.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
    final user = response.user;
    if (user == null) throw const AuthException('Sign in failed');

    await _syncSession();
    return _fetchAppUser(user);
  }

  Future<AppUser> signUp({
    required String email,
    required String password,
    required String fullName,
    required UserRole role,
  }) async {
    if (role == UserRole.admin) {
      throw const AuthException('Admin accounts cannot be created on mobile');
    }

    final roleStr = role == UserRole.professional ? 'professional' : 'client';

    final response = await _supabase.auth.signUp(
      email: email.trim(),
      password: password,
      data: {'name': fullName.trim(), 'role': roleStr},
    );

    final user = response.user;
    if (user == null) throw const AuthException('Sign up failed');

    // Ensure public.users row has correct role (trigger may create default).
    await _supabase.from('users').upsert({
      'id': user.id,
      'email': email.trim(),
      'full_name': fullName.trim(),
      'role': roleStr,
    });

    await _syncSession();
    return _fetchAppUser(user);
  }

  Future<void> resetPassword(String email) async {
    await _supabase.auth.resetPasswordForEmail(email.trim());
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  Future<void> _syncSession() async {
    try {
      await _dio.post(ApiEndpoints.syncSession);
    } on DioException {
      // API route may not exist yet — role still readable from users table.
    }
  }

  Future<AppUser> _fetchAppUser(User user) async {
    final row = await _supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', user.id)
        .maybeSingle();

    return AppUser.fromSupabaseRow(
      authId: user.id,
      email: user.email ?? row?['email'] as String? ?? '',
      usersRow: row,
      metadata: user.userMetadata,
    );
  }
}
