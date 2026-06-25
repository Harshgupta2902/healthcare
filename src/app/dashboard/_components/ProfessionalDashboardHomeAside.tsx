"use client";

import { useMemo, type ReactNode } from "react";
import { format, isToday } from "date-fns";
import { IndianRupee, Loader2, Users, Video } from "lucide-react";
import type { ProfessionalGuestBooking } from "@/features/professional/actions";
import type { DashboardSectionId } from "./dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardSectionContext } from "./dashboard-section-context";
import { dashboardGlassCard } from "./dashboard-theme";
import {
  buildScheduleMeetings,
  type ScheduleDashboardAppointment,
  type ScheduleMeeting,
} from "./ProfessionalScheduleCalendar";

type HomeAsideAppointment = ScheduleDashboardAppointment & {
  clientId: string;
};

type DashboardPayment = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  clientName?: string;
};

type RecentClient = {
  id: string;
  name: string;
  email?: string;
  kind: "registered" | "guest";
  lastSeen: Date;
  visitCount?: number;
  category?: string;
};

const MAX_ASIDE_ITEMS = 3;

type GroupedMeetingClient = {
  id: string;
  name: string;
  meetings: ScheduleMeeting[];
};

function clientGroupKey(meeting: ScheduleMeeting): string {
  if (meeting.email?.trim()) return `email:${meeting.email.trim().toLowerCase()}`;
  return `name:${meeting.clientLabel.trim().toLowerCase()}`;
}

function groupMeetingsByClient(meetings: ScheduleMeeting[]): GroupedMeetingClient[] {
  const map = new Map<string, GroupedMeetingClient>();

  for (const meeting of meetings) {
    const key = clientGroupKey(meeting);
    const existing = map.get(key);
    if (existing) {
      existing.meetings.push(meeting);
      existing.meetings.sort((a, b) => a.start.getTime() - b.start.getTime());
      continue;
    }
    map.set(key, {
      id: key,
      name: meeting.clientLabel,
      meetings: [meeting],
    });
  }

  return [...map.values()].sort(
    (a, b) => a.meetings[0].start.getTime() - b.meetings[0].start.getTime()
  );
}

function groupTodayMeetingsByClient(meetings: ScheduleMeeting[]): GroupedMeetingClient[] {
  return groupMeetingsByClient(meetings).slice(0, MAX_ASIDE_ITEMS);
}

function guestClientKey(guest: ProfessionalGuestBooking): string {
  if (guest.email?.trim()) return `guest-email:${guest.email.trim().toLowerCase()}`;
  if (guest.phone?.trim()) return `guest-phone:${guest.phone.trim()}`;
  return `guest-name:${guest.firstName}-${guest.lastName}`.toLowerCase();
}

function buildRecentClients(
  appointments: HomeAsideAppointment[],
  guestAppointments: ProfessionalGuestBooking[]
): RecentClient[] {
  const clients: RecentClient[] = [];

  const byClientId = new Map<string, HomeAsideAppointment[]>();
  for (const apt of appointments) {
    const list = byClientId.get(apt.clientId) ?? [];
    list.push(apt);
    byClientId.set(apt.clientId, list);
  }

  for (const [clientId, apts] of byClientId) {
    const sorted = [...apts].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    const latest = sorted[0];
    clients.push({
      id: `client-${clientId}`,
      name: latest.clientName || "Patient",
      email: latest.clientEmail,
      kind: "registered",
      lastSeen: new Date(latest.startTime),
      visitCount: apts.length,
    });
  }

  const guestGroups = new Map<
    string,
    { name: string; email?: string; lastSeen: Date; visitCount: number; category?: string }
  >();

  for (const guest of guestAppointments) {
    const key = guestClientKey(guest);
    const lastSeen = new Date(
      `${guest.appointmentDate}T${(guest.appointmentTime || "00:00").slice(0, 5)}:00`
    );
    const name = `${guest.firstName} ${guest.lastName}`.trim() || "Guest";
    const existing = guestGroups.get(key);

    if (existing) {
      existing.visitCount += 1;
      if (lastSeen.getTime() > existing.lastSeen.getTime()) {
        existing.lastSeen = lastSeen;
        existing.name = name;
        existing.category = guest.category;
      }
      continue;
    }

    guestGroups.set(key, {
      name,
      email: guest.email,
      lastSeen,
      visitCount: 1,
      category: guest.category,
    });
  }

  for (const [key, group] of guestGroups) {
    clients.push({
      id: key,
      name: group.name,
      email: group.email,
      kind: "guest",
      lastSeen: group.lastSeen,
      visitCount: group.visitCount,
      category: group.category,
    });
  }

  return clients
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    .slice(0, MAX_ASIDE_ITEMS);
}

type ProfessionalDashboardHomeAsideProps = {
  appointments: HomeAsideAppointment[];
  guestAppointments: ProfessionalGuestBooking[];
  payments: DashboardPayment[];
  mounted: boolean;
  isLoading: boolean;
};

export function ProfessionalDashboardHomeAside({
  appointments,
  guestAppointments,
  payments,
  mounted,
  isLoading,
}: ProfessionalDashboardHomeAsideProps) {
  const { setActiveSection } = useDashboardSectionContext();

  const allMeetings = useMemo(
    () => buildScheduleMeetings(appointments, guestAppointments),
    [appointments, guestAppointments]
  );

  const todayMeetingGroups = useMemo(() => {
    const today = allMeetings.filter((meeting) => isToday(meeting.start));
    return groupTodayMeetingsByClient(today);
  }, [allMeetings]);

  const hasTodayMeetings = todayMeetingGroups.length > 0;

  const upcomingMeetings = useMemo(() => {
    const now = Date.now();
    return allMeetings
      .filter((meeting) => {
        if (meeting.start.getTime() <= now) return false;
        // Avoid duplicating clients already listed under Today's meetings
        if (hasTodayMeetings && isToday(meeting.start)) return false;
        return true;
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, MAX_ASIDE_ITEMS);
  }, [allMeetings, hasTodayMeetings]);

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, MAX_ASIDE_ITEMS),
    [payments]
  );

  const recentClients = useMemo(
    () => buildRecentClients(appointments, guestAppointments),
    [appointments, guestAppointments]
  );

  const showTodayMeetings = !isLoading && hasTodayMeetings;
  const showUpcomingMeetings = !isLoading && upcomingMeetings.length > 0;
  const showRecentEarnings = !isLoading && recentPayments.length > 0;

  if (isLoading) {
    return (
      <Card className={cn(dashboardGlassCard, "flex min-h-[200px] min-w-0 items-center justify-center")}>
        <Loader2 className="h-8 w-8 animate-spin text-lp-brand" />
      </Card>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showTodayMeetings ? (
        <AsideSection
          title="Today's meetings"
          description="Your consultations scheduled for today"
          actionLabel="View dashboard"
          actionSection="home"
          onNavigate={setActiveSection}
        >
          <div className="space-y-2">
            {todayMeetingGroups.map((group) => (
              <TodayClientGroupRow key={group.id} group={group} mounted={mounted} />
            ))}
          </div>
        </AsideSection>
      ) : null}

      {showUpcomingMeetings ? (
        <AsideSection
          title="Upcoming clients"
          description="Your next scheduled consultations"
          actionLabel="View dashboard"
          actionSection="home"
          onNavigate={setActiveSection}
        >
          <div className="space-y-2">
            {upcomingMeetings.map((meeting) => (
              <UpcomingMeetingRow key={meeting.id} meeting={meeting} mounted={mounted} />
            ))}
          </div>
        </AsideSection>
      ) : null}

      {showRecentEarnings ? (
        <AsideSection
          title="Recent earnings"
          description="Your latest payment activity"
          actionLabel="All payments"
          actionSection="payments"
          onNavigate={setActiveSection}
        >
          <div className="space-y-2">
            {recentPayments.map((payment) => (
              <EarningsRow key={payment.id} payment={payment} mounted={mounted} />
            ))}
          </div>
        </AsideSection>
      ) : null}

      <AsideSection
        title="Recent clients"
        description="People you have consulted recently"
        actionLabel="All clients"
        actionSection="clients"
        onNavigate={setActiveSection}
      >
        {recentClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/40 px-4 py-10 text-center">
            <Users className="mb-2 h-8 w-8 text-lp-outline-variant/70" />
            <p className="font-medium text-lp-on-surface">No clients till now</p>
            <p className="mt-1 text-sm text-lp-on-surface-variant">
              Client records will appear here after your first consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentClients.map((client) => (
              <ClientRow key={client.id} client={client} mounted={mounted} />
            ))}
          </div>
        )}
      </AsideSection>
    </div>
  );
}

function AsideSection({
  title,
  description,
  actionLabel,
  actionSection,
  onNavigate,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionSection: DashboardSectionId;
  onNavigate: (section: DashboardSectionId) => void;
  children: ReactNode;
}) {
  return (
    <Card className={cn(dashboardGlassCard, "min-w-0")}>
      <CardHeader className="border-b border-lp-outline-variant/20 bg-gradient-to-r from-lp-surface-container-low/80 to-lp-surface-container/50 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="font-heading text-lg font-bold text-lp-cta-bg sm:text-xl">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-xl text-lp-brand hover:bg-lp-brand/5"
            onClick={() => onNavigate(actionSection)}
          >
            {actionLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

function TodayClientGroupRow({
  group,
  mounted,
}: {
  group: GroupedMeetingClient;
  mounted: boolean;
}) {
  const primaryMeeting =
    group.meetings.find((meeting) => meeting.meetingUrl?.trim()) ?? group.meetings[0];
  const meetingUrl = primaryMeeting.meetingUrl?.trim();
  const meetingCount = group.meetings.length;
  const sharedPrescriptionCount = Math.max(
    ...group.meetings.map((meeting) => meeting.sharedPrescriptionCount ?? 0),
    0,
  );

  return (
    <div className="flex items-start gap-3 rounded-xl border border-lp-outline-variant/20 bg-white p-3 shadow-sm">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl font-bold",
          meetingUrl
            ? "bg-emerald-50 text-emerald-700"
            : primaryMeeting.source === "guest"
              ? "bg-blue-50 text-blue-700"
              : "bg-indigo-50 text-indigo-700"
        )}
      >
        {group.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-lp-on-surface">{group.name}</p>
          {meetingCount > 1 ? (
            <Badge className="rounded-full bg-lp-brand/10 px-1.5 py-0 text-[9px] font-bold text-lp-brand">
              {meetingCount} today
            </Badge>
          ) : null}
        </div>
        <p className="text-xs font-medium text-lp-on-surface-variant">
          {mounted
            ? group.meetings.map((meeting) => format(meeting.start, "h:mm a")).join(" · ")
            : "—"}
        </p>
        <p className="mt-0.5 truncate text-xs text-lp-brand">{primaryMeeting.title}</p>
        {sharedPrescriptionCount > 0 ? (
          <p className="mt-1 text-xs font-medium text-teal-700">
            {sharedPrescriptionCount} prior prescription
            {sharedPrescriptionCount === 1 ? "" : "s"} shared
          </p>
        ) : null}
      </div>
      {meetingUrl ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="shrink-0 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
            <Video className="mr-1.5 size-3.5" />
            Join
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function UpcomingMeetingRow({
  meeting,
  mounted,
}: {
  meeting: ScheduleMeeting;
  mounted: boolean;
}) {
  const meetingUrl = meeting.meetingUrl?.trim();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-lp-outline-variant/20 bg-white p-3 shadow-sm">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl font-bold",
          meetingUrl
            ? "bg-emerald-50 text-emerald-700"
            : meeting.source === "guest"
              ? "bg-blue-50 text-blue-700"
              : "bg-indigo-50 text-indigo-700"
        )}
      >
        {meeting.clientLabel.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-lp-on-surface">{meeting.title}</p>
        <p className="text-xs font-medium text-lp-on-surface-variant">
          {mounted ? format(meeting.start, "EEE, MMM d · h:mm a") : "—"}
        </p>
        <p className="mt-0.5 truncate text-xs text-lp-brand">{meeting.clientLabel}</p>
        {(meeting.sharedPrescriptionCount ?? 0) > 0 ? (
          <p className="mt-1 text-xs font-medium text-teal-700">
            {meeting.sharedPrescriptionCount} prior prescription
            {meeting.sharedPrescriptionCount === 1 ? "" : "s"} shared
          </p>
        ) : null}
      </div>
      {meetingUrl ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="shrink-0 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
            <Video className="mr-1.5 size-3.5" />
            Join
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function EarningsRow({
  payment,
  mounted,
}: {
  payment: DashboardPayment;
  mounted: boolean;
}) {
  const isCompleted = payment.status === "completed";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-lp-outline-variant/20 bg-white p-3 shadow-sm">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          isCompleted ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
        )}
      >
        <IndianRupee className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-lg font-bold text-lp-cta-bg">
          ₹{(payment.amount / 100).toFixed(2)}
        </p>
        <p className="truncate text-xs font-medium text-lp-on-surface-variant">
          {payment.clientName || "Direct payment"} · {payment.paymentMethod}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <Badge
          className={cn(
            "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase",
            isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          )}
        >
          {payment.status}
        </Badge>
        <p className="mt-1 text-[10px] font-medium text-lp-on-surface-variant">
          {mounted
            ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })
            : "—"}
        </p>
      </div>
    </div>
  );
}

function ClientRow({
  client,
  mounted,
}: {
  client: RecentClient;
  mounted: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-lp-outline-variant/20 bg-white p-3 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 font-bold text-lp-on-surface-variant">
        {client.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-lp-on-surface">{client.name}</p>
          {client.kind === "guest" ? (
            <Badge className="rounded-full bg-indigo-100 px-1.5 py-0 text-[9px] font-bold uppercase text-indigo-700">
              Guest
            </Badge>
          ) : null}
        </div>
        {client.email ? (
          <p className="truncate text-xs text-lp-on-surface-variant">{client.email}</p>
        ) : client.category ? (
          <p className="truncate text-xs text-lp-brand">{client.category}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">
          Last seen
        </p>
        <p className="text-xs font-bold text-lp-cta-bg">
          {mounted
            ? client.lastSeen.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
        </p>
        {client.visitCount && client.visitCount > 1 ? (
          <p className="text-[10px] text-lp-brand">{client.visitCount} visits</p>
        ) : null}
      </div>
    </div>
  );
}
