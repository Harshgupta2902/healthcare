import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';
import '../../auth/providers/auth_providers.dart';

final clientRepositoryProvider = Provider<ClientRepository>((ref) {
  return ClientRepository(supabase: ref.watch(supabaseClientProvider));
});

class ClientDashboardData {
  const ClientDashboardData({
    required this.appointmentsCount,
    required this.conditionsCount,
    required this.medicationsCount,
    required this.upcomingAppointments,
    required this.medicalHistory,
    required this.medications,
  });

  final int appointmentsCount;
  final int conditionsCount;
  final int medicationsCount;
  final List<AppointmentItem> upcomingAppointments;
  final List<MedicalHistoryItem> medicalHistory;
  final List<MedicationItem> medications;
}

class ClientRepository {
  ClientRepository({required SupabaseClient supabase}) : _supabase = supabase;

  final SupabaseClient _supabase;

  String? get _userId => _supabase.auth.currentUser?.id;

  Future<ClientDashboardData> getDashboardData() async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final appointments = await _supabase
        .from('appointments')
        .select('*, professional_profiles(users(full_name))')
        .eq('client_id', uid)
        .order('scheduled_at', ascending: true);

    final history = await _supabase
        .from('medical_history')
        .select()
        .eq('user_id', uid)
        .order('created_at', ascending: false);

    final medications = await _supabase
        .from('medications')
        .select()
        .eq('user_id', uid)
        .order('created_at', ascending: false);

    final appointmentList = (appointments as List)
        .map((e) => AppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final now = DateTime.now();
    final upcoming = appointmentList
        .where((a) => a.scheduledAt.isAfter(now))
        .take(5)
        .toList();

    return ClientDashboardData(
      appointmentsCount: appointmentList.length,
      conditionsCount: (history as List).length,
      medicationsCount: (medications as List).length,
      upcomingAppointments: upcoming,
      medicalHistory: (history as List)
          .map((e) => MedicalHistoryItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      medications: (medications as List)
          .map((e) => MedicationItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  Future<Map<String, dynamic>?> getMedicalProfile() async {
    final uid = _userId;
    if (uid == null) return null;

    return await _supabase
        .from('client_medical_profiles')
        .select()
        .eq('user_id', uid)
        .maybeSingle();
  }

  Future<void> updateMedicalProfile(Map<String, dynamic> data) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    await _supabase.from('client_medical_profiles').upsert({
      'user_id': uid,
      ...data,
    });
  }

  Future<void> addMedicalCondition({
    required String condition,
    String? diagnosedDate,
    String? notes,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    await _supabase.from('medical_history').insert({
      'user_id': uid,
      'condition': condition,
      if (diagnosedDate != null) 'diagnosed_date': diagnosedDate,
      if (notes != null) 'notes': notes,
    });
  }

  Future<void> deleteMedicalCondition(String id) async {
    await _supabase.from('medical_history').delete().eq('id', id);
  }

  Future<void> addMedication({
    required String name,
    String? dosage,
    String? frequency,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    await _supabase.from('medications').insert({
      'user_id': uid,
      'name': name,
      if (dosage != null) 'dosage': dosage,
      if (frequency != null) 'frequency': frequency,
    });
  }

  Future<void> deleteMedication(String id) async {
    await _supabase.from('medications').delete().eq('id', id);
  }
}

final clientDashboardProvider = FutureProvider<ClientDashboardData>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(clientRepositoryProvider).getDashboardData();
});
