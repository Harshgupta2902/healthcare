import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../core/services/cache_service.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';
import '../../auth/providers/auth_providers.dart';

final clientRepositoryProvider = Provider<ClientRepository>((ref) {
  return ClientRepository(
    supabase: ref.watch(supabaseClientProvider),
    cache: ref.watch(cacheServiceProvider),
  );
});

class ClientDashboardData {
  const ClientDashboardData({
    required this.appointmentsCount,
    required this.conditionsCount,
    required this.medicationsCount,
    required this.documentsCount,
    required this.upcomingAppointments,
    required this.allAppointments,
    required this.medicalHistory,
    required this.medications,
    required this.documents,
    required this.insurance,
    this.medicalProfile,
    this.fromCache = false,
  });

  final int appointmentsCount;
  final int conditionsCount;
  final int medicationsCount;
  final int documentsCount;
  final List<AppointmentItem> upcomingAppointments;
  final List<AppointmentItem> allAppointments;
  final List<MedicalHistoryItem> medicalHistory;
  final List<MedicationItem> medications;
  final List<MedicalDocumentItem> documents;
  final List<InsuranceItem> insurance;
  final ClientMedicalProfile? medicalProfile;
  final bool fromCache;

  Map<String, dynamic> toCacheJson() => {
        'appointmentsCount': appointmentsCount,
        'conditionsCount': conditionsCount,
        'medicationsCount': medicationsCount,
        'documentsCount': documentsCount,
        'upcomingAppointments':
            upcomingAppointments.map(_appointmentToJson).toList(),
        'allAppointments': allAppointments.map(_appointmentToJson).toList(),
        'medicalHistory': medicalHistory.map(_historyToJson).toList(),
        'medications': medications.map(_medicationToJson).toList(),
        'documents': documents.map(_documentToJson).toList(),
        'insurance': insurance.map(_insuranceToJson).toList(),
        'medicalProfile': medicalProfile != null
            ? {
                'date_of_birth': medicalProfile!.dateOfBirth,
                'gender': medicalProfile!.gender,
                'blood_type': medicalProfile!.bloodType,
                'height': medicalProfile!.height,
                'weight': medicalProfile!.weight,
                'address': medicalProfile!.address,
                'city': medicalProfile!.city,
                'state': medicalProfile!.state,
                'postal_code': medicalProfile!.postalCode,
                'emergency_contact_name': medicalProfile!.emergencyContactName,
                'emergency_contact_phone': medicalProfile!.emergencyContactPhone,
                'emergency_contact_relationship':
                    medicalProfile!.emergencyContactRelationship,
              }
            : null,
      };

  static ClientDashboardData fromCacheJson(Map<String, dynamic> json) {
    return ClientDashboardData(
      appointmentsCount: json['appointmentsCount'] as int? ?? 0,
      conditionsCount: json['conditionsCount'] as int? ?? 0,
      medicationsCount: json['medicationsCount'] as int? ?? 0,
      documentsCount: json['documentsCount'] as int? ?? 0,
      upcomingAppointments: (json['upcomingAppointments'] as List? ?? [])
          .map((e) => _appointmentFromJson(Map<String, dynamic>.from(e as Map)))
          .where((a) => a.isUpcomingForClientHome())
          .toList(),
      allAppointments: (json['allAppointments'] as List? ?? json['upcomingAppointments'] as List? ?? [])
          .map((e) => _appointmentFromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      medicalHistory: (json['medicalHistory'] as List? ?? [])
          .map((e) => MedicalHistoryItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      medications: (json['medications'] as List? ?? [])
          .map((e) => MedicationItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      documents: (json['documents'] as List? ?? [])
          .map((e) => MedicalDocumentItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      insurance: (json['insurance'] as List? ?? [])
          .map((e) => InsuranceItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      medicalProfile: ClientMedicalProfile.fromJson(
        json['medicalProfile'] as Map<String, dynamic>?,
      ),
      fromCache: true,
    );
  }
}

Map<String, dynamic> _appointmentToJson(AppointmentItem a) => {
      'id': a.id,
      'status': a.status,
      'start_time': a.startTime.toIso8601String(),
      'end_time': a.endTime.toIso8601String(),
      'client_id': a.clientId,
      'professional_id': a.professionalId,
      'appointment_type': a.appointmentType,
      'notes': a.notes,
      'meeting_url': a.meetingUrl,
      'professional': {'name': a.professionalName},
      'client': {'name': a.clientName},
    };

AppointmentItem _appointmentFromJson(Map<String, dynamic> json) =>
    AppointmentItem.fromJson(json);

Map<String, dynamic> _historyToJson(MedicalHistoryItem h) => {
      'id': h.id,
      'condition_name': h.conditionName,
      'diagnosis_date': h.diagnosisDate,
      'status': h.status,
      'notes': h.notes,
    };

Map<String, dynamic> _medicationToJson(MedicationItem m) => {
      'id': m.id,
      'medication_name': m.medicationName,
      'dosage': m.dosage,
      'frequency': m.frequency,
      'start_date': m.startDate,
      'end_date': m.endDate,
      'prescribing_doctor': m.prescribingDoctor,
      'notes': m.notes,
      'is_active': m.isActive,
    };

Map<String, dynamic> _documentToJson(MedicalDocumentItem d) => {
      'id': d.id,
      'document_name': d.documentName,
      'document_type': d.documentType,
      'file_url': d.fileUrl,
      'file_size': d.fileSize,
      'upload_date': d.uploadDate?.toIso8601String(),
      'notes': d.notes,
    };

Map<String, dynamic> _insuranceToJson(InsuranceItem i) => {
      'id': i.id,
      'provider_name': i.providerName,
      'policy_number': i.policyNumber,
      'policy_holder_name': i.policyHolderName,
      'group_number': i.groupNumber,
      'relationship_to_holder': i.relationshipToHolder,
      'expiration_date': i.expirationDate,
      'notes': i.notes,
    };

class ClientRepository {
  ClientRepository({required SupabaseClient supabase, required CacheService cache})
      : _supabase = supabase,
        _cache = cache;

  final SupabaseClient _supabase;
  final CacheService _cache;

  String? get _userId => _supabase.auth.currentUser?.id;

  Future<ClientDashboardData> getDashboardData({bool allowCache = true}) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    try {
      final data = await _fetchDashboard(uid);
      await _cache.cacheClientDashboard(data.toCacheJson());
      return data;
    } catch (e) {
      if (allowCache) {
        final cached = _cache.getCachedClientDashboard();
        if (cached != null) return ClientDashboardData.fromCacheJson(cached);
      }
      rethrow;
    }
  }

  Future<ClientDashboardData> _fetchDashboard(String uid) async {
    final results = await Future.wait([
      _supabase
          .from('appointments')
          .select(
            '*, professional:users!appointments_professional_id_fkey(name, image), client:users!appointments_client_id_fkey(name)',
          )
          .eq('client_id', uid)
          .order('start_time', ascending: true),
      _supabase
          .from('medical_history')
          .select()
          .eq('user_id', uid)
          .order('created_at', ascending: false),
      _supabase
          .from('medications')
          .select()
          .eq('user_id', uid)
          .order('created_at', ascending: false),
      _supabase
          .from('medical_documents')
          .select()
          .eq('user_id', uid)
          .order('created_at', ascending: false),
      _supabase
          .from('insurance')
          .select()
          .eq('user_id', uid)
          .order('created_at', ascending: false),
      _supabase
          .from('client_medical_profiles')
          .select()
          .eq('user_id', uid)
          .maybeSingle(),
    ]);

    final appointmentList = (results[0] as List)
        .map((e) => AppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final now = DateTime.now();
    final upcoming = appointmentList
        .where((a) => a.isUpcomingForClientHome(now))
        .take(10)
        .toList();

    final history = (results[1] as List)
        .map((e) => MedicalHistoryItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final medications = (results[2] as List)
        .map((e) => MedicationItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final documents = (results[3] as List)
        .map((e) => MedicalDocumentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final insurance = (results[4] as List)
        .map((e) => InsuranceItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    final medProfileRow = results[5] as Map<String, dynamic>?;

    return ClientDashboardData(
      appointmentsCount: appointmentList.length,
      conditionsCount: history.length,
      medicationsCount: medications.length,
      documentsCount: documents.length,
      upcomingAppointments: upcoming,
      allAppointments: appointmentList,
      medicalHistory: history,
      medications: medications,
      documents: documents,
      insurance: insurance,
      medicalProfile: ClientMedicalProfile.fromJson(medProfileRow),
    );
  }

  Future<ClientMedicalProfile?> getMedicalProfile() async {
    final uid = _userId;
    if (uid == null) return null;
    final row = await _supabase
        .from('client_medical_profiles')
        .select()
        .eq('user_id', uid)
        .maybeSingle();
    return ClientMedicalProfile.fromJson(row);
  }

  Future<void> updateMedicalProfile(ClientMedicalProfile profile) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');
    await _supabase.from('client_medical_profiles').upsert(profile.toUpsertPayload(uid));
  }

  Future<void> addMedicalCondition({
    required String conditionName,
    String? diagnosisDate,
    String status = 'active',
    String? notes,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');
    await _supabase.from('medical_history').insert({
      'user_id': uid,
      'condition_name': conditionName,
      if (diagnosisDate != null) 'diagnosis_date': diagnosisDate,
      'status': status,
      if (notes != null) 'notes': notes,
    });
  }

  Future<void> updateMedicalCondition({
    required String id,
    String? conditionName,
    String? diagnosisDate,
    String? status,
    String? notes,
  }) async {
    final payload = <String, dynamic>{};
    if (conditionName != null) payload['condition_name'] = conditionName;
    if (diagnosisDate != null) payload['diagnosis_date'] = diagnosisDate;
    if (status != null) payload['status'] = status;
    if (notes != null) payload['notes'] = notes;
    await _supabase.from('medical_history').update(payload).eq('id', id);
  }

  Future<void> deleteMedicalCondition(String id) async {
    await _supabase.from('medical_history').delete().eq('id', id);
  }

  Future<void> addMedication({
    required String medicationName,
    required String dosage,
    required String frequency,
    required String startDate,
    String? endDate,
    String? prescribingDoctor,
    String? notes,
    bool isActive = true,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');
    await _supabase.from('medications').insert({
      'user_id': uid,
      'medication_name': medicationName,
      'dosage': dosage,
      'frequency': frequency,
      'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
      if (prescribingDoctor != null) 'prescribing_doctor': prescribingDoctor,
      if (notes != null) 'notes': notes,
      'is_active': isActive,
    });
  }

  Future<void> deleteMedication(String id) async {
    await _supabase.from('medications').delete().eq('id', id);
  }

  Future<MedicalDocumentItem> uploadDocument({
    required String fileName,
    required String documentType,
    required Uint8List bytes,
    String? notes,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final ext = fileName.contains('.') ? fileName.split('.').last : 'bin';
    final storagePath = '$uid/${const Uuid().v4()}.$ext';

    await _supabase.storage.from('medical-documents').uploadBinary(
          storagePath,
          bytes,
          fileOptions: const FileOptions(upsert: false),
        );

    final fileUrl = _supabase.storage.from('medical-documents').getPublicUrl(storagePath);

    final row = await _supabase
        .from('medical_documents')
        .insert({
          'user_id': uid,
          'document_name': fileName,
          'document_type': documentType,
          'file_url': fileUrl,
          'file_size': bytes.length,
          if (notes != null) 'notes': notes,
        })
        .select()
        .single();

    return MedicalDocumentItem.fromJson(Map<String, dynamic>.from(row));
  }

  Future<void> deleteDocument(String id) async {
    await _supabase.from('medical_documents').delete().eq('id', id);
  }

  Future<void> addInsurance({
    required String providerName,
    required String policyNumber,
    required String policyHolderName,
    String? groupNumber,
    String? relationshipToHolder,
    String? expirationDate,
    String? notes,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');
    await _supabase.from('insurance').insert({
      'user_id': uid,
      'provider_name': providerName,
      'policy_number': policyNumber,
      'policy_holder_name': policyHolderName,
      if (groupNumber != null) 'group_number': groupNumber,
      if (relationshipToHolder != null) 'relationship_to_holder': relationshipToHolder,
      if (expirationDate != null) 'expiration_date': expirationDate,
      if (notes != null) 'notes': notes,
    });
  }

  Future<void> deleteInsurance(String id) async {
    await _supabase.from('insurance').delete().eq('id', id);
  }

  Future<List<AppointmentItem>> getAppointments() async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final rows = await _supabase
        .from('appointments')
        .select(
          '*, professional:users!appointments_professional_id_fkey(name), client:users!appointments_client_id_fkey(name)',
        )
        .eq('client_id', uid)
        .order('start_time', ascending: true);

    return (rows as List)
        .map((e) => AppointmentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<AppointmentItem> bookAppointment({
    required String professionalId,
    required String appointmentType,
    required DateTime startTime,
    required DateTime endTime,
    String? notes,
  }) async {
    final uid = _userId;
    if (uid == null) throw const AuthException('Not authenticated');

    final row = await _supabase
        .from('appointments')
        .insert({
          'client_id': uid,
          'professional_id': professionalId,
          'appointment_type': appointmentType,
          'start_time': startTime.toIso8601String(),
          'end_time': endTime.toIso8601String(),
          if (notes != null) 'notes': notes,
          'status': 'pending',
        })
        .select(
          '*, professional:users!appointments_professional_id_fkey(name), client:users!appointments_client_id_fkey(name)',
        )
        .single();

    return AppointmentItem.fromJson(Map<String, dynamic>.from(row));
  }

  Future<void> updateAppointmentStatus(String id, String status) async {
    await _supabase.from('appointments').update({'status': status}).eq('id', id);
  }

  Future<void> cancelAppointment(String id) async {
    await updateAppointmentStatus(id, 'cancelled');
  }
}

final clientDashboardProvider = FutureProvider<ClientDashboardData>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(clientRepositoryProvider).getDashboardData();
});

final clientAppointmentsProvider = FutureProvider<List<AppointmentItem>>((ref) async {
  ref.watch(authStateProvider);
  return ref.watch(clientRepositoryProvider).getAppointments();
});
