import '../../../shared/models/models.dart';
import '../models/client_schedule_meeting.dart';

DateTime startOfDayLocal(DateTime date) =>
    DateTime(date.year, date.month, date.day);

/// Monday-based week start (matches web `weekStartsOn: 1`).
DateTime startOfWeekMonday(DateTime date) {
  final day = startOfDayLocal(date);
  return day.subtract(Duration(days: day.weekday - DateTime.monday));
}

List<DateTime> weekDaysFromAnchor(DateTime weekAnchor) {
  final start = startOfWeekMonday(weekAnchor);
  return List.generate(7, (i) => start.add(Duration(days: i)));
}

bool isSameDayLocal(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;

bool isTodayLocal(DateTime date) => isSameDayLocal(date, DateTime.now());

List<ClientScheduleMeeting> buildClientScheduleMeetings(
  List<AppointmentItem> appointments,
) {
  final meetings = <ClientScheduleMeeting>[];

  for (final apt in appointments) {
    final status = apt.status.toLowerCase();
    if (status == 'cancelled' || status == 'canceled') continue;

    final specialist = apt.professionalName?.trim().isNotEmpty == true
        ? apt.professionalName!.trim()
        : 'Your specialist';
    final type = apt.appointmentType?.trim();
    final title = type != null && type.isNotEmpty
        ? '$type with $specialist'
        : 'Consultation with $specialist';

    meetings.add(
      ClientScheduleMeeting(
        id: apt.id,
        title: title,
        specialistLabel: specialist,
        start: apt.startTime.toLocal(),
        end: apt.endTime.toLocal(),
        appointmentType: type,
        meetingUrl: apt.meetingUrl,
        professionalImage: apt.professionalImage,
        status: apt.status,
      ),
    );
  }

  meetings.sort((a, b) => a.start.compareTo(b.start));
  return meetings;
}

String formatMeetingDuration(DateTime start, DateTime end) {
  final minutes = end.difference(start).inMinutes;
  if (minutes < 60) return '$minutes min';
  final hours = minutes ~/ 60;
  final remainder = minutes % 60;
  if (remainder == 0) return '$hours hr';
  return '$hours hr $remainder min';
}

/// Default 9–17; expands to fit meetings on [day].
({int hourStart, int hourEnd}) scheduleGridBounds(
  List<ClientScheduleMeeting> dayMeetings,
) {
  const defaultStart = 9;
  const defaultEnd = 17;
  var minMinutes = defaultStart * 60;
  var maxMinutes = defaultEnd * 60;

  for (final m in dayMeetings) {
    final start = m.start.hour * 60 + m.start.minute;
    final end = m.end.hour * 60 + m.end.minute;
    minMinutes = start < minMinutes ? start : minMinutes;
    maxMinutes = end > maxMinutes ? end : maxMinutes;
  }

  final hourStart = (minMinutes ~/ 60).clamp(0, 23);
  final hourEnd = (maxMinutes / 60).ceil().clamp(hourStart + 1, 24);
  return (hourStart: hourStart, hourEnd: hourEnd);
}
