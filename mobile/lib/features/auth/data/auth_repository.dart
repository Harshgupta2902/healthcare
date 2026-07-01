import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:healthhere_mobile/core/network/api_repository.dart';
import 'package:healthhere_mobile/core/supabase/supabase_client.dart';
import 'package:healthhere_mobile/features/auth/data/registration_settings_service.dart';
import 'package:healthhere_mobile/features/auth/models/registration_settings.dart';
import 'package:healthhere_mobile/shared/models/models.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    supabase: ref.watch(supabaseClientProvider),
    api: ref.watch(apiRepositoryProvider),
  );
});

class AuthRepository {
  AuthRepository({
    required SupabaseClient supabase,
    required ApiRepository api,
  })  : _supabase = supabase,
        _api = api;

  final SupabaseClient _supabase;
  final ApiRepository _api;

  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  User? get currentUser => _supabase.auth.currentUser;

  Future<AppUser?> getCurrentAppUser() async {
    final user = currentUser;
    if (user == null) return null;
    return _fetchAppUser(user);
  }

  Future<RegistrationSettings> getRegistrationSettings() {
    return RegistrationSettingsService.load();
  }

  Future<RegisterOtpSentResult> requestRegistrationOtp({
    required String email,
    required String password,
    required String name,
    required UserRole role,
  }) {
    if (role == UserRole.admin) {
      throw const AuthException('Admin accounts cannot be created on mobile');
    }
    return _api.requestRegistrationOtp(
      email: email,
      password: password,
      name: name,
      role: _roleToApi(role),
    );
  }

  Future<AppUser> completeRegistration({
    required String email,
    required String password,
    required String name,
    required UserRole role,
    String? otp,
  }) async {
    if (role == UserRole.admin) {
      throw const AuthException('Admin accounts cannot be created on mobile');
    }

    if (otp != null && otp.trim().isNotEmpty) {
      await _api.verifyOtpAndSignUp(
        email: email,
        password: password,
        name: name,
        role: _roleToApi(role),
        otp: otp,
      );
      return signIn(email: email, password: password);
    }

    final settings = await RegistrationSettingsService.load();
    if (settings.emailOtpEnabled) {
      throw const AuthException(
        'Email verification is required. Please request a verification code first.',
      );
    }

    return _signUpDirect(
      email: email,
      password: password,
      name: name,
      role: role,
    );
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

  Future<AppUser> _signUpDirect({
    required String email,
    required String password,
    required String name,
    required UserRole role,
  }) async {
    final roleStr = _roleToApi(role);
    final response = await _supabase.auth.signUp(
      email: email.trim(),
      password: password,
      data: {'name': name.trim(), 'role': roleStr},
    );

    final user = response.user;
    if (user == null) throw const AuthException('Sign up failed');

    if (response.session != null) {
      await _syncSession();
      return _fetchAppUser(user);
    }

    return signIn(email: email, password: password);
  }

  Future<void> _syncSession() async {
    try {
      await _api.syncSession();
    } catch (_) {
      // Best-effort JWT role sync; users row is created by DB trigger.
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

  String _roleToApi(UserRole role) {
    return role == UserRole.professional ? 'professional' : 'client';
  }
}
