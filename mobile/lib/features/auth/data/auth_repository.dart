import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:healthhere_mobile/core/network/api_endpoints.dart';
import 'package:healthhere_mobile/core/network/api_repository.dart';
import 'package:healthhere_mobile/core/network/dio_client.dart';
import 'package:healthhere_mobile/core/supabase/supabase_client.dart';
import 'package:healthhere_mobile/shared/models/models.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    supabase: ref.watch(supabaseClientProvider),
    dio: ref.watch(dioProvider),
    api: ref.watch(apiRepositoryProvider),
  );
});

class AuthRepository {
  AuthRepository({
    required SupabaseClient supabase,
    required Dio dio,
    required ApiRepository api,
  })  : _supabase = supabase,
        _dio = dio,
        _api = api;

  final SupabaseClient _supabase;
  final Dio _dio;
  final ApiRepository _api;

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
    required String name,
    required UserRole role,
  }) async {
    if (role == UserRole.admin) {
      throw const AuthException('Admin accounts cannot be created on mobile');
    }

    final roleStr = role == UserRole.professional ? 'professional' : 'client';

    final response = await _supabase.auth.signUp(
      email: email.trim(),
      password: password,
      data: {'name': name.trim(), 'role': roleStr},
    );

    final user = response.user;
    if (user == null) throw const AuthException('Sign up failed');

    await _supabase.from('users').upsert({
      'id': user.id,
      'email': email.trim(),
      'name': name.trim(),
      'role': roleStr,
    });

    if (role == UserRole.professional) {
      await _supabase.from('professional_profiles').upsert({
        'user_id': user.id,
        'specialization': 'General practice',
        'license_number': 'Pending',
        'is_verified': false,
      }, onConflict: 'user_id');
    }

    await _syncSession();
    return _fetchAppUser(user);
  }

  Future<void> updateUserProfile({
    String? name,
    String? phone,
    String? image,
  }) async {
    final uid = currentUser?.id;
    if (uid == null) throw const AuthException('Not authenticated');

    final payload = <String, dynamic>{'id': uid};
    if (name != null) payload['name'] = name;
    if (phone != null) payload['phone'] = phone;
    if (image != null) payload['image'] = image;

    await _supabase.from('users').upsert(payload);
  }

  Future<String> uploadProfileImage(String filePath, List<int> bytes) async {
    final uid = currentUser?.id;
    if (uid == null) throw const AuthException('Not authenticated');

    final ext = filePath.split('.').last;
    final path = '$uid/avatar.$ext';
    await _supabase.storage.from('avatars').uploadBinary(
          path,
          Uint8List.fromList(bytes),
          fileOptions: const FileOptions(upsert: true),
        );
    return _supabase.storage.from('avatars').getPublicUrl(path);
  }

  Future<void> resetPassword(String email) async {
    await _supabase.auth.resetPasswordForEmail(email.trim());
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  Future<void> _syncSession() async {
    try {
      await _api.syncSession();
    } on DioException {
      try {
        await _dio.post(ApiEndpoints.syncSession);
      } on DioException {
        // API route may be unavailable — role still readable from users table.
      }
    }
  }

  Future<AppUser> _fetchAppUser(User user) async {
    final row = await _supabase
        .from('users')
        .select('id, email, name, image, role, phone')
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
