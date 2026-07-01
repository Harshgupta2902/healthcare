import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/models/registration_settings.dart' show RegisterOtpSentResult;
import '../../features/booking/models/booking_models.dart';
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

  Future<RegisterOtpSentResult> requestRegistrationOtp({
    required String email,
    required String password,
    required String name,
    required String role,
  }) async {
    final deviceHash = await DeviceHashService.getDeviceHash();
    final response = await _dio.post(
      ApiEndpoints.registerOtp,
      data: {
        'email': email.trim(),
        'password': password,
        'name': name.trim(),
        'role': role,
        'deviceHash': deviceHash,
      },
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => RegisterOtpSentResult.fromJson(Map<String, dynamic>.from(d as Map)),
    );
    if (!envelope.success || envelope.data == null) {
      throw Exception(
        envelope.error?['message'] ?? 'Could not send verification code',
      );
    }
    return envelope.data!;
  }

  Future<void> verifyOtpAndSignUp({
    required String email,
    required String password,
    required String name,
    required String role,
    required String otp,
  }) async {
    final deviceHash = await DeviceHashService.getDeviceHash();
    final response = await _dio.post(
      ApiEndpoints.verifyOtp,
      data: {
        'email': email.trim(),
        'password': password,
        'name': name.trim(),
        'role': role,
        'otp': otp.trim().toUpperCase(),
        'deviceHash': deviceHash,
      },
    );
    final envelope = ApiResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
      (d) => d,
    );
    if (!envelope.success) {
      throw Exception(
        envelope.error?['message'] ?? 'OTP verification failed',
      );
    }
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

  Future<Map<String, dynamic>> _unwrapMap(Response<dynamic> response) {
    return Future.value(_unwrap(response));
  }

  Future<RazorpayCheckoutPayload> createRazorpayCheckoutOrder(String orderId) async {
    final response = await _dio.post(ApiEndpoints.bookingOrderRazorpay(orderId));
    final data = await _unwrapMap(response);
    return RazorpayCheckoutPayload.fromJson(data);
  }

  Future<PaymentFulfillmentResult> verifyRazorpayPayment({
    required String orderId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.bookingOrderVerify(orderId),
      data: {
        'razorpayOrderId': razorpayOrderId,
        'razorpayPaymentId': razorpayPaymentId,
        'razorpaySignature': razorpaySignature,
      },
    );
    final data = await _unwrapMap(response);
    return PaymentFulfillmentResult.fromJson(data);
  }

  Future<PaymentFulfillmentResult> confirmFreeBookingOrder(String orderId) async {
    final response = await _dio.post(ApiEndpoints.bookingOrderConfirmFree(orderId));
    final data = await _unwrapMap(response);
    return PaymentFulfillmentResult.fromJson(data);
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
