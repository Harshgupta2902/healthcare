"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type HeaderProps,
  Views,
} from "react-big-calendar";
import {
  addDays,
  addWeeks,
  differenceInMinutes,
  format,
  getDay,
  isSameDay,
  isToday,
  parse,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { buildProfessionalScheduleTitle } from "@/lib/calendar/consultationMeetingTitle";
import type { ProfessionalGuestBooking } from "@/features/professional/actions";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./professional-schedule-calendar.css";

export type ScheduleDashboardAppointment = {
  id: string;
  appointmentType: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  meetingUrl: string | null;
  clientName?: string;
  clientEmail?: string;
};

export type ScheduleMeeting = {
  id: string;
  source: "appointment" | "guest";
  title: string;
  clientLabel: string;
  email?: string;
  phone?: string;
  start: Date;
  end: Date;
  status?: string;
  meetingUrl?: string | null;
  location?: string;
  category?: string;
  message?: string | null;
  appointmentType?: string;
  age?: number;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  meeting: ScheduleMeeting;
};

const HOUR_HEIGHT_PX = 64;
const MIN_EVENT_HEIGHT_PX = 32;
const DEFAULT_HOUR_START = 9;
const DEFAULT_HOUR_END = 17;

export type ScheduleAvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

function hoursToDate(hour: number): Date {
  return new Date(1970, 0, 1, hour, 0, 0, 0);
}

function computeScheduleGridBounds(
  availability: ScheduleAvailabilitySlot[],
  meetings: ScheduleMeeting[]
): { hourStart: number; hourEnd: number } {
  const activeSlots = availability.filter((slot) => slot.isAvailable !== false);

  let minMinutes = activeSlots.length
    ? Math.min(...activeSlots.map((slot) => parseTimeToMinutes(slot.startTime)))
    : DEFAULT_HOUR_START * 60;
  let maxMinutes = activeSlots.length
    ? Math.max(...activeSlots.map((slot) => parseTimeToMinutes(slot.endTime)))
    : DEFAULT_HOUR_END * 60;

  for (const meeting of meetings) {
    const start = meeting.start.getHours() * 60 + meeting.start.getMinutes();
    const end = meeting.end.getHours() * 60 + meeting.end.getMinutes();
    minMinutes = Math.min(minMinutes, start);
    maxMinutes = Math.max(maxMinutes, end);
  }

  const hourStart = Math.max(0, Math.floor(minMinutes / 60));
  const hourEnd = Math.min(24, Math.max(Math.ceil(maxMinutes / 60), hourStart + 1));

  return { hourStart, hourEnd };
}

function parseGuestStart(guest: ProfessionalGuestBooking) {
  return new Date(`${guest.appointmentDate}T${(guest.appointmentTime || "00:00").slice(0, 5)}:00`);
}

function parseGuestEnd(guest: ProfessionalGuestBooking, start: Date) {
  if (guest.meetingEndTime) {
    return new Date(`${guest.appointmentDate}T${guest.meetingEndTime.slice(0, 5)}:00`);
  }
  const minutes = guest.meetingDurationMinutes ?? 30;
  return new Date(start.getTime() + minutes * 60_000);
}

export function buildScheduleMeetings(
  appointments: ScheduleDashboardAppointment[],
  guestAppointments: ProfessionalGuestBooking[]
): ScheduleMeeting[] {
  const fromAppointments: ScheduleMeeting[] = appointments.map((apt) => {
    const clientLabel = apt.clientName || "Patient";
    const title = buildProfessionalScheduleTitle({
      category: apt.appointmentType,
      patientName: clientLabel,
    });
    return {
      id: `apt-${apt.id}`,
      source: "appointment",
      title,
      clientLabel,
      email: apt.clientEmail,
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      status: apt.status,
      meetingUrl: apt.meetingUrl,
      message: apt.notes,
      appointmentType: apt.appointmentType,
    };
  });

  const fromGuests: ScheduleMeeting[] = guestAppointments.map((guest) => {
    const start = parseGuestStart(guest);
    const end = parseGuestEnd(guest, start);
    const clientLabel = `${guest.firstName} ${guest.lastName}`.trim() || "Guest";
    const title = buildProfessionalScheduleTitle({
      category: guest.category,
      patientName: clientLabel,
    });
    return {
      id: `guest-${guest.id}`,
      source: "guest",
      title,
      clientLabel,
      email: guest.email,
      phone: guest.phone,
      start,
      end,
      location: [guest.city, guest.state].filter(Boolean).join(", ") || undefined,
      category: guest.category,
      message: guest.message,
      age: guest.age,
      meetingUrl: guest.calendarInviteUrl?.trim() || null,
    };
  });

  return [...fromAppointments, ...fromGuests].sort((a, b) => a.start.getTime() - b.start.getTime());
}

function eventClassName(meeting: ScheduleMeeting): string {
  if (meeting.meetingUrl) return "rbc-event--video";
  if (meeting.source === "guest") return "rbc-event--guest";
  return "rbc-event--appointment";
}

function ScheduleEvent({ event }: EventProps<CalendarEvent>) {
  const { meeting } = event;
  const durationMinutes = (event.end.getTime() - event.start.getTime()) / 60_000;
  const compact = durationMinutes <= 35;
  const showType = !compact && (meeting.category || meeting.appointmentType);

  return (
    <span className={cn("pro-schedule-event-inner", compact && "pro-schedule-event-inner--compact")}>
      <span className="pro-schedule-event-inner__title">{event.title}</span>
      <span className="pro-schedule-event-inner__time">
        {format(event.start, "h:mm")} – {format(event.end, "h:mm a")}
      </span>
      {showType ? (
        <span className="pro-schedule-event-inner__type">
          {meeting.category || meeting.appointmentType}
        </span>
      ) : null}
    </span>
  );
}

function ScheduleHeader({ date }: HeaderProps) {
  const today = isToday(date);
  return (
    <div className={cn("rbc-today flex flex-col items-center", today && "rbc-today-header")}>
      <span className="rbc-header-day-label">{format(date, "EEE")}</span>
      <span className={cn("rbc-day-number", today && "is-today")}>{format(date, "d")}</span>
    </div>
  );
}

type ProfessionalScheduleCalendarProps = {
  appointments: ScheduleDashboardAppointment[];
  guestAppointments: ProfessionalGuestBooking[];
  availability: ScheduleAvailabilitySlot[];
  mounted: boolean;
  isLoading: boolean;
  className?: string;
};

export function ProfessionalScheduleCalendar({
  appointments,
  guestAppointments,
  availability,
  mounted,
  isLoading,
  className,
}: ProfessionalScheduleCalendarProps) {
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleMeeting | null>(null);
  const [mobileDay, setMobileDay] = useState(() => startOfDay(new Date()));

  const meetings = useMemo(
    () => buildScheduleMeetings(appointments, guestAppointments),
    [appointments, guestAppointments]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index)),
    [weekAnchor]
  );

  const weekMeetings = useMemo(
    () => meetings.filter((meeting) => weekDays.some((day) => isSameDay(meeting.start, day))),
    [meetings, weekDays]
  );

  const mobileDayMeetings = useMemo(
    () => meetings.filter((meeting) => isSameDay(meeting.start, mobileDay)),
    [meetings, mobileDay]
  );

  const { hourStart, hourEnd } = useMemo(
    () => computeScheduleGridBounds(availability, meetings),
    [availability, meetings]
  );

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        start: meeting.start,
        end: meeting.end,
        meeting,
      })),
    [meetings]
  );

  const minTime = useMemo(() => hoursToDate(hourStart), [hourStart]);
  const maxTime = useMemo(() => hoursToDate(hourEnd), [hourEnd]);

  const scrollToTime = useMemo(() => {
    const now = new Date();
    const scrollHour = Math.max(hourStart, Math.min(now.getHours(), hourEnd - 1));
    return hoursToDate(scrollHour);
  }, [hourStart, hourEnd]);

  const calendarHeight = Math.max((hourEnd - hourStart) * HOUR_HEIGHT_PX + 88, 520);

  const goToday = () => {
    const today = new Date();
    setWeekAnchor(startOfWeek(today, { weekStartsOn: 1 }));
    setMobileDay(startOfDay(today));
  };

  const handleNavigate = useCallback((date: Date) => {
    setWeekAnchor(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      className: eventClassName(event.meeting),
      style: { minHeight: MIN_EVENT_HEIGHT_PX },
    }),
    []
  );

  const dayPropGetter = useCallback(
    (date: Date) => {
      const dayOfWeek = date.getDay();
      const hasAvailability = availability.some(
        (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable !== false
      );
      return {
        className: cn(
          isToday(date) && "rbc-today-col",
          !hasAvailability && availability.length > 0 && "rbc-off-range-day"
        ),
      };
    },
    [availability]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
      </div>
    );
  }

  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-xl border-lp-brand/25 text-lp-brand hover:bg-lp-brand/5"
            onClick={goToday}
          >
            Today
          </Button>
          <div className="flex items-center rounded-xl border border-lp-outline-variant/30 bg-white shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 cursor-pointer rounded-l-xl"
              onClick={() => setWeekAnchor((prev) => subWeeks(prev, 1))}
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[140px] px-2 text-center text-sm font-semibold text-lp-on-surface">
              {mounted ? format(weekDays[0], "MMM d") : "—"} – {mounted ? format(weekDays[6], "MMM d, yyyy") : "—"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 cursor-pointer rounded-r-xl"
              onClick={() => setWeekAnchor((prev) => addWeeks(prev, 1))}
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop — react-big-calendar week grid */}
      <div className="pro-schedule-calendar hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white shadow-md lg:block">
        {mounted ? (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            view={Views.WEEK}
            views={[Views.WEEK]}
            toolbar={false}
            date={weekAnchor}
            onNavigate={handleNavigate}
            onSelectEvent={(event) => setSelectedMeeting(event.meeting)}
            min={minTime}
            max={maxTime}
            // businessHours={businessHours}
            scrollToTime={scrollToTime}
            step={30}
            timeslots={2}
            popup
            showMultiDayTimes
            dayLayoutAlgorithm="overlap"
            components={{
              toolbar: () => null,
              event: ScheduleEvent,
              header: ScheduleHeader,
            }}
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            style={{ height: calendarHeight }}
          />
        ) : (
          <div style={{ height: calendarHeight }} className="animate-pulse bg-lp-surface-container-low/40" />
        )}

        {weekMeetings.length === 0 ? (
          <div className="border-t border-lp-outline-variant/15 bg-lp-surface-container-low/30 px-6 py-6 text-center text-sm text-lp-on-surface-variant">
            No meetings this week. Bookings from consultations will appear here.
          </div>
        ) : null}
      </div>

      {/* Mobile agenda */}
      <div className="space-y-3 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {weekDays.map((day) => {
            const selected = isSameDay(day, mobileDay);
            const count = meetings.filter((m) => isSameDay(m.start, day)).length;
            const today = isToday(day);
            return (
              <button
                key={`mob-${day.toISOString()}`}
                type="button"
                onClick={() => setMobileDay(startOfDay(day))}
                className={cn(
                  "flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 transition-all",
                  selected
                    ? "border-lp-brand/50 bg-gradient-to-b from-blue-50 to-white shadow-md shadow-blue-100/50"
                    : "border-lp-outline-variant/25 bg-white",
                  today && !selected && "ring-1 ring-lp-brand/30"
                )}
              >
                <span className="text-[10px] font-semibold uppercase text-lp-on-surface-variant">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "font-heading text-lg font-bold",
                    today || selected ? "text-lp-brand" : "text-lp-on-surface"
                  )}
                >
                  {format(day, "d")}
                </span>
                {count > 0 ? (
                  <span className="mt-0.5 rounded-full bg-lp-brand/10 px-1.5 text-[10px] font-bold text-lp-brand">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-lp-outline-variant/25 bg-white p-4 shadow-md">
          <p className="mb-3 font-heading text-sm font-bold text-lp-cta-bg">
            {mounted ? format(mobileDay, "EEEE, MMMM d") : "—"}
          </p>
          {mobileDayMeetings.length === 0 ? (
            <p className="py-8 text-center text-sm text-lp-on-surface-variant">No meetings on this day.</p>
          ) : (
            <div className="space-y-2">
              {mobileDayMeetings.map((meeting) => (
                <MobileMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onSelect={setSelectedMeeting}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MeetingDetailsDialog
        meeting={selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        mounted={mounted}
      />
    </div>
  );
}

function MobileMeetingCard({
  meeting,
  onSelect,
}: {
  meeting: ScheduleMeeting;
  onSelect: (meeting: ScheduleMeeting) => void;
}) {
  const colorClass =
    meeting.meetingUrl
      ? "border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white"
      : meeting.source === "guest"
        ? "border-l-blue-500 bg-gradient-to-r from-blue-50 to-white"
        : "border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white";

  return (
    <button
      type="button"
      onClick={() => onSelect(meeting)}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border border-lp-outline-variant/15 border-l-4 p-3 text-left shadow-sm transition-all hover:shadow-md",
        colorClass
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-lp-on-surface">{meeting.title}</p>
        <p className="text-xs font-medium text-lp-on-surface-variant">
          {format(meeting.start, "h:mm a")} – {format(meeting.end, "h:mm a")}
        </p>
        {meeting.category || meeting.appointmentType ? (
          <p className="mt-1 truncate text-xs font-semibold text-lp-brand">
            {meeting.category || meeting.appointmentType}
          </p>
        ) : null}
      </div>
      {meeting.meetingUrl ? <Video className="size-4 shrink-0 text-emerald-600" aria-hidden /> : null}
    </button>
  );
}

function formatMeetingDuration(start: Date, end: Date): string {
  const minutes = differenceInMinutes(end, start);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function MeetingDetailsDialog({
  meeting,
  onClose,
  mounted,
}: {
  meeting: ScheduleMeeting | null;
  onClose: () => void;
  mounted: boolean;
}) {
  const meetingUrl = meeting?.meetingUrl?.trim() || "";

  const handleCopyLink = async () => {
    if (!meetingUrl) return;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast.success("Meeting link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleOpenLink = () => {
    if (!meetingUrl) return;
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={meeting != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl sm:max-w-lg">
        {meeting ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{meeting.title}</DialogTitle>
              <DialogDescription>
                {meeting.source === "guest" ? "Guest consultation" : "In-app appointment"}
                {meeting.status ? ` · ${meeting.status}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <DetailRow
                icon={CalendarIcon}
                label="Date & time"
                value={
                  mounted
                    ? `${format(meeting.start, "EEE, MMM d, yyyy")} · ${format(meeting.start, "h:mm a")} – ${format(meeting.end, "h:mm a")}`
                    : "—"
                }
              />
              <DetailRow
                icon={Clock}
                label="Duration"
                value={mounted ? formatMeetingDuration(meeting.start, meeting.end) : "—"}
              />
              {meeting.category || meeting.appointmentType ? (
                <DetailRow
                  icon={Video}
                  label="Consultation type"
                  value={meeting.category || meeting.appointmentType || "—"}
                />
              ) : null}
              {meetingUrl ? (
                <DetailRow icon={Link2} label="Meeting link" value={meetingUrl} multiline />
              ) : (
                <div className="rounded-xl border border-dashed border-lp-outline-variant/35 bg-lp-surface-container-low/40 px-3 py-3 text-sm text-lp-on-surface-variant">
                  Meeting link is not available yet. It will appear here once the session is created.
                </div>
              )}
            </div>

            {meetingUrl ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer rounded-xl"
                  onClick={handleCopyLink}
                >
                  <Copy className="mr-2 size-4" />
                  Copy link
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand"
                  onClick={handleOpenLink}
                >
                  <ExternalLink className="mr-2 size-4" />
                  Open link
                </Button>
              </div>
            ) : null}
            
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-lp-outline-variant/20 bg-lp-surface-container-low/40 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-lp-brand" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">{label}</p>
        <p className={cn("text-lp-on-surface", multiline ? "break-all leading-relaxed" : "truncate")}>{value}</p>
      </div>
    </div>
  );
}
