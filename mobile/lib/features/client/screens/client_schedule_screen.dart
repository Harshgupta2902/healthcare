import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/client_repository.dart';
import '../models/client_schedule_meeting.dart';
import '../utils/client_schedule_utils.dart';

const _hourHeight = 64.0;
const _timeLabelWidth = 48.0;

class ClientScheduleScreen extends ConsumerStatefulWidget {
  const ClientScheduleScreen({super.key});

  @override
  ConsumerState<ClientScheduleScreen> createState() =>
      _ClientScheduleScreenState();
}

class _ClientScheduleScreenState extends ConsumerState<ClientScheduleScreen> {
  late DateTime _weekAnchor;
  late DateTime _selectedDay;
  ClientScheduleMeeting? _selectedMeeting;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _weekAnchor = now;
    _selectedDay = startOfDayLocal(now);
  }

  void _shiftWeek(int deltaWeeks) {
    setState(() {
      final days = weekDaysFromAnchor(_weekAnchor);
      final index = days.indexWhere((d) => isSameDayLocal(d, _selectedDay));
      _weekAnchor = _weekAnchor.add(Duration(days: 7 * deltaWeeks));
      final nextDays = weekDaysFromAnchor(_weekAnchor);
      _selectedDay = nextDays[(index >= 0 ? index : 0).clamp(0, 6)];
      _selectedMeeting = null;
    });
  }

  void _goToToday() {
    setState(() {
      final now = DateTime.now();
      _weekAnchor = now;
      _selectedDay = startOfDayLocal(now);
      _selectedMeeting = null;
    });
  }

  void _selectDay(DateTime day) {
    setState(() {
      _selectedDay = startOfDayLocal(day);
      _selectedMeeting = null;
    });
  }

  void _toggleMeeting(ClientScheduleMeeting meeting) {
    setState(() {
      _selectedMeeting = _selectedMeeting?.id == meeting.id ? null : meeting;
    });
  }

  Future<void> _cancelMeeting(ClientScheduleMeeting meeting) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel appointment?'),
        content: Text(
          'Cancel your session with ${meeting.specialistLabel}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Cancel appointment'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    try {
      await ref.read(clientRepositoryProvider).cancelAppointment(meeting.id);
      ref.invalidate(clientDashboardProvider);
      if (!mounted) return;
      setState(() => _selectedMeeting = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appointment cancelled')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not cancel: $e')),
      );
    }
  }

  Future<void> _joinMeeting(ClientScheduleMeeting meeting) async {
    final url = meeting.meetingUrl?.trim();
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  String _headerTitle(DateTime day) {
    if (isTodayLocal(day)) return 'Today';
    return DateFormat('EEEE').format(day);
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(clientDashboardProvider);

    return dashboard.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => EmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Could not load schedule',
        subtitle: e.toString(),
        actionLabel: 'Retry',
        onAction: () => ref.invalidate(clientDashboardProvider),
      ),
      data: (data) {
        final meetings = buildClientScheduleMeetings(data.allAppointments);
        final weekDays = weekDaysFromAnchor(_weekAnchor);
        final dayMeetings = meetings
            .where((m) => isSameDayLocal(m.start, _selectedDay))
            .toList();
        final bounds = scheduleGridBounds(dayMeetings);
        final timelineHeight =
            (bounds.hourEnd - bounds.hourStart) * _hourHeight;

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(clientDashboardProvider),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          DateFormat('MMM dd, yyyy').format(_selectedDay),
                          style: AppTypography.pageSubtitle.copyWith(
                            fontSize: 13,
                            color: AppColors.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _headerTitle(_selectedDay),
                          style: AppTypography.pageTitle,
                        ),
                      ],
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: () => context.go('/search'),
                    icon: const Icon(Icons.add_rounded, size: 18),
                    label: const Text('Add'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.brand,
                      foregroundColor: AppColors.onBrand,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadii.pill),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _WeekNavigator(
                weekStart: weekDays.first,
                weekEnd: weekDays.last,
                onPrev: () => _shiftWeek(-1),
                onNext: () => _shiftWeek(1),
                onToday: _goToToday,
              ),
              const SizedBox(height: 16),
              _WeekDayRow(
                days: weekDays,
                selectedDay: _selectedDay,
                meetings: meetings,
                onDaySelected: _selectDay,
              ),
              const SizedBox(height: 24),
              Text(
                isTodayLocal(_selectedDay) ? 'Schedule Today' : 'Schedule',
                style: AppTypography.pageTitle.copyWith(fontSize: 18),
              ),
              const SizedBox(height: 16),
              if (dayMeetings.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  alignment: Alignment.center,
                  child: Text(
                    'No meetings on this day',
                    style: AppTypography.pageSubtitle,
                  ),
                )
              else
                SizedBox(
                  height: timelineHeight,
                  child: _ScheduleTimeline(
                    dayMeetings: dayMeetings,
                    hourStart: bounds.hourStart,
                    hourEnd: bounds.hourEnd,
                    selectedDay: _selectedDay,
                    selectedMeetingId: _selectedMeeting?.id,
                    onMeetingTap: _toggleMeeting,
                  ),
                ),
              if (_selectedMeeting != null) ...[
                const SizedBox(height: 28),
                _MeetingDetailCard(
                  meeting: _selectedMeeting!,
                  onJoin: _selectedMeeting!.canJoin()
                      ? () => _joinMeeting(_selectedMeeting!)
                      : null,
                  onReschedule: () => context.go('/search'),
                  onCancel: () => _cancelMeeting(_selectedMeeting!),
                  onClose: () => setState(() => _selectedMeeting = null),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _WeekNavigator extends StatelessWidget {
  const _WeekNavigator({
    required this.weekStart,
    required this.weekEnd,
    required this.onPrev,
    required this.onNext,
    required this.onToday,
  });

  final DateTime weekStart;
  final DateTime weekEnd;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onToday;

  @override
  Widget build(BuildContext context) {
    final range = weekStart.year == weekEnd.year
        ? '${DateFormat('MMM d').format(weekStart)} – ${DateFormat('MMM d, yyyy').format(weekEnd)}'
        : '${DateFormat('MMM d, yyyy').format(weekStart)} – ${DateFormat('MMM d, yyyy').format(weekEnd)}';

    return Row(
      children: [
        _NavIconButton(icon: Icons.chevron_left_rounded, onTap: onPrev),
        Expanded(
          child: Column(
            children: [
              Text(
                range,
                textAlign: TextAlign.center,
                style: AppTypography.bodyMedium.copyWith(fontSize: 13),
              ),
              TextButton(
                onPressed: onToday,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.brand,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Today'),
              ),
            ],
          ),
        ),
        _NavIconButton(icon: Icons.chevron_right_rounded, onTap: onNext),
      ],
    );
  }
}

class _NavIconButton extends StatelessWidget {
  const _NavIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(AppRadii.md),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.md),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadii.md),
            border: Border.all(color: AppColors.outline.withValues(alpha: 0.5)),
          ),
          child: Icon(icon, color: AppColors.brand, size: 22),
        ),
      ),
    );
  }
}

class _WeekDayRow extends StatelessWidget {
  const _WeekDayRow({
    required this.days,
    required this.selectedDay,
    required this.meetings,
    required this.onDaySelected,
  });

  final List<DateTime> days;
  final DateTime selectedDay;
  final List<ClientScheduleMeeting> meetings;
  final ValueChanged<DateTime> onDaySelected;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (final day in days) ...[
          Expanded(
            child: _DayChip(
              day: day,
              selected: isSameDayLocal(day, selectedDay),
              hasMeetings: meetings.any((m) => isSameDayLocal(m.start, day)),
              onTap: () => onDaySelected(day),
            ),
          ),
        ],
      ],
    );
  }
}

class _DayChip extends StatelessWidget {
  const _DayChip({
    required this.day,
    required this.selected,
    required this.hasMeetings,
    required this.onTap,
  });

  final DateTime day;
  final bool selected;
  final bool hasMeetings;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dayLabel = DateFormat('E').format(day).substring(0, 2);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.surfaceContainer : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadii.lg),
          border: selected
              ? Border.all(color: AppColors.brand.withValues(alpha: 0.25))
              : null,
        ),
        child: Column(
          children: [
            Text(
              '${day.day}',
              style: AppTypography.bodyMedium.copyWith(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: selected ? AppColors.brand : AppColors.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              dayLabel,
              style: AppTypography.pageSubtitle.copyWith(
                fontSize: 11,
                color: selected ? AppColors.brand : AppColors.onSurfaceVariant,
              ),
            ),
            if (hasMeetings && !selected)
              Container(
                margin: const EdgeInsets.only(top: 4),
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AppColors.brand,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ScheduleTimeline extends StatelessWidget {
  const _ScheduleTimeline({
    required this.dayMeetings,
    required this.hourStart,
    required this.hourEnd,
    required this.selectedDay,
    required this.selectedMeetingId,
    required this.onMeetingTap,
  });

  final List<ClientScheduleMeeting> dayMeetings;
  final int hourStart;
  final int hourEnd;
  final DateTime selectedDay;
  final String? selectedMeetingId;
  final ValueChanged<ClientScheduleMeeting> onMeetingTap;

  double _topFor(DateTime time) {
    final minutes = (time.hour - hourStart) * 60 + time.minute;
    return minutes / 60.0 * _hourHeight;
  }

  double _heightFor(ClientScheduleMeeting meeting) {
    final minutes = meeting.end.difference(meeting.start).inMinutes;
    return (minutes / 60.0 * _hourHeight).clamp(48.0, double.infinity);
  }

  @override
  Widget build(BuildContext context) {
    final totalHeight = (hourEnd - hourStart) * _hourHeight;
    final now = DateTime.now();
    final showNowLine = isTodayLocal(selectedDay) &&
        now.hour >= hourStart &&
        (now.hour < hourEnd || (now.hour == hourEnd && now.minute == 0));

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: _timeLabelWidth,
          height: totalHeight,
          child: Column(
            children: [
              for (var h = hourStart; h < hourEnd; h++)
                SizedBox(
                  height: _hourHeight,
                  child: Align(
                    alignment: Alignment.topLeft,
                    child: Text(
                      '${h.toString().padLeft(2, '0')}:00',
                      style: AppTypography.pageSubtitle.copyWith(
                        fontSize: 11,
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: SizedBox(
            height: totalHeight,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                for (var h = hourStart; h < hourEnd; h++)
                  Positioned(
                    top: (h - hourStart) * _hourHeight,
                    left: 0,
                    right: 0,
                    child: Divider(
                      height: 1,
                      color: AppColors.outline.withValues(alpha: 0.35),
                    ),
                  ),
                if (showNowLine)
                  Positioned(
                    top: _topFor(now),
                    left: 0,
                    right: 0,
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.brand,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Expanded(
                          child: Container(
                            height: 2,
                            color: AppColors.brand,
                          ),
                        ),
                      ],
                    ),
                  ),
                for (final meeting in dayMeetings)
                  Positioned(
                    top: _topFor(meeting.start),
                    left: 0,
                    right: 0,
                    height: _heightFor(meeting),
                    child: _TimelineMeetingBar(
                      meeting: meeting,
                      selected: meeting.id == selectedMeetingId,
                      onTap: () => onMeetingTap(meeting),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TimelineMeetingBar extends StatelessWidget {
  const _TimelineMeetingBar({
    required this.meeting,
    required this.selected,
    required this.onTap,
  });

  final ClientScheduleMeeting meeting;
  final bool selected;
  final VoidCallback onTap;

  Color get _barColor {
    if (meeting.isPast()) {
      return AppColors.surfaceAlt;
    }
    if (meeting.canJoin()) {
      return const Color(0xFFFFE8DC);
    }
    return AppColors.surfaceContainer;
  }

  @override
  Widget build(BuildContext context) {
    final type = meeting.appointmentType?.trim();
    final title = type != null && type.isNotEmpty ? type : 'Consultation';

    return Padding(
      padding: const EdgeInsets.only(right: 4, bottom: 4),
      child: Material(
        color: _barColor,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        elevation: selected ? 2 : 0,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadii.xl),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadii.xl),
              border: selected
                  ? Border.all(color: AppColors.brand, width: 2)
                  : Border.all(
                      color: AppColors.outline.withValues(alpha: 0.2),
                    ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ctaBackground,
                        ),
                      ),
                      Text(
                        meeting.specialistLabel,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style:
                            AppTypography.pageSubtitle.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.surfaceContainer,
                  backgroundImage: meeting.professionalImage != null
                      ? CachedNetworkImageProvider(meeting.professionalImage!)
                      : null,
                  child: meeting.professionalImage == null
                      ? Text(
                          meeting.specialistLabel.isNotEmpty
                              ? meeting.specialistLabel[0].toUpperCase()
                              : '?',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.brand,
                            fontWeight: FontWeight.w700,
                          ),
                        )
                      : null,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MeetingDetailCard extends StatelessWidget {
  const _MeetingDetailCard({
    required this.meeting,
    required this.onReschedule,
    required this.onCancel,
    required this.onClose,
    this.onJoin,
  });

  final ClientScheduleMeeting meeting;
  final VoidCallback? onJoin;
  final VoidCallback onReschedule;
  final VoidCallback onCancel;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final type = meeting.appointmentType?.trim();
    final timeRange =
        '${DateFormat('HH:mm').format(meeting.start)}–${DateFormat('HH:mm').format(meeting.end)}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Reminder',
                    style: AppTypography.pageTitle.copyWith(fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Don't forget your upcoming appointment",
                    style: AppTypography.pageSubtitle.copyWith(fontSize: 13),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: onClose,
              icon: const Icon(Icons.close_rounded),
              color: AppColors.onSurfaceVariant,
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(AppRadii.xl),
            boxShadow: AppColors.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          meeting.specialistLabel,
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                            color: AppColors.ctaBackground,
                          ),
                        ),
                        if (type != null && type.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            type,
                            style: AppTypography.pageSubtitle.copyWith(
                              fontSize: 13,
                            ),
                          ),
                        ],
                        const SizedBox(height: 6),
                        Text(
                          formatMeetingDuration(meeting.start, meeting.end),
                          style: AppTypography.pageSubtitle.copyWith(
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadii.md),
                    child: meeting.professionalImage != null
                        ? CachedNetworkImage(
                            imageUrl: meeting.professionalImage!,
                            width: 56,
                            height: 56,
                            fit: BoxFit.cover,
                          )
                        : Container(
                            width: 56,
                            height: 56,
                            color: AppColors.surfaceContainer,
                            alignment: Alignment.center,
                            child: Text(
                              meeting.specialistLabel.isNotEmpty
                                  ? meeting.specialistLabel[0].toUpperCase()
                                  : '?',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.brand,
                                fontWeight: FontWeight.w700,
                                fontSize: 20,
                              ),
                            ),
                          ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_rounded,
                          size: 18,
                          color: AppColors.brand,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          DateFormat('EEEE, MMM d').format(meeting.start),
                          style:
                              AppTypography.bodyMedium.copyWith(fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(
                          Icons.schedule_rounded,
                          size: 18,
                          color: AppColors.brand,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          timeRange,
                          style:
                              AppTypography.bodyMedium.copyWith(fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (onJoin != null) ...[
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: onJoin,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.brand,
                      foregroundColor: AppColors.onBrand,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                      ),
                    ),
                    child: const Text('Join meeting'),
                  ),
                ),
                const SizedBox(height: 10),
              ],
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: onReschedule,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.brand,
                        foregroundColor: AppColors.onBrand,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                        ),
                      ),
                      child: const Text('Reschedule'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onCancel,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.brand,
                        side: const BorderSide(color: AppColors.brand),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
