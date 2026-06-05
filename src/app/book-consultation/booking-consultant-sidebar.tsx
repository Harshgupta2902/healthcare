"use client";

import Image from "next/image";
import { Calendar, Globe, MapPin, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { getProfessionalById } from "@/features/professional/actions";

type BookingConsultant = NonNullable<Awaited<ReturnType<typeof getProfessionalById>>>;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatSessionFee(fee?: number | null) {
  return `₹${((fee || 0) / 100).toLocaleString("en-IN")} / session`;
}

function formatClockTime(time: string) {
  const [hRaw, mRaw] = time.split(":");
  const h = parseInt(hRaw || "0", 10);
  const m = parseInt(mRaw || "0", 10);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function summarizeAvailability(
  availability: { day_of_week: number; start_time: string; end_time: string }[],
) {
  if (!availability.length) {
    return {
      days: "Flexible scheduling",
      hours: "Choose your preferred date and time",
    };
  }

  const sortedDays = [...new Set(availability.map((s) => s.day_of_week))].sort((a, b) => a - b);
  const first = sortedDays[0]!;
  const last = sortedDays[sortedDays.length - 1]!;
  const daysLabel =
    sortedDays.length === 1
      ? DAY_NAMES[first]
      : sortedDays.length >= 5 && last - first === sortedDays.length - 1
        ? `${DAY_NAMES[first]} - ${DAY_NAMES[last]}`
        : sortedDays.map((d) => DAY_NAMES[d]).join(", ");

  const slot = availability[0]!;
  return {
    days: `Available ${daysLabel}`,
    hours: `${formatClockTime(slot.start_time)} - ${formatClockTime(slot.end_time)}`,
  };
}

function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="lg:col-span-4">
      <div className="lg:sticky lg:top-28">{children}</div>
    </aside>
  );
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="booking-shadow overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest">
      {children}
    </div>
  );
}

export function BookingConsultantSidebar({
  consultant,
  loading,
}: {
  consultant?: BookingConsultant;
  loading: boolean;
}) {
  if (loading) {
    return (
      <SidebarShell>
        <SidebarCard>
          <Skeleton className="h-64 w-full rounded-none" />
          <div className="space-y-4 p-6 sm:p-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        </SidebarCard>
      </SidebarShell>
    );
  }

  if (!consultant) return null;

  const displayName = consultant.displayName ?? consultant.name;
  const availability = summarizeAvailability(consultant.availability ?? []);
  const location = consultant.city?.trim() || "Online";

  return (
    <SidebarShell>
      <SidebarCard>
        <div className="relative h-64 w-full bg-lp-surface-container">
          {consultant.profilePhotoUrl ? (
            <Image
              src={consultant.profilePhotoUrl}
              alt={displayName}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lp-surface-container-high to-lp-surface-container">
              <span className="font-heading text-5xl font-bold text-lp-brand/40">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute bottom-4 right-4 rounded-full bg-lp-brand-bright px-4 py-1 font-sans text-sm font-semibold text-lp-on-brand shadow-lg">
            {formatSessionFee(consultant.consultationFee)}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="mb-1 font-heading text-2xl font-bold text-lp-on-surface sm:text-[32px] sm:leading-10">
            {displayName}
          </h2>
          <p className="mb-4 font-sans text-sm font-semibold text-lp-brand">{consultant.specialization}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-lp-surface-container-low px-3 py-1 font-sans text-xs font-semibold text-lp-on-surface-variant">
              <MapPin className="size-4 shrink-0 text-lp-brand" aria-hidden />
              {location}
            </span>
            {consultant.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-lp-surface-container-low px-3 py-1 font-sans text-xs font-semibold text-lp-on-surface-variant">
                <ShieldCheck className="size-4 shrink-0 text-lp-brand" aria-hidden />
                Verified Pro
              </span>
            ) : null}
          </div>

          <div className="space-y-4 border-t border-lp-outline-variant/20 pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-lp-surface-container-high p-2">
                <Calendar className="size-5 text-lp-brand" aria-hidden />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-lp-on-surface">{availability.days}</p>
                <p className="font-sans text-sm text-lp-on-surface-variant">{availability.hours}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-lp-surface-container-high p-2">
                <Globe className="size-5 text-lp-brand" aria-hidden />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-lp-on-surface">Languages</p>
                <p className="font-sans text-sm text-lp-on-surface-variant">Hindi, English</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarCard>
    </SidebarShell>
  );
}
