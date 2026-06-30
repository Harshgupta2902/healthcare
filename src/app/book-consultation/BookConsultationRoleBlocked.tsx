"use client";

import Link from "next/link";
import { Stethoscope, UserRound } from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import type { BookingUserRole } from "@/lib/booking/require-client-booking";

type BookConsultationRoleBlockedProps = {
  role: BookingUserRole;
  message: string;
};

export function BookConsultationRoleBlocked({ role, message }: BookConsultationRoleBlockedProps) {
  const dashboardHref = role === "admin" ? "/application/enter" : "/dashboard";
  const dashboardLabel = role === "admin" ? "Go to admin panel" : "Go to your dashboard";

  return (
    <div className="w-full bg-lp-surface px-5 py-16 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <div className="booking-shadow rounded-2xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 sm:p-10">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            {role === "professional" ? (
              <Stethoscope className="size-7" aria-hidden />
            ) : (
              <UserRound className="size-7" aria-hidden />
            )}
          </div>
          <h1 className="mb-3 font-heading text-3xl font-bold text-lp-cta-bg">
            Patient accounts only
          </h1>
          <p className="mb-8 font-sans text-base leading-relaxed text-lp-on-surface-variant">
            {message}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LpButton asChild variant="primary" className="rounded-xl">
              <Link href={dashboardHref}>{dashboardLabel}</Link>
            </LpButton>
            <LpButton asChild variant="outline" className="rounded-xl">
              <Link href="/?auth=register&role=client">Register as a patient</Link>
            </LpButton>
          </div>
        </div>
      </div>
    </div>
  );
}
