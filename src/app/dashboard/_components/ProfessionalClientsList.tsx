"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronDown,
  Loader2,
  Mail,
  Phone,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProfessionalGuestBooking } from "@/features/professional/actions";
import { cn } from "@/lib/utils";

type DashboardAppointment = {
  id: string;
  clientId: string;
  startTime: string;
  clientName?: string;
  clientEmail?: string;
};

export type ProfessionalClientRecord = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kind: "registered" | "guest";
  lastSeen: Date;
  visitCount: number;
  category?: string;
};

type ProfessionalClientsListProps = {
  appointments: DashboardAppointment[];
  guestAppointments: ProfessionalGuestBooking[];
  isLoading: boolean;
  mounted: boolean;
};

function guestClientKey(guest: ProfessionalGuestBooking): string {
  if (guest.email?.trim()) return `guest-email:${guest.email.trim().toLowerCase()}`;
  if (guest.phone?.trim()) return `guest-phone:${guest.phone.trim()}`;
  return `guest-name:${guest.firstName}-${guest.lastName}`.toLowerCase();
}

function buildClientRecords(
  appointments: DashboardAppointment[],
  guestAppointments: ProfessionalGuestBooking[]
): ProfessionalClientRecord[] {
  const clients: ProfessionalClientRecord[] = [];

  const byClientId = new Map<string, DashboardAppointment[]>();
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
    {
      name: string;
      email?: string;
      phone?: string;
      lastSeen: Date;
      visitCount: number;
      category?: string;
    }
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
        existing.phone = guest.phone;
      }
      continue;
    }

    guestGroups.set(key, {
      name,
      email: guest.email,
      phone: guest.phone,
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
      phone: group.phone,
      kind: "guest",
      lastSeen: group.lastSeen,
      visitCount: group.visitCount,
      category: group.category,
    });
  }

  return clients.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
}

function formatDate(date: Date, mounted: boolean) {
  if (!mounted) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ClientKindBadge({ kind }: { kind: ProfessionalClientRecord["kind"] }) {
  if (kind === "registered") {
    return (
      <Badge className="rounded-full bg-slate-100 px-2 py-0 text-[10px] font-semibold uppercase text-slate-700">
        Registered
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full bg-indigo-100 px-2 py-0 text-[10px] font-semibold uppercase text-indigo-700">
      Guest
    </Badge>
  );
}

function MobileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-lp-outline-variant/20 bg-white/80 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-lp-brand" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">
          {label}
        </p>
        <p className="break-all text-sm font-medium text-lp-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function ProfessionalClientsList({
  appointments,
  guestAppointments,
  isLoading,
  mounted,
}: ProfessionalClientsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didAutoExpand = useRef(false);

  const clients = useMemo(
    () => buildClientRecords(appointments, guestAppointments),
    [appointments, guestAppointments]
  );

  useEffect(() => {
    if (!didAutoExpand.current && clients.length > 0) {
      didAutoExpand.current = true;
      setExpandedIds(new Set([clients[0].id]));
    }
  }, [clients]);

  const toggleRow = (id: string, open: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
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

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-lp-outline-variant/30 bg-lp-surface-container-low/50 py-16 text-center sm:py-24">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Users className="h-10 w-10 text-lp-outline-variant" />
        </div>
        <h4 className="font-heading text-lg font-bold text-lp-cta-bg">No clients yet</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lp-on-surface-variant">
          People you consult with will be listed here after your first appointment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-2xl border border-lp-outline-variant/25 bg-white md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="border-lp-outline-variant/20 bg-lp-surface-container-low/50 hover:bg-lp-surface-container-low/50">
              <TableHead className="h-10 w-[24%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Client
              </TableHead>
              <TableHead className="h-10 w-[24%] px-4 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Contact
              </TableHead>
              <TableHead className="h-10 w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Type
              </TableHead>
              <TableHead className="h-10 w-[10%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Visits
              </TableHead>
              <TableHead className="h-10 w-[18%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Last seen
              </TableHead>
              <TableHead className="h-10 w-[12%] px-3 text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                Category
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className="border-lp-outline-variant/15 hover:bg-lp-surface-container-low/30"
              >
                <TableCell className="align-middle px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-lp-on-surface-variant">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-heading text-sm font-bold leading-snug text-lp-on-surface">
                      {client.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-middle px-4 py-3 text-sm text-lp-on-surface-variant">
                  <span className="line-clamp-2">{client.email || client.phone || "—"}</span>
                </TableCell>
                <TableCell className="align-middle px-3 py-3">
                  <ClientKindBadge kind={client.kind} />
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm font-semibold tabular-nums text-lp-brand">
                  {client.visitCount}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-on-surface-variant">
                  {formatDate(client.lastSeen, mounted)}
                </TableCell>
                <TableCell className="align-middle px-3 py-3 text-sm text-lp-brand">
                  <span className="line-clamp-2">{client.category || "—"}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {clients.map((client) => {
          const isOpen = expandedIds.has(client.id);
          return (
            <div
              key={client.id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-shadow duration-200",
                isOpen
                  ? "border-lp-brand/25 bg-white shadow-md shadow-lp-brand/5"
                  : "border-lp-outline-variant/25 bg-lp-surface-container-lowest/90 shadow-sm"
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRow(client.id, !isOpen)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-lp-on-surface-variant">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-base font-bold leading-snug text-lp-cta-bg">
                    {client.name}
                  </p>
                  <p className="truncate text-sm text-lp-on-surface-variant">
                    {client.email || client.phone || "No contact on file"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <ClientKindBadge kind={client.kind} />
                    <Badge
                      variant="outline"
                      className="rounded-full border-lp-outline-variant/40 bg-lp-surface-container-low px-2 py-0 text-[10px] font-semibold text-lp-brand"
                    >
                      {client.visitCount} visit{client.visitCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border",
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
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 border-t border-lp-outline-variant/20 bg-lp-surface-container-low/40 px-4 py-4">
                      {client.email ? (
                        <MobileDetail icon={Mail} label="Email" value={client.email} />
                      ) : null}
                      {client.phone ? (
                        <MobileDetail icon={Phone} label="Phone" value={client.phone} />
                      ) : null}
                      <MobileDetail
                        icon={CalendarIcon}
                        label="Last seen"
                        value={formatDate(client.lastSeen, mounted)}
                      />
                      {client.category ? (
                        <MobileDetail
                          icon={Stethoscope}
                          label="Category"
                          value={client.category}
                        />
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
