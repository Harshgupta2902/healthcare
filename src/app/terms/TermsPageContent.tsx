"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CircleCheck,
  Info,
  Lock,
  Printer,
  Share2,
  Shield,
  Stethoscope,
  Siren,
  User,
} from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import { cn } from "@/lib/utils";
import { TERMS_LAST_UPDATED } from "./constants";

const navSections = [
  { id: "intro", label: "Introduction", shortLabel: "Intro", icon: Info },
  { id: "acceptance", label: "Acceptance of Terms", shortLabel: "Accept", icon: CheckCircle },
  { id: "responsibilities", label: "User Responsibilities", shortLabel: "Users", icon: User },
  { id: "emergency", label: "Emergency Disclaimer", shortLabel: "Alert", icon: AlertTriangle },
  { id: "privacy", label: "Privacy Policy", shortLabel: "Privacy", icon: Shield },
] as const;

type SectionId = (typeof navSections)[number]["id"];

export function TermsPageContent() {
  const [activeId, setActiveId] = useState<SectionId>("intro");
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);

  useEffect(() => {
    const ids = navSections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id as SectionId);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);


  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white font-sans text-lp-on-surface selection:bg-lp-brand/15">
      {/* Page hero — SiteChrome provides global header/footer */}
      <section className="bg-gradient-to-b from-white to-[#f9fbff]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[#e1e8f2] pb-8 md:flex-row md:items-end md:gap-6">
            <div className="max-w-2xl">
              <h1 className="mb-3 font-heading text-4xl font-bold tracking-tight text-[#102b51] sm:text-5xl">
                Terms of Service
              </h1>
              <p className="font-sans text-base leading-relaxed text-[#6f7f94] md:text-lg">
                These terms describe the rules and responsibilities that apply when using the Protealth website,
                patient features, professional tools, and admin services.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
              <div className="md:text-right">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#8390a0]">Last updated</p>
                <p className="font-sans text-base font-semibold text-[#1f385a]">{TERMS_LAST_UPDATED}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 sm:px-8 lg:flex-row lg:items-start lg:gap-12 lg:px-16 lg:pb-24">
        {/* Sticky sidebar — self-start + sticky on aside so it stays put while content scrolls */}
        <aside className="sticky top-24 z-20 hidden max-h-[calc(100dvh-6rem)] w-72 shrink-0 self-start overflow-y-auto lg:block">
          <div className="flex flex-col gap-8 pr-1">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-bold text-[#122e52]">Navigation</h2>
              <p className="text-sm text-[#8390a0]">Quick jump to sections</p>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Terms sections">
              {navSections.map(({ id, label, icon: Icon }) => {
                const isActive = activeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                      isActive
                        ? "bg-[#eef5ff]"
                        : "hover:bg-[#f5f8fd]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-[#2871d4]" : "text-[#8390a0] group-hover:text-[#2871d4]",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isActive ? "font-semibold text-[#2871d4]" : "font-medium text-[#6f7f94] group-hover:text-[#1f385a]",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 max-w-4xl flex-1 flex-col gap-8 pb-28 lg:pb-0">
          {/* Emergency banner */}
          {!emergencyAcknowledged && (
            <section className="relative overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-6 md:p-8">
              <Stethoscope className="pointer-events-none absolute top-0 right-0 p-4 text-red-600 opacity-10" size={96} aria-hidden />
              <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600">
                    <Siren className="size-5" aria-hidden />
                    Not Emergency Care
                  </div>
                  <p className="text-base font-medium leading-relaxed text-[#1f385a]">
                    Protealth is for non-emergency medical information and consultations only. If you are experiencing
                    a medical emergency, call your local emergency services immediately.
                  </p>
                </div>
                <LpButton
                  type="button"
                  onClick={() => setEmergencyAcknowledged(true)}
                  className="h-12 min-w-[160px] shrink-0 rounded-xl bg-[#1769d8] px-6 normal-case tracking-normal text-white hover:bg-[#1556b8]"
                >
                  I Understand
                </LpButton>
              </div>
            </section>
          )}

          {/* 01 Introduction */}
          <section id="intro" className="scroll-mt-24 flex flex-col gap-6">
            <SectionHeading number="01" title="Introduction" />
            <div className="flex flex-col gap-4 rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-sm md:p-8">
              <p className="text-base leading-relaxed text-[#6f7f94]">
                Welcome to Protealth. These terms govern your use of our website, patient features, professional tools,
                and admin services. Our mission is to make quality healthcare accessible and convenient while maintaining
                a high standard of care and data security.
              </p>
              <p className="text-base leading-relaxed text-[#6f7f94]">
                By using this platform, you agree to comply with the rules and guidelines set forth in this document.
                These terms are designed to protect both you, as the user, and Protealth, as the provider.
              </p>
            </div>
          </section>

          {/* 02 Acceptance */}
          <section id="acceptance" className="scroll-mt-24 flex flex-col gap-6">
            <SectionHeading number="02" title="Acceptance of Terms" />
            <div className="flex flex-col gap-4 rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-sm md:p-8">
              <p className="text-base leading-relaxed text-[#6f7f94]">
                Your access to and use of Protealth is conditioned on your acceptance of and compliance with these
                Terms. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <HighlightCard text="Implicit agreement upon account registration and first login." />
                <HighlightCard text="Continuous acceptance through ongoing use of digital tools and services." />
              </div>
              <p className="text-base leading-relaxed text-[#6f7f94]">
                We may update features, policies, content, or these terms as the platform evolves. Continued use after
                updates means you accept the revised terms.
              </p>
            </div>
          </section>

          {/* 03 Responsibilities */}
          <section id="responsibilities" className="scroll-mt-24 flex flex-col gap-6">
            <SectionHeading number="03" title="User Responsibilities" />
            <div className="flex flex-col gap-6 rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-sm md:p-8">
              <p className="text-base leading-relaxed text-[#6f7f94]">
                To maintain the integrity of clinical data and personal health information, users must adhere to
                security protocols. This includes providing accurate personal details and maintaining the confidentiality
                of login credentials.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Provision of truthful medical history and current symptoms when booking or using services.",
                  "Protecting account access and not sharing passwords with others.",
                  "Using the platform lawfully, respectfully, and only for legitimate healthcare access or administrative purposes.",
                  "Understanding that consultation availability, fees, and professional profiles may change.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 rounded-xl border border-[#e1e8f2] bg-[#f9fbff] p-4"
                  >
                    <span className="size-2 shrink-0 rounded-full bg-[#2871d4]" aria-hidden />
                    <span className="font-medium text-[#40597d]">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base leading-relaxed text-[#6f7f94]">
                False, misleading, abusive, or unauthorized use may result in account restriction or removal. Healthcare
                professionals remain responsible for their own clinical judgment and professional obligations.
              </p>
            </div>
          </section>

          {/* 04 Emergency */}
          <section id="emergency" className="scroll-mt-24 flex flex-col gap-6">
            <SectionHeading number="04" title="Emergency Disclaimer" variant="error" />
            <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-6 md:p-8">
              <p className="text-base leading-relaxed text-[#6f7f94]">
                Information on Protealth is for general informational and administrative purposes. It does not replace
                advice, diagnosis, or treatment from a qualified clinician. Verification status does not guarantee a
                particular clinical outcome.
              </p>
              <div className="flex items-start gap-4 rounded-xl border border-red-100 bg-white p-5">
                <AlertTriangle className="size-6 shrink-0 text-red-600" aria-hidden />
                <p className="font-semibold italic text-[#1f385a]">
                  &ldquo;If you think you may have a medical emergency, call your doctor, go to the emergency department,
                  or call local emergency services immediately.&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* 05 Privacy */}
          <section id="privacy" className="scroll-mt-24 flex flex-col gap-6">
            <SectionHeading number="05" title="Privacy Policy" />
            <div className="relative overflow-hidden rounded-2xl border border-[#e1e8f2] bg-white p-6 shadow-sm md:p-8">
              <Lock className="pointer-events-none absolute -bottom-10 -right-10 size-[200px] text-[#2871d4] opacity-5" aria-hidden />
              <div className="relative z-10 flex flex-col gap-4">
                <p className="text-base leading-relaxed text-[#6f7f94]">
                  Your privacy is our priority. We use reasonable administrative, technical, and organizational safeguards
                  designed to protect personal information. We do not sell personal information.
                </p>
                <p className="text-base leading-relaxed text-[#6f7f94]">
                  By using the platform, you acknowledge that you have read and understood our Privacy Policy, which
                  details how we collect, use, and share your personal data.
                </p>
                <Link
                  href="/privacy"
                  className="mt-4 flex w-fit items-center gap-2 font-bold text-[#2871d4] hover:underline"
                >
                  Read Full Privacy Policy
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-2xl border border-[#e1e8f2] bg-white p-2 shadow-2xl lg:hidden"
        aria-label="Terms section navigation"
      >
        {navSections.map(({ id, shortLabel, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                "flex flex-col items-center p-2 transition-colors",
                isActive ? "text-[#2871d4]" : "text-[#8390a0]",
              )}
            >
              <Icon className="size-5" aria-hidden />
              <span className="mt-1 text-[10px] font-bold uppercase">{shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SectionHeading({
  number,
  title,
  variant = "default",
}: {
  number: string;
  title: string;
  variant?: "default" | "error";
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full font-heading text-lg font-bold",
          variant === "error"
            ? "bg-red-100 text-red-600"
            : "bg-[#eef5ff] text-[#2871d4]",
        )}
      >
        {number}
      </span>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-[#122e52] md:text-3xl">{title}</h2>
    </div>
  );
}

function HighlightCard({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e1e8f2] bg-[#f9fbff] p-5">
      <CircleCheck className="mt-1 size-5 shrink-0 text-[#2871d4]" aria-hidden />
      <p className="text-sm font-medium leading-relaxed text-[#40597d]">{text}</p>
    </div>
  );
}
