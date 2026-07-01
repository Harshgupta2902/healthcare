import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_repository.dart';
import '../../../shared/models/models.dart';
import '../models/booking_models.dart';
import 'booking_orders_repository.dart';
import 'booking_slots_repository.dart';

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepository(
    api: ref.watch(apiRepositoryProvider),
    slots: ref.watch(bookingSlotsRepositoryProvider),
    orders: ref.watch(bookingOrdersRepositoryProvider),
  );
});

final bookingDraftProvider = StateProvider<BookingDraft?>((ref) => null);

/// Booking data: Supabase SDK for slots/orders; REST API for Razorpay + meetings + places.
class BookingRepository {
  BookingRepository({
    required ApiRepository api,
    required BookingSlotsRepository slots,
    required BookingOrdersRepository orders,
  })  : _api = api,
        _slots = slots,
        _orders = orders;

  final ApiRepository _api;
  final BookingSlotsRepository _slots;
  final BookingOrdersRepository _orders;

  Future<List<PlacePrediction>> searchPlaces(String query) => _api.searchPlaces(query);

  Future<BookableDatesResult> getBookableDates(String professionalId) =>
      _slots.getBookableDates(professionalId);

  Future<AvailableSlotsResult> getAvailableSlots({
    required String professionalId,
    required String date,
  }) =>
      _slots.getAvailableSlots(professionalId: professionalId, date: date);

  Future<SlotHold> reserveSlot({
    required String professionalId,
    required String slotStartAt,
  }) =>
      _slots.reserveSlot(professionalId: professionalId, slotStartAt: slotStartAt);

  Future<void> releaseSlot(String holdId) => _slots.releaseSlot(holdId);

  Future<SlotHold?> getActiveHold(String professionalId) => _slots.getActiveHold(professionalId);

  Future<CreateBookingOrderResult> createBookingOrder({
    required String professionalId,
    required String holdId,
    required BookingSnapshot snapshot,
  }) =>
      _orders.createBookingOrder(
        professionalId: professionalId,
        holdId: holdId,
        snapshot: snapshot,
      );

  Future<RazorpayCheckoutPayload> createRazorpayCheckoutOrder(String orderId) =>
      _api.createRazorpayCheckoutOrder(orderId);

  Future<PaymentFulfillmentResult> verifyRazorpayPayment({
    required String orderId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) =>
      _api.verifyRazorpayPayment(
        orderId: orderId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      );

  Future<PaymentFulfillmentResult> confirmFreeBookingOrder(String orderId) =>
      _api.confirmFreeBookingOrder(orderId);

  Future<void> finalizeBookingOrder({
    required String orderId,
    required String guestAppointmentId,
    String? transactionId,
  }) =>
      _orders.finalizeBookingOrder(
        orderId: orderId,
        guestAppointmentId: guestAppointmentId,
        transactionId: transactionId,
      );

  Future<Map<String, dynamic>> runMeetingPipeline(String guestAppointmentId) =>
      _api.runGuestMeetingPipeline(guestAppointmentId: guestAppointmentId);
}
