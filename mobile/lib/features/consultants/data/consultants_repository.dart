import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';

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
        .select('*, users(full_name, avatar_url)')
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

  Future<ProfessionalProfile?> getById(String id) async {
    final row = await _supabase
        .from('professional_profiles')
        .select('*, users(full_name, avatar_url)')
        .eq('id', id)
        .maybeSingle();

    if (row == null) return null;
    return ProfessionalProfile.fromJson(Map<String, dynamic>.from(row));
  }

  Future<List<Map<String, dynamic>>> getAvailability(String profileId) async {
    final rows = await _supabase
        .from('professional_availability')
        .select()
        .eq('professional_id', profileId)
        .order('day_of_week');

    return (rows as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }
}

final consultantsListProvider = FutureProvider<List<ProfessionalProfile>>((ref) async {
  return ref.watch(consultantsRepositoryProvider).search();
});

final consultantDetailProvider =
    FutureProvider.family<ProfessionalProfile?, String>((ref, id) async {
  return ref.watch(consultantsRepositoryProvider).getById(id);
});
