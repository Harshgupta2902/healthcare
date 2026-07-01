import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';
import '../models/consultant_detail.dart';

final consultantsRepositoryProvider = Provider<ConsultantsRepository>((ref) {
  return ConsultantsRepository(supabase: ref.watch(supabaseClientProvider));
});

class ConsultantsRepository {
  ConsultantsRepository({required SupabaseClient supabase}) : _supabase = supabase;

  final SupabaseClient _supabase;

  Future<List<ProfessionalProfile>> search({
    String? specialty,
    String? city,
  }) async {
    var query = _supabase
        .from('professional_profiles')
        .select('*, users(name, image)')
        .eq('is_verified', true);

    if (specialty != null && specialty.isNotEmpty) {
      query = query.ilike('specialization', '%$specialty%');
    }
    if (city != null && city.isNotEmpty) {
      query = query.ilike('city', '%$city%');
    }

    final rows = await query.order('created_at', ascending: false);
    return (rows as List)
        .map((e) => ProfessionalProfile.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  /// [userId] is the public directory id (users.id).
  Future<ProfessionalProfile?> getByUserId(String userId) async {
    final detail = await getDetail(userId);
    return detail?.profile;
  }

  Future<ConsultantDetail?> getDetail(String userId) async {
    final results = await Future.wait([
      _supabase
          .from('professional_profiles')
          .select('*, users(name, image)')
          .eq('user_id', userId)
          .maybeSingle(),
      _supabase
          .from('professional_qualifications')
          .select('id, degree, institution, year, document_url, document_approved')
          .eq('professional_id', userId)
          .order('year', ascending: false),
    ]);

    final row = results[0];
    if (row == null) return null;

    final profile = ProfessionalProfile.fromJson(Map<String, dynamic>.from(row as Map));
    final qualifications = (results[1] as List)
        .map((e) => ProfessionalQualification.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    return ConsultantDetail(
      profile: profile,
      qualifications: qualifications,
      reviews: consultantFallbackReviews(profile.displayName),
    );
  }

  Future<List<AvailabilitySlot>> getAvailability(String userId) async {
    final rows = await _supabase
        .from('professional_availability')
        .select()
        .eq('professional_id', userId)
        .order('day_of_week');

    return (rows as List)
        .map((e) => AvailabilitySlot.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}

final consultantsListProvider = FutureProvider<List<ProfessionalProfile>>((ref) async {
  return ref.watch(consultantsRepositoryProvider).search();
});

final consultantDetailProvider =
    FutureProvider.family<ConsultantDetail?, String>((ref, userId) async {
  return ref.watch(consultantsRepositoryProvider).getDetail(userId);
});

final consultantAvailabilityProvider =
    FutureProvider.family<List<AvailabilitySlot>, String>((ref, userId) async {
  return ref.watch(consultantsRepositoryProvider).getAvailability(userId);
});
