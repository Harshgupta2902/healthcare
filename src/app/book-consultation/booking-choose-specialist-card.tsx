"use client";

import Image from "next/image";
import { ChevronRight, Stethoscope, Users } from "lucide-react";
import { HOME_DOC_AVATARS } from "@/app/home/constants";

export function BookingChooseSpecialistCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Choose your specialist — browse verified consultants"
      className="group relative w-full overflow-hidden rounded-2xl border-2 border-lp-brand/30 bg-gradient-to-br from-lp-brand/[0.08] via-lp-surface-container-lowest to-lp-brand-bright/[0.12] p-6 text-left shadow-md shadow-lp-brand/5 transition-all duration-300 hover:-translate-y-1 hover:border-lp-brand/50 hover:shadow-xl hover:shadow-lp-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-brand/40 sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-lp-brand-bright/20 blur-3xl transition-transform duration-500 group-hover:scale-110"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-lp-brand/10 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lp-brand-bright px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-lp-on-brand shadow-sm">
            <Users className="size-3 shrink-0" aria-hidden />
            Pick a consultant
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-lp-brand opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
            aria-hidden
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lp-brand-bright text-lp-on-brand shadow-lg shadow-lp-brand-bright/30 transition-transform duration-300 group-hover:scale-105">
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <div className="flex items-center -space-x-2.5">
            {HOME_DOC_AVATARS.slice(0, 3).map((src, i) => (
              <Image
                key={i}
                src={src}
                alt=""
                width={36}
                height={36}
                sizes="36px"
                className="size-9 shrink-0 rounded-full border-2 border-lp-surface-container-lowest object-cover ring-2 ring-lp-brand/10"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="flex size-9 items-center justify-center rounded-full border-2 border-lp-surface-container-lowest bg-lp-brand font-sans text-[10px] font-bold text-lp-on-brand ring-2 ring-lp-brand/10">
              +
            </div>
          </div>
        </div>

        <h3 className="mb-2 font-heading text-2xl font-bold leading-tight text-lp-on-surface">
          Choose Your Specialist
        </h3>
        <p className="mb-5 font-sans text-sm leading-relaxed text-lp-on-surface-variant">
          Browse verified consultants, compare fees and specialties, then select one to personalize this booking.
        </p>

        <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-lp-brand-bright px-4 py-3.5 font-heading text-sm font-semibold text-lp-on-brand shadow-lg shadow-lp-brand-bright/25 transition-all duration-300 group-hover:bg-lp-brand group-hover:shadow-lp-brand/30">
          Browse &amp; select
          <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}
