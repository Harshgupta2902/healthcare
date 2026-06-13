import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/models/models.dart';
import '../services/device_hash.dart';
import 'api_endpoints.dart';
import 'dio_client.dart';

final apiRepositoryProvider = Provider<ApiRepository>((ref) {
  return ApiRepository(dio: ref.watch(dioProvider));
});

class ApiRepository {
  ApiRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<void> syncSession() async {
    await _dio.post(ApiEndpoints.syncSession);
  }

  Future<List<PlacePrediction>> searchPlaces(String query) async {
    final response = await _dio.get(
      ApiEndpoints.placesSearch,
      queryParameters: {'q': query},
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(envelope.error?['message'] ?? 'Places search failed');
    }
    final predictions = (envelope.data?['predictions'] as List?) ?? [];
    return predictions
        .map((e) => PlacePrediction.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<String> submitGuestBooking({
    required String firstName,
    required String lastName,
    required int age,
    required String phone,
    required String email,
    required String category,
    required String state,
    required String city,
    required String date,
    required String time,
    required String professionalId,
    String? message,
  }) async {
    final deviceHash = await DeviceHashService.getDeviceHash();
    final response = await _dio.post(
      ApiEndpoints.bookingGuest,
      data: {
        'firstName': firstName,
        'lastName': lastName,
        'age': age,
        'phone': phone,
        'email': email,
        'category': category,
        'state': state,
        'city': city,
        'date': date,
        'time': time,
        'professionalId': professionalId,
        if (message != null && message.isNotEmpty) 'message': message,
        'deviceHash': deviceHash,
      },
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(envelope.error?['message'] ?? 'Booking failed');
    }
    return envelope.data?['id'] as String;
  }

  Future<Map<String, dynamic>> getGuestBookingConfirmation(String id) async {
    final response = await _dio.get(ApiEndpoints.bookingGuestConfirm(id));
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => Map<String, dynamic>.from(d as Map),
    );
    if (!envelope.success || envelope.data == null) {
      throw Exception(envelope.error?['message'] ?? 'Confirmation not found');
    }
    return envelope.data!;
  }

  Future<Map<String, dynamic>> createMeeting({required String guestAppointmentId}) async {
    final response = await _dio.post(
      ApiEndpoints.meetingsCreate,
      data: {'guestAppointmentId': guestAppointmentId},
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> runGuestMeetingPipeline({
    required String guestAppointmentId,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.meetingsGuestPipeline,
      data: {'guestAppointmentId': guestAppointmentId},
    );
    return _unwrap(response);
  }

  Future<void> submitContact({
    required String name,
    required String email,
    required String subject,
    required String message,
  }) async {
    final deviceHash = await DeviceHashService.getDeviceHash();
    final response = await _dio.post(
      ApiEndpoints.contact,
      data: {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
        'deviceHash': deviceHash,
      },
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(envelope.error?['message'] ?? 'Contact submission failed');
    }
  }

  Future<List<String>> searchUniversities(String query) async {
    final response = await _dio.get(
      ApiEndpoints.universitiesSearch,
      queryParameters: {'q': query},
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) return [];
    final results = (envelope.data?['results'] as List?) ?? [];
    return results.map((e) => e.toString()).toList();
  }

  Future<void> sendPrescription({
    required String guestAppointmentId,
    required String prescriptionHtml,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.prescriptionsSend,
      data: {
        'guestAppointmentId': guestAppointmentId,
        'prescriptionHtml': prescriptionHtml,
      },
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(envelope.error?['message'] ?? 'Prescription send failed');
    }
  }


  Future<void> unsubscribeNewsletter({required String token}) async {
    final response = await _dio.post(
      ApiEndpoints.newsletterUnsubscribe,
      data: {'token': token},
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(envelope.error?['message'] ?? 'Unsubscribe failed');
    }
  }

  Map<String, dynamic> _unwrap(Response<dynamic> response) {
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => Map<String, dynamic>.from(d as Map),
    );
    if (!envelope.success || envelope.data == null) {
      throw Exception(envelope.error?['message'] ?? 'Request failed');
    }
    return envelope.data!;
  }
}
