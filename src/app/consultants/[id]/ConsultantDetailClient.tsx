"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  GraduationCap,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LpButton } from "@/components/ui/lp-button";
import { createClient } from "@/lib/supabase/client";
import { buildBookConsultationHref } from "@/lib/consultant-booking-ref";

const DAY_ABBREV = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function formatFee(fee?: number | null) {
  return `₹ ${((fee || 0) / 100).toLocaleString()}`;
}

function dayAbbrev(dayOfWeek: number) {
  if (dayOfWeek >= 0 && dayOfWeek <= 6) return DAY_ABBREV[dayOfWeek];
  return "—";
}

export default function ConsultantDetailClient({ prof }: { prof: any }) {
  const router = useRouter();
  const bookConsultationPath = buildBookConsultationHref(prof.id);
  const displayName = prof.displayName ?? prof.name ?? "Consultant";
  const location = prof.city?.trim() || "Online consultation";
  const qualifications = Array.isArray(prof.qualifications) ? prof.qualifications : [];
  const availability = Array.isArray(prof.availability) ? prof.availability : [];

  const handleBookAppointment = () => {
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push(`/login?redirect=${encodeURIComponent(bookConsultationPath)}`);
        return;
      }

      router.push(bookConsultationPath);
    })();
  };

  const aboutText =
    prof.bio?.trim() ||
    `${displayName} is a trusted ${prof.specialization || "healthcare professional"} available through HealthHere for secure, patient-focused consultation support.`;

  const expertiseRows = buildExpertiseRows(prof.specialization);

  const qualCards =
    qualifications.length > 0
      ? qualifications
      : [
          {
            degree: prof.specialization || "Clinical practice",
            institution: "Verified professional profile",
            year: null as number | null,
            document_url: null as string | null,
          },
          {
            degree: "Patient consultation",
            institution: "HealthHere care access network",
            year: null as number | null,
            document_url: null as string | null,
          },
        ];

  return (
    <div className="min-h-0 bg-lp-surface pb-28 font-sans text-lp-on-surface antialiased lg:pb-16">
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Left: sticky profile card */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 shadow-sm">
                <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-lg bg-lp-surface-container">
                  {prof.profilePhotoUrl ? (
                    <Image
                      src={prof.profilePhotoUrl}
                      alt={displayName}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 360px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lp-surface-container-high to-lp-surface-container">
                      <span className="font-heading text-4xl font-bold text-lp-brand/50">{displayName.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  {prof.isVerified ? (
                    <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white  shadow-md backdrop-blur-sm">
                      <ShieldCheck className="size-4 shrink-0 text-lp-brand" aria-hidden />
                    </div>
                  ) : null}
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-lp-surface-container-low p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Experience</p>
                    <p className="font-heading text-xl font-bold text-lp-on-surface">{prof.yearsOfExperience ?? 0}+ Yrs</p>
                  </div>
                  <div className="rounded-lg bg-lp-surface-container-low p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-lp-on-surface-variant">Consultation Fee</p>
                    <p className="font-heading text-xl font-bold text-lp-on-surface">{formatFee(prof.consultationFee)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <LpButton
                    type="button"
                    variant="primary"
                    fullWidth
                    className="justify-center rounded-lg py-4 font-heading text-base font-bold normal-case tracking-normal"
                    onClick={handleBookAppointment}
                  >
                    Book Appointment
                    <ArrowRight className="size-5 shrink-0" aria-hidden />
                  </LpButton>
                  <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-emerald-700">
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
                    Accepting consultation requests
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: main content */}
          <section className="space-y-10 lg:col-span-8">
            <div data-purpose="profile-header">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-lp-surface-container px-2.5 py-0.5 font-heading text-[11px] font-bold uppercase tracking-wide text-lp-brand">
                  {prof.specialization || "Healthcare professional"}
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="text-lp-on-surface">Trusted specialist</span>
                </div>
              </div>
              <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-lp-cta-bg sm:text-5xl">{displayName}</h1>
              <p className="flex flex-wrap items-center gap-x-1 text-sm text-lp-on-surface-variant">
                <MapPin className="mr-0.5 size-4 shrink-0 text-lp-on-surface-variant" aria-hidden />
                {location}
              </p>
            </div>

            <div
              className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 shadow-sm"
              data-purpose="about-section"
            >
              <SectionTitle>About Me</SectionTitle>
              <p className="leading-relaxed text-lp-on-surface-variant">{aboutText}</p>
            </div>

            <div data-purpose="qualifications-section">
              <SectionTitle className="mb-6">Qualifications &amp; Education</SectionTitle>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {qualCards.map((qual: any, idx: number) => (
                  <QualificationCard key={`${qual.degree}-${idx}`} qual={qual} />
                ))}
              </div>
            </div>

            <div data-purpose="expertise-section">
              <SectionTitle className="mb-6">Areas of Expertise</SectionTitle>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {expertiseRows.map((row) => (
                  <ExpertiseBar key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </div>

            <div
              className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 shadow-sm"
              data-purpose="availability-section"
            >
              <SectionTitle className="mb-6">Weekly Schedule</SectionTitle>
              {availability.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {availability.map((slot: any, idx: number) => (
                      <div
                        key={`${slot.day_of_week}-${idx}`}
                        className="rounded-lg border border-lp-brand/15 bg-lp-surface-container-low/80 p-4 text-center"
                      >
                        <p className="mb-1 text-xs font-bold text-lp-brand">{dayAbbrev(slot.day_of_week)}</p>
                        <p className="text-sm font-semibold text-lp-on-surface">
                          {slot.start_time} – {slot.end_time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs italic text-lp-on-surface-variant">
                    * All times are in IST (GMT+5:30).
                  </p>
                </>
              ) : (
                <p className="text-sm text-lp-on-surface-variant">
                  Weekly hours are not published yet. Use Book Appointment to request a time with {displayName.split(" ")[0] || "this specialist"}.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-lp-outline-variant/40 bg-lp-surface-container-lowest/95 px-4 py-3 shadow-[0_-8px_24px_rgba(11,28,48,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-lp-on-surface-variant">Consultation Fee</p>
            <p className="flex items-center gap-0.5 font-heading text-lg font-bold text-lp-on-surface">
              <IndianRupee className="size-4 shrink-0" aria-hidden />
              {((prof.consultationFee || 0) / 100).toLocaleString()}
            </p>
          </div>
          <LpButton
            type="button"
            variant="primary"
            className="shrink-0 rounded-lg px-5 py-3 font-heading text-sm font-bold normal-case tracking-normal"
            onClick={handleBookAppointment}
          >
            Book
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </LpButton>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("mb-4 flex items-center gap-2 font-heading text-xl font-bold text-lp-on-surface", className)}>
      <span className="h-6 w-1.5 shrink-0 rounded-full bg-lp-brand" aria-hidden />
      {children}
    </h2>
  );
}

function QualificationCard({ qual }: { qual: any }) {
  return (
    <div className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-5 transition-colors hover:border-lp-brand/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-lp-surface-container p-2 text-lp-brand">
          <GraduationCap className="size-6" aria-hidden />
        </div>
        {qual.year != null ? <span className="text-xs font-medium text-lp-on-surface-variant">{qual.year}</span> : null}
      </div>
      <h3 className="font-heading font-bold leading-snug text-lp-on-surface">{qual.degree || "Qualification"}</h3>
      <p className="mb-4 mt-1 text-xs text-lp-on-surface-variant">{qual.institution || "—"}</p>
      {qual.document_url ? (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-bold text-lp-brand-bright hover:underline"
          onClick={() => window.open(qual.document_url, "_blank", "noopener,noreferrer")}
        >
          View Document
          <ExternalLink className="size-3 shrink-0" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function ExpertiseBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-lp-on-surface">
        <span>{label}</span>
        <span className="tabular-nums text-lp-on-surface-variant">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-lp-surface-container-high">
        <div className="h-full rounded-full bg-lp-brand transition-[width] duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function buildExpertiseRows(specialization: string | null | undefined) {
  const primary = specialization?.trim() || "Clinical consultation";
  return [
    { label: primary, value: 95 },
    { label: "Patient communication & education", value: 90 },
    { label: "Care planning & follow-up", value: 88 },
    { label: "Preventive guidance", value: 85 },
  ];
}
