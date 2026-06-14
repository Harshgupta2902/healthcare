import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../core/services/cache_service.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';
import '../../auth/providers/auth_providers.dart';

final professionalRepositoryProvider = Provider<ProfessionalRepository>((ref) {
  return ProfessionalRepository(
    supabase: ref.watch(supabaseClientProvider),
    cache: ref.watch(cacheServiceProvider),
  );
});

class ProfessionalDashboardData {
  const ProfessionalDashboardData({
    required this.profile,
    required this.qualifications,
    required this.availability,
    required this.appointments,
    required this.guestAppointments,
    required this.clients,
    this.fromCache = false,
  });

  final ProfessionalProfile profile;
  final List<ProfessionalQualification> qualifications;
  final List<AvailabilitySlot> availability;
  final List<AppointmentItem> appointments;
  final List<GuestAppointmentItem> guestAppointments;
  final List<AppUser> clients;
  final bool fromCache;
}

class ProfessionalRepository {
  ProfessionalRepository({
    required SupabaseClient supabase,
    required CacheService cache,
  })  : _supabase = supabase,
        _cache = cache;

  final SupabaseClient _supabase;
  final CacheService _cache;

  String? get _userId => _supabase.auth.currentUser?.id;

  Future<ProfessionalDashboardData> getDashboardData(
      {bool allowCache = true}) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    try {
      final data = await _fetchDashboard(uid);
      return data;
    } catch (e) {
      if (allowCache) {
        final cached = _cache.getCachedProfessionalDashboard();
        if (cached != null) {
          // Minimal cache replay — profile + counts only if stored
        }
      }
      rethrow;
    }
  }

  Future<ProfessionalDashboardData> _fetchDashboard(String uid) async {
    final results = await Future.wait([
      _supabase
          .from('professional_profiles')
          .select('*, users(name, image)')
          .eq('user_id', uid)
          .maybeSingle(),
      _supabase
          .from('professional_qualifications')
          .select()
          .eq('professional_id', uid)
          .order('created_at', ascending: false),
      _supabase
          .from('professional_availability')
          .select()
          .eq('professional_id', uid)
          .order('day_of_week'),
      _supabase
          .from('appointments')
          .select(
            '*, client:users!appointments_client_id_fkey(name, email), professional:users!appointments_professional_id_fkey(name)',
          )
          .eq('professional_id', uid)
          .order('start_time', ascending: true),
      _supabase
          .from('guest_appointments')
          .select()
          .eq('professional_id', uid)
          .order('created_at', ascending: false),
    ]);

    final profileRow = results[0] as Map<String, dynamic>?;
    final profile = profileRow != null
        ? ProfessionalProfile.fromJson(profileRow)
        : await ensureProfessionalProfile(uid);

    final qualifications = (results[1] as List)
        .map((e) => ProfessionalQualification.fromJson(
            Map<String, dynamic>.from(e as Map)))
        .toList();

    final availability = (results[2] as List)
        .map((e) =>
            AvailabilitySlot.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final appointments = (results[3] as List)
        .map((e) =>
            AppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final guestAppointments = (results[4] as List)
        .map((e) =>
            GuestAppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final clientIds = appointments
        .map((a) => a.clientId)
        .whereType<String>()
        .toSet()
        .toList();
    final clients = await _fetchClients(clientIds);

    return ProfessionalDashboardData(
      profile: profile,
      qualifications: qualifications,
      availability: availability,
      appointments: appointments,
      guestAppointments: guestAppointments,
      clients: clients,
    );
  }

  Future<List<AppUser>> _fetchClients(List<String> clientIds) async {
    if (clientIds.isEmpty) return [];
    final rows = await _supabase
        .from('users')
        .select('id, email, name, image, role, phone')
        .inFilter('id', clientIds);
    return (rows as List)
        .map((e) => AppUser.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<ProfessionalProfile?> getProfile() async {
    final uid = _userId;
    if (uid == null) return null;
    final row = await _supabase
        .from('professional_profiles')
        .select('*, users(name, image)')
        .eq('user_id', uid)
        .maybeSingle();
    if (row == null) {
      try {
        return await ensureProfessionalProfile(uid);
      } catch (_) {
        return null;
      }
    }
    return ProfessionalProfile.fromJson(Map<String, dynamic>.from(row));
  }

  /// Creates a stub profile when a professional user has no `professional_profiles` row yet.
  Future<ProfessionalProfile> ensureProfessionalProfile(String uid) async {
    final existing = await _supabase
        .from('professional_profiles')
        .select('*, users(name, image)')
        .eq('user_id', uid)
        .maybeSingle();
    if (existing != null) {
      return ProfessionalProfile.fromJson(Map<String, dynamic>.from(existing));
    }

    await _supabase.from('professional_profiles').upsert({
      'user_id': uid,
      'specialization': 'General practice',
      'license_number': 'Pending',
      'is_verified': false,
    }, onConflict: 'user_id');

    final row = await _supabase
        .from('professional_profiles')
        .select('*, users(name, image)')
        .eq('user_id', uid)
        .single();

    return ProfessionalProfile.fromJson(Map<String, dynamic>.from(row));
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');
    await _supabase
        .from('professional_profiles')
        .update(data)
        .eq('user_id', uid);
  }

  Future<ProfessionalQualification> addQualification({
    required String degree,
    required String institution,
    int? year,
    Uint8List? documentBytes,
    String? fileName,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    String? documentUrl;
    if (documentBytes != null && fileName != null) {
      final ext = fileName.contains('.') ? fileName.split('.').last : 'pdf';
      final path = '$uid/${const Uuid().v4()}.$ext';
      await _supabase.storage.from('qualifications').uploadBinary(
            path,
            documentBytes,
            fileOptions: const FileOptions(upsert: false),
          );
      documentUrl = _supabase.storage.from('qualifications').getPublicUrl(path);
    }

    final row = await _supabase
        .from('professional_qualifications')
        .insert({
          'professional_id': uid,
          'degree': degree,
          'institution': institution,
          if (year != null) 'year': year,
          if (documentUrl != null) 'document_url': documentUrl,
        })
        .select()
        .single();

    return ProfessionalQualification.fromJson(Map<String, dynamic>.from(row));
  }

  Future<void> deleteQualification(String id) async {
    await _supabase.from('professional_qualifications').delete().eq('id', id);
  }

  Future<AvailabilitySlot> addAvailabilitySlot(AvailabilitySlot slot) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final row = await _supabase
        .from('professional_availability')
        .insert(slot.toInsertPayload(uid))
        .select()
        .single();

    return AvailabilitySlot.fromJson(Map<String, dynamic>.from(row));
  }

  Future<void> updateAvailabilitySlot(
      String id, Map<String, dynamic> data) async {
    await _supabase.from('professional_availability').update(data).eq('id', id);
  }

  Future<void> deleteAvailabilitySlot(String id) async {
    await _supabase.from('professional_availability').delete().eq('id', id);
  }

  Future<void> updateAppointmentStatus(String id, String status) async {
    await _supabase
        .from('appointments')
        .update({'status': status}).eq('id', id);
  }

  Future<List<GuestAppointmentItem>> getGuestAppointments() async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final rows = await _supabase
        .from('guest_appointments')
        .select()
        .eq('professional_id', uid)
        .order('created_at', ascending: false);

    return (rows as List)
        .map((e) =>
            GuestAppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}

final professionalDashboardProvider =
    FutureProvider<ProfessionalDashboardData>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(professionalRepositoryProvider).getDashboardData();
});

final professionalGuestAppointmentsProvider =
    FutureProvider<List<GuestAppointmentItem>>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(professionalRepositoryProvider).getGuestAppointments();
});
