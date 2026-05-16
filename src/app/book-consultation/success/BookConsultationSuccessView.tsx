import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Clock, Info, User } from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import type { GuestAppointmentConfirmation } from "../actions";

export function BookConsultationSuccessView({
  confirmation,
}: {
  confirmation: GuestAppointmentConfirmation;
}) {
  return (
    <div className="w-full bg-lp-surface px-5 py-12 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <div className="glass-card rounded-xl p-8 text-center shadow-sm sm:p-12">
          <div className="booking-success-glow mb-8 inline-flex size-24 items-center justify-center rounded-full bg-lp-surface-container-low">
            <CheckCircle2 className="size-16 text-lp-brand" aria-hidden />
          </div>

          <h1 className="mb-2 font-heading text-3xl font-semibold tracking-tight text-lp-on-surface sm:text-[32px] sm:leading-10">
            Appointment Requested Successfully
          </h1>
          <p className="mx-auto mb-10 max-w-lg font-sans text-lg leading-relaxed text-lp-on-surface-variant">
            We&apos;ve received your request. The clinic will review the schedule and contact you shortly to confirm
            your booking.
          </p>

          <div className="mb-10 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            <DetailCard icon={<User className="size-5 text-lp-brand" aria-hidden />} label="Consultant">
              {confirmation.consultantLabel}
            </DetailCard>
            <DetailCard icon={<Calendar className="size-5 text-lp-brand" aria-hidden />} label="Date">
              {confirmation.dateLabel}
            </DetailCard>
            <DetailCard icon={<Clock className="size-5 text-lp-brand" aria-hidden />} label="Time">
              {confirmation.timeLabel}
            </DetailCard>
          </div>

          <div className="mb-10 flex items-start gap-3 rounded-lg border-l-4 border-lp-brand bg-lp-surface-container p-4 text-left">
            <Info className="mt-0.5 size-5 shrink-0 text-lp-brand" aria-hidden />
            <p className="font-sans text-sm leading-5 text-lp-on-surface-variant">
              <strong className="font-semibold text-lp-on-surface">Note:</strong> You will receive an email and a
              WhatsApp notification once the status of your appointment is updated by the administrative team.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <LpButton variant="primary" className="rounded-xl px-8 py-4 normal-case tracking-normal" asChild>
              <Link href="/dashboard">
                View My Appointments
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </LpButton>
            <LpButton variant="outline" className="rounded-xl px-8 py-4 normal-case tracking-normal" asChild>
              <Link href="/">Return to Home</Link>
            </LpButton>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-xl border border-lp-outline-variant/10 bg-gradient-to-br from-[rgb(10,25,47)] to-[rgb(29,78,216)] shadow-2xl">
          <div className="pointer-events-none absolute top-0 right-0 size-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[100px]" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-0 size-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-[100px]" aria-hidden />
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
            <div className="text-left">
              <h3 className="mb-1 font-heading text-2xl font-semibold text-white">Complete your profile</h3>
              <p className="font-sans text-base text-white/90">
                Save time on your next booking by adding your medical history.
              </p>
            </div>
            <LpButton
              variant="secondary"
              className="whitespace-nowrap rounded-full border-0 bg-white px-6 py-3 text-sm font-semibold text-lp-brand hover:bg-lp-surface-container-high"
              asChild
            >
              <Link href="/dashboard">Add Details</Link>
            </LpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-4">
      <div className="mb-2">{icon}</div>
      <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">{label}</p>
      <p className="font-sans text-base font-semibold text-lp-on-surface">{children}</p>
    </div>
  );
}
