import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_repository.dart';
import '../../../shared/models/models.dart';

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepository(api: ref.watch(apiRepositoryProvider));
});

class BookingRepository {
  BookingRepository({required ApiRepository api}) : _api = api;

  final ApiRepository _api;

  Future<List<PlacePrediction>> searchPlaces(String query) {
    return _api.searchPlaces(query);
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
  }) {
    return _api.submitGuestBooking(
      firstName: firstName,
      lastName: lastName,
      age: age,
      phone: phone,
      email: email,
      category: category,
      state: state,
      city: city,
      date: date,
      time: time,
      professionalId: professionalId,
      message: message,
    );
  }

  Future<Map<String, dynamic>> getConfirmation(String bookingId) {
    return _api.getGuestBookingConfirmation(bookingId);
  }

  Future<Map<String, dynamic>> runMeetingPipeline(String guestAppointmentId) {
    return _api.runGuestMeetingPipeline(guestAppointmentId: guestAppointmentId);
  }
}
