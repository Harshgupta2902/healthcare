import 'package:intl/intl.dart';

/// Hourly booking slot helpers — mirrors `src/lib/booking/` (IST / Asia/Kolkata).
abstract final class BookingSlotLogic {
  static const slotIntervalMinutes = 60;
  static int istOffsetMs = (5.5 * 60 * 60 * 1000).round();

  static const _dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  static int parseTimeToMinutes(String time) {
    final normalized = normalizeAvailabilityTime(time);
    final parts = normalized.split(':');
    final hours = int.parse(parts[0]).clamp(0, 23);
    final minutes = int.parse(parts[1]).clamp(0, 59);
    return hours * 60 + minutes;
  }

  static String normalizeAvailabilityTime(String time) {
    final trimmed = time.trim();
    if (trimmed.isEmpty) return '00:00';
    final match = RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(trimmed);
    if (match == null) return '00:00';
    final hours = int.parse(match.group(1)!).clamp(0, 23);
    final minutes = int.parse(match.group(2)!).clamp(0, 59);
    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}';
  }

  static String formatMinutesAsTime(int totalMinutes) {
    final h = totalMinutes ~/ 60;
    final m = totalMinutes % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}';
  }

  static DateTime istSlotStartToUtc(String dateYmd, String timeHm) {
    final parts = dateYmd.split('-');
    final y = int.parse(parts[0]);
    final mo = int.parse(parts[1]);
    final d = int.parse(parts[2]);
    final mins = parseTimeToMinutes(timeHm);
    final hours = mins ~/ 60;
    final minutes = mins % 60;
    return DateTime.utc(y, mo, d, hours, minutes).subtract(
      Duration(milliseconds: istOffsetMs),
    );
  }

  static String utcToIstDateYmd(DateTime date) {
    final ms = date.toUtc().millisecondsSinceEpoch + istOffsetMs;
    final ist = DateTime.fromMillisecondsSinceEpoch(ms, isUtc: true);
    return '${ist.year}-${ist.month.toString().padLeft(2, '0')}-${ist.day.toString().padLeft(2, '0')}';
  }

  static String utcToIstTimeHm(DateTime date) {
    final ms = date.toUtc().millisecondsSinceEpoch + istOffsetMs;
    final ist = DateTime.fromMillisecondsSinceEpoch(ms, isUtc: true);
    return '${ist.hour.toString().padLeft(2, '0')}:${ist.minute.toString().padLeft(2, '0')}';
  }

  static int istDayOfWeekFromYmd(String dateYmd) {
    final noon = DateTime.parse('${dateYmd}T06:30:00.000Z');
    return noon.toUtc().weekday % 7;
  }

  static String addDaysToYmd(String dateYmd, int days) {
    final base = DateTime.parse('${dateYmd}T06:30:00.000Z');
    return utcToIstDateYmd(base.add(Duration(days: days)));
  }

  static String formatBookableDayLabels(List<int> daysOfWeek) {
    final unique = daysOfWeek.toSet().toList()..sort();
    return unique.map((d) => _dayLabels[d]).join(', ');
  }

  static List<String> listBookableDates(
    List<int> availableDaysOfWeek,
    int advanceWeeks, {
    DateTime? now,
  }) {
    final weeks = advanceWeeks.clamp(1, 3);
    final current = now ?? DateTime.now();
    final todayYmd = utcToIstDateYmd(current.toUtc());
    final lastYmd = addDaysToYmd(todayYmd, weeks * 7);
    final daySet = availableDaysOfWeek.toSet();
    final dates = <String>[];
    var cursor = todayYmd;
    while (cursor.compareTo(lastYmd) <= 0) {
      if (daySet.contains(istDayOfWeekFromYmd(cursor))) {
        dates.add(cursor);
      }
      cursor = addDaysToYmd(cursor, 1);
    }
    return dates;
  }

  static bool isValidHourlyAvailabilityWindow(
      String startTime, String endTime) {
    final start = parseTimeToMinutes(normalizeAvailabilityTime(startTime));
    final end = parseTimeToMinutes(normalizeAvailabilityTime(endTime));
    return start + slotIntervalMinutes <= end;
  }

  static bool isYmdBookable(
    String dateYmd,
    List<int> availableDaysOfWeek,
    int advanceWeeks, {
    DateTime? now,
  }) {
    return listBookableDates(availableDaysOfWeek, advanceWeeks, now: now)
        .contains(dateYmd);
  }

  static ({String date, String time}) slotStartToAppointmentFields(
      String slotStartAt) {
    final start = DateTime.parse(slotStartAt).toUtc();
    return (date: utcToIstDateYmd(start), time: utcToIstTimeHm(start));
  }

  static bool slotInstantsEqual(String a, String b) {
    return DateTime.parse(a).toUtc().millisecondsSinceEpoch ==
        DateTime.parse(b).toUtc().millisecondsSinceEpoch;
  }

  static String formatIstSlotLabel(DateTime startUtc, DateTime endUtc) {
    final startMs = startUtc.toUtc().millisecondsSinceEpoch + istOffsetMs;
    final endMs = endUtc.toUtc().millisecondsSinceEpoch + istOffsetMs;
    final startIst = DateTime.fromMillisecondsSinceEpoch(startMs, isUtc: true);
    final endIst = DateTime.fromMillisecondsSinceEpoch(endMs, isUtc: true);
    final fmt = DateFormat('h:mm a');
    return '${fmt.format(DateTime(2000, 1, 1, startIst.hour, startIst.minute))} – ${fmt.format(DateTime(2000, 1, 1, endIst.hour, endIst.minute))}';
  }

  static List<_BaseSlot> generateHourlySlotsForWindow(
    String dateYmd,
    String windowStartTime,
    String windowEndTime, {
    DateTime? now,
    bool includePast = false,
  }) {
    final current = now ?? DateTime.now();
    final startMins = parseTimeToMinutes(windowStartTime);
    final endMins = parseTimeToMinutes(windowEndTime);
    final slots = <_BaseSlot>[];

    for (var cursor = startMins;
        cursor + slotIntervalMinutes <= endMins;
        cursor += slotIntervalMinutes) {
      final timeValue = formatMinutesAsTime(cursor);
      final slotStartAt = istSlotStartToUtc(dateYmd, timeValue);
      final slotEndAt =
          slotStartAt.add(const Duration(minutes: slotIntervalMinutes));

      if (!includePast && slotStartAt.isBefore(current.toUtc())) continue;

      slots.add(
        _BaseSlot(
          slotStartAt: slotStartAt.toUtc().toIso8601String(),
          slotEndAt: slotEndAt.toUtc().toIso8601String(),
          timeValue: timeValue,
          label: formatIstSlotLabel(slotStartAt, slotEndAt),
        ),
      );
    }
    return slots;
  }

  static String? diagnoseEmptyReason({
    required String dateYmd,
    required List<AvailabilityWindow> availability,
    DateTime? now,
  }) {
    final current = now ?? DateTime.now();
    final dayOfWeek = istDayOfWeekFromYmd(dateYmd);
    final matched =
        availability.where((a) => a.dayOfWeek == dayOfWeek && a.isAvailable);
    if (matched.isEmpty) return 'no_availability_window';

    final window = matched.first;
    final startMinutes = parseTimeToMinutes(window.startTime);
    final endMinutes = parseTimeToMinutes(window.endTime);
    if (startMinutes + slotIntervalMinutes > endMinutes)
      return 'invalid_time_window';

    final rawSlots = generateHourlySlotsForWindow(
      dateYmd,
      window.startTime,
      window.endTime,
      now: current,
      includePast: true,
    );
    final futureSlots = generateHourlySlotsForWindow(
      dateYmd,
      window.startTime,
      window.endTime,
      now: current,
    );

    if (rawSlots.isNotEmpty && futureSlots.isEmpty) return 'all_slots_past';
    if (rawSlots.isEmpty) return 'invalid_time_window';
    return null;
  }

  static List<GeneratedBookableSlot> buildBookableSlots({
    required String dateYmd,
    required List<AvailabilityWindow> availability,
    required List<OccupiedSlot> occupied,
    DateTime? now,
    String? myHoldSlotStartAt,
  }) {
    final current = now ?? DateTime.now();
    final nowMs = current.toUtc().millisecondsSinceEpoch;
    final dayOfWeek = istDayOfWeekFromYmd(dateYmd);

    final normalized = availability
        .map(
          (row) => AvailabilityWindow(
            dayOfWeek: row.dayOfWeek,
            startTime: normalizeAvailabilityTime(row.startTime),
            endTime: normalizeAvailabilityTime(row.endTime),
            isAvailable: row.isAvailable,
          ),
        )
        .toList();

    final window =
        normalized.where((a) => a.dayOfWeek == dayOfWeek && a.isAvailable);
    if (window.isEmpty) return [];

    final matched = window.first;
    final baseSlots = generateHourlySlotsForWindow(
      dateYmd,
      matched.startTime,
      matched.endTime,
      now: current,
    );

    final occupiedActive = occupied.where((o) => _isActiveHold(o, nowMs));

    return baseSlots.map((slot) {
      if (myHoldSlotStartAt != null &&
          slotInstantsEqual(slot.slotStartAt, myHoldSlotStartAt)) {
        return GeneratedBookableSlot.fromBase(slot, 'available');
      }
      final occ = occupiedActive
          .where((o) => slotInstantsEqual(o.slotStartAt, slot.slotStartAt));
      if (occ.isNotEmpty) {
        final row = occ.first;
        if (row.status == 'held' && _isActiveHold(row, nowMs)) {
          return GeneratedBookableSlot.fromBase(slot, 'held_by_other');
        }
        return GeneratedBookableSlot.fromBase(slot, 'booked');
      }
      return GeneratedBookableSlot.fromBase(slot, 'available');
    }).toList();
  }

  static bool _isActiveHold(OccupiedSlot row, int nowMs) {
    if (row.status != 'held') return true;
    if (row.expiresAt == null) return false;
    return DateTime.parse(row.expiresAt!).toUtc().millisecondsSinceEpoch >
        nowMs;
  }
}

class AvailabilityWindow {
  const AvailabilityWindow({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.isAvailable,
  });

  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final bool isAvailable;
}

class OccupiedSlot {
  const OccupiedSlot({
    required this.slotStartAt,
    required this.status,
    this.expiresAt,
  });

  final String slotStartAt;
  final String status;
  final String? expiresAt;
}

class _BaseSlot {
  const _BaseSlot({
    required this.slotStartAt,
    required this.slotEndAt,
    required this.timeValue,
    required this.label,
  });

  final String slotStartAt;
  final String slotEndAt;
  final String timeValue;
  final String label;
}

class GeneratedBookableSlot {
  const GeneratedBookableSlot({
    required this.slotStartAt,
    required this.slotEndAt,
    required this.timeValue,
    required this.label,
    required this.state,
  });

  final String slotStartAt;
  final String slotEndAt;
  final String timeValue;
  final String label;
  final String state;

  factory GeneratedBookableSlot.fromBase(_BaseSlot base, String state) {
    return GeneratedBookableSlot(
      slotStartAt: base.slotStartAt,
      slotEndAt: base.slotEndAt,
      timeValue: base.timeValue,
      label: base.label,
      state: state,
    );
  }
}

String generateOrderNumber({DateTime? now}) {
  final current = (now ?? DateTime.now()).toUtc();
  final y = current.year;
  final m = current.month.toString().padLeft(2, '0');
  final d = current.day.toString().padLeft(2, '0');
  final rand =
      DateTime.now().microsecondsSinceEpoch.toRadixString(36).toUpperCase();
  return 'HH-$y$m$d-${rand.substring(rand.length > 6 ? rand.length - 6 : 0)}';
}
