"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Video,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ProfessionalGuestBooking } from "@/features/professional/actions";

type ConsultationRequest = {
  id: string;
  clientId: string;
  requestType: string;
  status: string;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  clientName?: string;
  clientEmail?: string;
  createdAt: string;
};

type GroupItem =
  | { type: "guest"; guest: ProfessionalGuestBooking }
  | { type: "request"; request: ConsultationRequest };

type ClientGroup = {
  key: string;
  clientName: string;
  clientEmail?: string;
  items: GroupItem[];
};

function buildClientGroups(
  guests: ProfessionalGuestBooking[],
  requests: ConsultationRequest[]
): ClientGroup[] {
  const map = new Map<string, ClientGroup>();

  const ensureGroup = (key: string, clientName: string, clientEmail?: string) => {
    if (!map.has(key)) {
      map.set(key, { key, clientName, clientEmail, items: [] });
    }
    return map.get(key)!;
  };

  for (const guest of guests) {
    const clientName = `${guest.firstName} ${guest.lastName}`.trim() || "Guest";
    const key = guest.email?.toLowerCase().trim() || clientName.toLowerCase();
    ensureGroup(key, clientName, guest.email).items.push({ type: "guest", guest });
  }

  for (const request of requests) {
    const clientName = request.clientName || "Healthcare Client";
    const key =
      request.clientEmail?.toLowerCase().trim() ||
      request.clientId ||
      clientName.toLowerCase();
    ensureGroup(key, clientName, request.clientEmail).items.push({ type: "request", request });
  }

  const itemTimestamp = (item: GroupItem) => {
    if (item.type === "guest") {
      return new Date(
        `${item.guest.appointmentDate}T${(item.guest.appointmentTime || "00:00").slice(0, 5)}:00`
      ).getTime();
    }
    if (item.request.preferredDate) {
      return new Date(item.request.preferredDate).getTime();
    }
    return new Date(item.request.createdAt).getTime();
  };

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => itemTimestamp(b) - itemTimestamp(a)),
    }))
    .sort((a, b) => (a.clientEmail || a.key).localeCompare(b.clientEmail || b.key));
}

function formatGuestDate(guest: ProfessionalGuestBooking, mounted: boolean) {
  if (!mounted) return "—";
  return new Date(
    `${guest.appointmentDate}T${(guest.appointmentTime || "00:00").slice(0, 5)}:00`
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatGuestTime(guest: ProfessionalGuestBooking) {
  const time = guest.appointmentTime?.slice(0, 5) || "—";
  if (!guest.meetingDurationMinutes) return time;
  return `${time} (${guest.meetingDurationMinutes} min)`;
}

function formatRequestDate(request: ConsultationRequest, mounted: boolean) {
  if (!mounted || !request.preferredDate) return "—";
  return new Date(request.preferredDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getGroupAge(group: ClientGroup): number | null {
  for (const item of group.items) {
    if (item.type === "guest" && item.guest.age != null) {
      return item.guest.age;
    }
  }
  return null;
}

function getItemAge(item: GroupItem): number | null {
  if (item.type === "guest" && item.guest.age != null) return item.guest.age;
  return null;
}

function getItemCategory(item: GroupItem) {
  if (item.type === "guest") {
    const g = item.guest;
    const parts: string[] = [];
    if (g.category) parts.push(g.category);
    return parts.join(" · ") || "—";
  }
  return `${item.request.requestType} consultation`;
}

function getItemAddress(item: GroupItem) {
  if (item.type === "guest") {
    const g = item.guest;
    return [g.city, g.state].filter(Boolean).join(", ") || "—";
  }
  return "Online";
}

function getItemTime(item: GroupItem) {
  if (item.type === "guest") return formatGuestTime(item.guest);
  return item.request.preferredTime || "—";
}

function getItemDate(item: GroupItem, mounted: boolean) {
  if (item.type === "guest") return formatGuestDate(item.guest, mounted);
  return formatRequestDate(item.request, mounted);
}

function getItemMessage(item: GroupItem) {
  if (item.type === "guest") return item.guest.message;
  return item.request.message;
}

function getGroupPreview(group: ClientGroup, mounted: boolean) {
  const latest = group.items[0];
  if (!latest || !mounted) return null;
  const date = getItemDate(latest, mounted);
  const time = getItemTime(latest);
  const category = getItemCategory(latest);
  return { date, time, category };
}

type ConsultationRequestsGroupedListProps = {
  guestAppointments: ProfessionalGuestBooking[];
  consultationRequests: ConsultationRequest[];
  mounted: boolean;
  isLoading: boolean;
  onPrescribe: (guest: ProfessionalGuestBooking) => void;
  onUpdateRequestStatus: (id: string, status: string) => void;
};

export function ConsultationRequestsGroupedList({
  guestAppointments,
  consultationRequests,
  mounted,
  isLoading,
  onPrescribe,
  onUpdateRequestStatus,
}: ConsultationRequestsGroupedListProps) {
  const groups = useMemo(
    () => buildClientGroups(guestAppointments, consultationRequests),
    [guestAppointments, consultationRequests]
  );

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);

  useEffect(() => {
    if (!didAutoExpand.current && groups.length > 0) {
      didAutoExpand.current = true;
      setExpandedKeys(new Set([groups[0].key]));
    }
  }, [groups]);

  const setGroupOpen = (key: string, open: boolean) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-lp-brand" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/50 py-16 text-center sm:py-24">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
          <MessageSquare className="h-10 w-10 text-lp-outline-variant" />
        </div>
        <h4 className="font-heading text-lg font-bold text-lp-cta-bg">Quiet Inbox</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lp-on-surface-variant">
          Guest bookings from your public link and in-app requests will show here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = expandedKeys.has(group.key);
        const pendingCount = group.items.filter(
          (item) => item.type === "request" && item.request.status === "pending"
        ).length;
        const preview = getGroupPreview(group, mounted);
        const groupAge = getGroupAge(group);

        return (
          <div
            key={group.key}
            className={cn(
              "overflow-hidden rounded-2xl border transition-shadow duration-200",
              isOpen
                ? "border-lp-brand/25 bg-white shadow-md shadow-lp-brand/5"
                : "border-lp-outline-variant/25 bg-lp-surface-container-lowest/90 shadow-sm hover:border-lp-brand/20 hover:shadow-md"
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setGroupOpen(group.key, !isOpen)}
              className="flex w-full items-start gap-4 px-4 py-4 text-left sm:items-center sm:px-5 sm:py-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lp-brand/15 to-lp-brand-bright/20 text-lp-brand">
                <Mail className="size-5" aria-hidden />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-heading text-base font-bold text-lp-cta-bg sm:text-lg">
                    {group.clientEmail || "Client"}
                    {groupAge != null ? (
                      <span className="font-sans text-sm font-semibold text-lp-on-surface-variant">
                        {" "}
                        · Age {groupAge}
                      </span>
                    ) : null}
                  </p>
                  <Badge
                    variant="outline"
                    className="rounded-full border-lp-outline-variant/40 bg-lp-surface-container-low px-2.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant"
                  >
                    {group.items.length} booking{group.items.length === 1 ? "" : "s"}
                  </Badge>
                  {pendingCount > 0 ? (
                    <Badge className="rounded-full border-amber-200/80 bg-amber-50 px-2.5 py-0 text-[10px] font-semibold uppercase text-amber-700">
                      {pendingCount} pending
                    </Badge>
                  ) : null}
                </div>

                {!isOpen && preview ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 text-xs text-lp-on-surface-variant sm:text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-lp-brand">
                      <CalendarIcon className="size-3.5" aria-hidden />
                      {preview.date}
                    </span>
                    <span className="text-lp-outline-variant" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {preview.time}
                    </span>
                    <span className="hidden text-lp-outline-variant sm:inline" aria-hidden>
                      ·
                    </span>
                    <span className="hidden truncate sm:inline">{preview.category}</span>
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  "mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors sm:mt-0",
                  isOpen
                    ? "border-lp-brand/30 bg-lp-brand/10 text-lp-brand"
                    : "border-lp-outline-variant/30 bg-white text-lp-on-surface-variant"
                )}
              >
                <ChevronDown
                  className={cn("size-5 transition-transform duration-200", isOpen && "rotate-180")}
                  aria-hidden
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-lp-outline-variant/20 bg-lp-surface-container-low/40 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-lp-outline-variant/20 hover:bg-transparent">
                            <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Date
                            </TableHead>
                            <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Age
                            </TableHead>
                            <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Category
                            </TableHead>
                            <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Address
                            </TableHead>
                            <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Time
                            </TableHead>
                            <TableHead className="h-9 min-w-[140px] text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Message
                            </TableHead>
                            <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((item) => (
                            <BookingTableRow
                              key={item.type === "guest" ? `guest-${item.guest.id}` : `request-${item.request.id}`}
                              item={item}
                              mounted={mounted}
                              onPrescribe={onPrescribe}
                              onUpdateRequestStatus={onUpdateRequestStatus}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                      {group.items.map((item) => (
                        <BookingMobileCard
                          key={item.type === "guest" ? `guest-${item.guest.id}` : `request-${item.request.id}`}
                          item={item}
                          mounted={mounted}
                          onPrescribe={onPrescribe}
                          onUpdateRequestStatus={onUpdateRequestStatus}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function BookingTableRow({
  item,
  mounted,
  onPrescribe,
  onUpdateRequestStatus,
}: {
  item: GroupItem;
  mounted: boolean;
  onPrescribe: (guest: ProfessionalGuestBooking) => void;
  onUpdateRequestStatus: (id: string, status: string) => void;
}) {
  const message = getItemMessage(item);
  const age = getItemAge(item);

  return (
    <TableRow className="border-lp-outline-variant/15 hover:bg-white/70">
      <TableCell className="py-3 text-sm font-medium text-lp-on-surface">
        {getItemDate(item, mounted)}
      </TableCell>
      <TableCell className="py-3 text-sm text-lp-on-surface-variant">
        {age != null ? age : "—"}
      </TableCell>
      <TableCell className="max-w-[180px] py-3 text-sm text-lp-on-surface-variant">
        <span className="line-clamp-2">{getItemCategory(item)}</span>
      </TableCell>
      <TableCell className="py-3 text-sm text-lp-on-surface-variant">{getItemAddress(item)}</TableCell>
      <TableCell className="py-3 text-sm text-lp-on-surface-variant">{getItemTime(item)}</TableCell>
      <TableCell className="max-w-[200px] py-3 text-sm text-lp-on-surface-variant">
        {message ? (
          <span className="line-clamp-2" title={message}>
            {message}
          </span>
        ) : (
          <span className="text-lp-outline-variant">—</span>
        )}
      </TableCell>
      <TableCell className="py-3 text-right">
        <BookingActions
          item={item}
          onPrescribe={onPrescribe}
          onUpdateRequestStatus={onUpdateRequestStatus}
          compact
        />
      </TableCell>
    </TableRow>
  );
}

function BookingMobileCard({
  item,
  mounted,
  onPrescribe,
  onUpdateRequestStatus,
}: {
  item: GroupItem;
  mounted: boolean;
  onPrescribe: (guest: ProfessionalGuestBooking) => void;
  onUpdateRequestStatus: (id: string, status: string) => void;
}) {
  const message = getItemMessage(item);
  const age = getItemAge(item);

  return (
    <div className="rounded-xl border border-lp-outline-variant/20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 font-heading text-sm font-bold text-lp-on-surface">
            <CalendarIcon className="size-4 text-lp-brand" aria-hidden />
            {getItemDate(item, mounted)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-lp-on-surface-variant">
            <Clock className="size-3.5" aria-hidden />
            {getItemTime(item)}
          </p>
        </div>
        {item.type === "request" ? (
          <RequestStatusBadge status={item.request.status} />
        ) : item.guest.prescriptionHtml ? (
          <Badge className="border-green-100 bg-green-50 text-[10px] font-semibold uppercase text-green-700">
            Rx saved
          </Badge>
        ) : null}
      </div>

      <dl className="space-y-2 text-sm">
        {age != null ? <MobileDetail label="Age" value={String(age)} /> : null}
        <MobileDetail icon={MapPin} label="Address" value={getItemAddress(item)} />
        <MobileDetail label="Category" value={getItemCategory(item)} />
        {message ? <MobileDetail icon={MessageSquare} label="Message" value={message} multiline /> : null}
      </dl>

      <div className="mt-4 border-t border-lp-outline-variant/15 pt-3">
        <BookingActions
          item={item}
          onPrescribe={onPrescribe}
          onUpdateRequestStatus={onUpdateRequestStatus}
        />
      </div>
    </div>
  );
}

function MobileDetail({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0 text-lp-brand/70" aria-hidden /> : null}
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">{label}</dt>
        <dd className={cn("text-lp-on-surface", multiline ? "leading-relaxed" : "truncate")}>{value}</dd>
      </div>
    </div>
  );
}

function RequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
        status === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : status === "accepted"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {status}
    </Badge>
  );
}

function BookingActions({
  item,
  onPrescribe,
  onUpdateRequestStatus,
  compact,
}: {
  item: GroupItem;
  onPrescribe: (guest: ProfessionalGuestBooking) => void;
  onUpdateRequestStatus: (id: string, status: string) => void;
  compact?: boolean;
}) {
  if (item.type === "guest") {
    const g = item.guest;
    return (
      <Button
        size="sm"
        variant={g.prescriptionHtml ? "outline" : "default"}
        className={cn(
          "rounded-xl font-semibold cursor-pointer",
          compact ? "h-8 px-3 text-xs" : "w-full sm:w-auto",
          g.prescriptionHtml
            ? "border-lp-brand/30 text-lp-brand hover:bg-lp-brand/5"
            : "bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand hover:opacity-95"
        )}
        onClick={() => onPrescribe(g)}
      >
        <FileText className="mr-1.5 size-3.5" aria-hidden />
        {g.prescriptionHtml ? "Edit Prescription" : "Prescribe"}
      </Button>
    );
  }

  const request = item.request;
  if (request.status !== "pending") {
    return (
      <div className={cn("flex items-center gap-2", compact ? "justify-end" : "")}>
        {request.requestType === "video" ? (
          <Video className="size-4 text-blue-500" aria-hidden />
        ) : (
          <MessageSquare className="size-4 text-emerald-500" aria-hidden />
        )}
        <RequestStatusBadge status={request.status} />
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", compact ? "justify-end" : "flex-col sm:flex-row")}>
      <Button
        size="sm"
        className={cn(
          "rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700",
          compact ? "h-8 px-3 text-xs" : "flex-1 sm:flex-none"
        )}
        onClick={() => onUpdateRequestStatus(request.id, "accepted")}
      >
        <CheckCircle className="mr-1 size-3.5" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "rounded-xl border-red-200 font-semibold text-red-600 hover:bg-red-50",
          compact ? "h-8 px-3 text-xs" : "flex-1 sm:flex-none"
        )}
        onClick={() => onUpdateRequestStatus(request.id, "rejected")}
      >
        <XCircle className="mr-1 size-3.5" />
        Decline
      </Button>
    </div>
  );
}
