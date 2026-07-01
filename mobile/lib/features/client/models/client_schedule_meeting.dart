class ClientScheduleMeeting {
  const ClientScheduleMeeting({
    required this.id,
    required this.title,
    required this.specialistLabel,
    required this.start,
    required this.end,
    this.appointmentType,
    this.meetingUrl,
    this.professionalImage,
    this.status = 'pending',
  });

  final String id;
  final String title;
  final String specialistLabel;
  final DateTime start;
  final DateTime end;
  final String? appointmentType;
  final String? meetingUrl;
  final String? professionalImage;
  final String status;

  bool isPast([DateTime? now]) => end.isBefore(now ?? DateTime.now());

  bool canJoin([DateTime? now]) {
    if (isPast(now)) return false;
    final url = meetingUrl?.trim();
    return url != null && url.isNotEmpty;
  }
}
