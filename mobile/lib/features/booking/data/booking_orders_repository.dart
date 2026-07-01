import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/config/env.dart';
import '../../../core/services/device_hash.dart';
import '../../../core/supabase/supabase_client.dart';
import '../models/booking_models.dart';
import 'booking_slot_logic.dart';

final bookingOrdersRepositoryProvider = Provider<BookingOrdersRepository>((ref) {
  return BookingOrdersRepository(supabase: ref.watch(supabaseClientProvider));
});

class BookingOrdersRepository {
  BookingOrdersRepository({required SupabaseClient supabase}) : _supabase = supabase;

  final SupabaseClient _supabase;

  Future<CreateBookingOrderResult> createBookingOrder({
    required String professionalId,
    required String holdId,
    required BookingSnapshot snapshot,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('You must be signed in.');

    await _supabase.rpc('expire_stale_slot_reservations');
    await _supabase.rpc('expire_stale_booking_orders');

    final feeRow = await _supabase
        .from('professional_profiles')
        .select('consultation_fee')
        .eq('user_id', professionalId)
        .maybeSingle();

    final amountPaise = ((feeRow?['consultation_fee'] as num?) ?? 0).toInt().clamp(0, 1 << 31);

    final hold = await _verifyHold(
      userId: user.id,
      holdId: holdId,
      professionalId: professionalId,
      date: snapshot.date,
      time: snapshot.time,
    );

    final deviceHash = await DeviceHashService.getDeviceHash();
    final bookingSnapshot = {
      ...snapshot.toJson(),
      'deviceHash': deviceHash,
      'sharePrescriptionsConsent': false,
      'sharedPrescriptionIds': <String>[],
    };

    const paymentProvider = 'razorpay';

    final inserted = await _supabase
        .from('booking_orders')
        .insert({
          'order_number': generateOrderNumber(),
          'user_id': user.id,
          'professional_id': professionalId,
          'amount_paise': amountPaise,
          'currency': 'INR',
          'status': 'pending',
          'booking_snapshot': bookingSnapshot,
          'payment_provider': paymentProvider,
          'expires_at': hold.expiresAt,
          'slot_reservation_id': holdId,
        })
        .select('id, order_number')
        .single();

    await _supabase
        .from('professional_slot_reservations')
        .update({
          'booking_order_id': inserted['id'],
          'updated_at': DateTime.now().toUtc().toIso8601String(),
        })
        .eq('id', holdId)
        .eq('status', 'held');

    return CreateBookingOrderResult(
      orderId: inserted['id'] as String,
      orderNumber: inserted['order_number'] as String,
      amountPaise: amountPaise,
      paymentProvider: paymentProvider,
      razorpayKeyId: Env.razorpayKeyId.isNotEmpty ? Env.razorpayKeyId : null,
    );
  }

  Future<void> finalizeBookingOrder({
    required String orderId,
    required String guestAppointmentId,
    String? transactionId,
  }) async {
    final result = await _supabase.rpc(
      'finalize_booking_order',
      params: {
        'p_order_id': orderId,
        'p_guest_appointment_id': guestAppointmentId,
        'p_transaction_id': transactionId,
        'p_payment_method': 'razorpay',
      },
    );
    if (result != true) {
      throw Exception('Order could not be finalized.');
    }
  }

  Future<({String id, String expiresAt})> _verifyHold({
    required String userId,
    required String holdId,
    required String professionalId,
    required String date,
    required String time,
  }) async {
    final hold = await _supabase
        .from('professional_slot_reservations')
        .select('id, professional_id, slot_start_at, status, expires_at, held_by_user_id')
        .eq('id', holdId)
        .maybeSingle();

    if (hold == null) throw Exception('Slot reservation not found. Please select a slot again.');
    if (hold['status'] != 'held') {
      throw Exception('This slot reservation is no longer active.');
    }
    if (hold['held_by_user_id'] != userId) {
      throw Exception('This slot hold belongs to another session.');
    }
    if (hold['professional_id'] != professionalId) {
      throw Exception('Slot does not match the selected consultant.');
    }

    final expiresAt = DateTime.parse(hold['expires_at'] as String).toUtc();
    if (expiresAt.isBefore(DateTime.now().toUtc())) {
      throw Exception('Your slot hold has expired. Please select a slot again.');
    }

    final fields = BookingSlotLogic.slotStartToAppointmentFields(hold['slot_start_at'] as String);
    if (fields.date != date || fields.time != time) {
      throw Exception('Selected time does not match your reserved slot.');
    }

    return (id: holdId, expiresAt: hold['expires_at'] as String);
  }
}
