import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../models/booking_models.dart';
import 'booking_slot_logic.dart';

final bookingSlotsRepositoryProvider = Provider<BookingSlotsRepository>((ref) {
  return BookingSlotsRepository(supabase: ref.watch(supabaseClientProvider));
});

class BookingSlotsRepository {
  BookingSlotsRepository({required SupabaseClient supabase}) : _supabase = supabase;

  final SupabaseClient _supabase;

  Future<BookableDatesResult> getBookableDates(String professionalId) async {
    final settings = await _fetchBookingSettings();
    final rows = await _supabase
        .from('professional_availability')
        .select('day_of_week, start_time, end_time, is_available')
        .eq('professional_id', professionalId);

    final availableRows = (rows as List).where((row) => row['is_available'] == true);
    final availableDays = availableRows
        .where(
          (row) => BookingSlotLogic.isValidHourlyAvailabilityWindow(
            '${row['start_time']}',
            '${row['end_time']}',
          ),
        )
        .map((row) => (row['day_of_week'] as num).toInt())
        .toList();

    final dates = BookingSlotLogic.listBookableDates(
      availableDays,
      settings['booking_advance_weeks'] as int? ?? 2,
    );

    return BookableDatesResult(
      dates: dates,
      availableDayLabels: BookingSlotLogic.formatBookableDayLabels(availableDays),
      advanceWeeks: settings['booking_advance_weeks'] as int? ?? 2,
      hasAvailability: availableRows.isNotEmpty,
      hasValidSlotWindows: availableDays.isNotEmpty,
    );
  }

  Future<AvailableSlotsResult> getAvailableSlots({
    required String professionalId,
    required String date,
  }) async {
    await _supabase.rpc('expire_stale_slot_reservations');

    final settings = await _fetchBookingSettings();
    final advanceWeeks = settings['booking_advance_weeks'] as int? ?? 2;
    final availability = await _loadAvailabilityWindows(professionalId);
    final availableDays = availability
        .where((a) => a.isAvailable && BookingSlotLogic.isValidHourlyAvailabilityWindow(a.startTime, a.endTime))
        .map((a) => a.dayOfWeek)
        .toList();

    if (!BookingSlotLogic.isYmdBookable(date, availableDays, advanceWeeks)) {
      throw Exception('This date is not available for booking with this consultant.');
    }

    final occupiedRows = await _supabase
        .from('professional_slot_reservations')
        .select('slot_start_at, status, expires_at')
        .eq('professional_id', professionalId)
        .inFilter('status', ['held', 'confirmed'])
        .gte('slot_start_at', '${date}T00:00:00+05:30')
        .lt('slot_start_at', '${date}T23:59:59+05:30');

    final uid = _supabase.auth.currentUser?.id;
    String? myHoldSlotStartAt;
    if (uid != null) {
      final myHold = await _supabase
          .from('professional_slot_reservations')
          .select('slot_start_at')
          .eq('professional_id', professionalId)
          .eq('held_by_user_id', uid)
          .eq('status', 'held')
          .gt('expires_at', DateTime.now().toUtc().toIso8601String())
          .maybeSingle();
      myHoldSlotStartAt = myHold?['slot_start_at'] as String?;
    }

    final occupied = (occupiedRows as List)
        .map(
          (row) => OccupiedSlot(
            slotStartAt: row['slot_start_at'] as String,
            status: row['status'] as String,
            expiresAt: row['expires_at'] as String?,
          ),
        )
        .toList();

    final generated = BookingSlotLogic.buildBookableSlots(
      dateYmd: date,
      availability: availability,
      occupied: occupied,
      myHoldSlotStartAt: myHoldSlotStartAt,
    );

    final emptyReason = generated.isEmpty
        ? BookingSlotLogic.diagnoseEmptyReason(dateYmd: date, availability: availability)
        : generated.every((s) => s.state != 'available')
            ? 'occupied_only'
            : null;

    return AvailableSlotsResult(
      slots: generated
          .map(
            (s) => BookableSlot(
              slotStartAt: s.slotStartAt,
              slotEndAt: s.slotEndAt,
              timeValue: s.timeValue,
              label: s.label,
              state: s.state,
            ),
          )
          .toList(),
      emptyReason: emptyReason,
    );
  }

  Future<SlotHold> reserveSlot({
    required String professionalId,
    required String slotStartAt,
  }) async {
    final result = await _supabase.rpc(
      'reserve_professional_slot',
      params: {
        'p_professional_id': professionalId,
        'p_slot_start_at': slotStartAt,
      },
    );

    final map = Map<String, dynamic>.from(result as Map);
    if (map['ok'] != true) {
      throw Exception(map['error'] ?? 'Could not reserve this slot.');
    }

    final fields = BookingSlotLogic.slotStartToAppointmentFields(map['slot_start_at'] as String);
    return SlotHold(
      holdId: map['hold_id'] as String,
      expiresAt: map['expires_at'] as String,
      slotStartAt: map['slot_start_at'] as String,
      date: fields.date,
      time: fields.time,
    );
  }

  Future<void> releaseSlot(String holdId) async {
    final result = await _supabase.rpc(
      'release_slot_reservation',
      params: {'p_hold_id': holdId},
    );
    if (result != true) {
      throw Exception('Could not release this slot hold.');
    }
  }

  Future<SlotHold?> getActiveHold(String professionalId) async {
    final uid = _supabase.auth.currentUser?.id;
    if (uid == null) return null;

    await _supabase.rpc('expire_stale_slot_reservations');

    final row = await _supabase
        .from('professional_slot_reservations')
        .select('id, slot_start_at, expires_at')
        .eq('professional_id', professionalId)
        .eq('held_by_user_id', uid)
        .eq('status', 'held')
        .gt('expires_at', DateTime.now().toUtc().toIso8601String())
        .maybeSingle();

    if (row == null) return null;

    final fields = BookingSlotLogic.slotStartToAppointmentFields(row['slot_start_at'] as String);
    return SlotHold(
      holdId: row['id'] as String,
      expiresAt: row['expires_at'] as String,
      slotStartAt: row['slot_start_at'] as String,
      date: fields.date,
      time: fields.time,
    );
  }

  Future<Map<String, dynamic>> _fetchBookingSettings() async {
    final raw = await _supabase.rpc('get_booking_settings');
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return {'booking_advance_weeks': 2, 'slot_hold_minutes': 10, 'meeting_duration_minutes': 60};
  }

  Future<List<AvailabilityWindow>> _loadAvailabilityWindows(String professionalId) async {
    final rows = await _supabase
        .from('professional_availability')
        .select('day_of_week, start_time, end_time, is_available')
        .eq('professional_id', professionalId);

    return (rows as List)
        .map(
          (row) => AvailabilityWindow(
            dayOfWeek: (row['day_of_week'] as num).toInt(),
            startTime: '${row['start_time']}',
            endTime: '${row['end_time']}',
            isAvailable: row['is_available'] == true,
          ),
        )
        .toList();
  }
}
