"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Database,
  Headset,
  ListChecks,
  LockKeyhole,
  Mail,
  MessageCircle,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  { id: "info-collect", label: "Information we collect", shortLabel: "Collect", icon: Database },
  { id: "how-use", label: "How we use information", shortLabel: "Use", icon: Workflow },
  { id: "sharing", label: "Sharing and disclosure", shortLabel: "Share", icon: Share2 },
  { id: "security", label: "Security", shortLabel: "Security", icon: Shield },
  { id: "choices", label: "Your choices", shortLabel: "Choices", icon: ListChecks },
  { id: "emergencies", label: "Children and emergencies", shortLabel: "Alert", icon: AlertTriangle },
  { id: "contact", label: "Contact us", shortLabel: "Contact", icon: Mail },
] as const;

type SectionId = (typeof navSections)[number]["id"];

const principles = [
  {
    icon: LockKeyhole,
    title: "Secure handling",
    description:
      "Industry-leading encryption and security protocols protect every byte of your medical data.",
  },
  {
    icon: ShieldCheck,
    title: "No sale of data",
    description: "Your personal information is never sold to third-party marketers or advertisers. Period.",
  },
  {
    icon: Headset,
    title: "Contact support",
    description: "Our dedicated privacy team is available to answer any questions about your data rights.",
  },
] as const;

export function PrivacyPageContent() {
  const [activeId, setActiveId] = useState<SectionId>("info-collect");

  useEffect(() => {
    const elements = navSections
      .map(({ id }) => document.getElementById(id))
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
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15">
      {/* Hero — SiteChrome provides global header/footer */}
      <section className="my-16 px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-end justify-between gap-4 border-b border-lp-outline-variant/30 pb-8 md:flex-row md:gap-6">
            <div className="max-w-2xl">
              <span className="mb-2 block font-sans text-sm font-semibold uppercase tracking-widest text-lp-brand">
                Security &amp; Privacy
              </span>
              <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-lp-on-surface sm:text-5xl md:text-[48px] md:leading-[56px]">
                Privacy Policy
              </h1>
              <p className="font-sans text-lg leading-relaxed text-lp-on-surface-variant">
                Your privacy matters. This policy explains how Protealth handles information when you use our
                website, services, forms, dashboards, and communications.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-sans text-sm font-semibold uppercase tracking-wide text-lp-outline">Last updated</p>
              <p className="font-sans text-base font-semibold text-lp-on-surface">{"May 11, 2026"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key principles */}
      <section className="mb-16 px-5 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-lp-secondary-fixed">
                <Icon className="size-6 text-lp-brand" aria-hidden />
              </div>
              <h2 className="mb-2 font-heading text-2xl font-semibold text-lp-on-surface">{title}</h2>
              <p className="text-sm leading-relaxed text-lp-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial content */}
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-24 sm:px-8 lg:flex-row lg:items-start lg:gap-12 lg:px-16">
        <aside className="sticky top-24 z-20 hidden max-h-[calc(100dvh-6rem)] w-72 shrink-0 self-start overflow-y-auto lg:block">
          <div className="flex flex-col gap-8 pr-1">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-bold text-lp-on-surface">Navigation</h2>
              <p className="text-sm text-lp-on-surface-variant">Quick jump to sections</p>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Privacy policy sections">
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
                        ? "border-l-4 border-l-lp-brand bg-lp-surface-container"
                        : "hover:bg-lp-surface-container",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-lp-brand" : "text-lp-on-surface-variant group-hover:text-lp-brand",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isActive
                          ? "font-semibold text-lp-on-surface"
                          : "font-medium text-lp-on-surface-variant group-hover:text-lp-on-surface",
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

        <article className="min-w-0 flex-1 space-y-16 pb-28 lg:pb-0">
            <section id="info-collect" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">
                1. Information we collect
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-lp-on-surface-variant">
                <p>
                  We may collect account details, contact information, appointment requests, profile information,
                  uploaded documents, communication preferences, and technical information such as device, browser,
                  and usage data.
                </p>
                <p>
                  Healthcare-related information is collected only when you choose to provide it for consultation,
                  support, verification, or care coordination purposes. This includes medical history or documentation
                  relevant to your specific health queries.
                </p>
                <blockquote className="mt-4 rounded-lg border-l-4 border-lp-brand bg-lp-surface-container-low p-4">
                  <p className="italic text-lp-on-surface">
                    &ldquo;We prioritize the minimization of data collection, only requesting what is essential for
                    clinical excellence.&rdquo;
                  </p>
                </blockquote>
              </div>
            </section>

            <section id="how-use" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">
                2. How we use information
              </h2>
              <p className="mb-4 text-base leading-relaxed text-lp-on-surface-variant">
                We use information to operate the platform, connect patients and professionals, manage appointments,
                verify professional profiles, respond to support requests, send service notifications, improve security,
                and maintain legal or operational records where required.
              </p>
              <p className="mb-4 text-base leading-relaxed text-lp-on-surface-variant">
                <strong className="font-semibold text-lp-on-surface">Analytics.</strong> We use{" "}
                <strong className="font-semibold text-lp-on-surface">Vercel Analytics</strong> (performance and traffic on
                our hosting platform) to understand how the website is used. This service may collect technical
                data such as device type, browser, approximate location, pages visited, and crash logs. We configure them
                not to receive medical records, form field contents, or other protected health information. You may limit
                some collection through browser settings or ad blockers; core care features do not depend on analytics.
              </p>
              <p className="text-base leading-relaxed text-lp-on-surface-variant">
                Our data processing is governed by strict internal protocols to ensure that your information is only
                accessible to authorized personnel during the fulfillment of their specific duties.
              </p>
            </section>

            <section id="sharing" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">
                3. Sharing and disclosure
              </h2>
              <p className="mb-4 text-base leading-relaxed text-lp-on-surface-variant">
                We do not sell personal information. We may share relevant information with healthcare professionals
                involved in your request, service providers who help run the platform, and authorities or regulators
                when required by law or necessary to protect users and the platform.
              </p>
            </section>

            <section id="security" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">4. Security</h2>
              <p className="text-base leading-relaxed text-lp-on-surface-variant">
                We use reasonable administrative, technical, and organizational safeguards designed to protect personal
                information. Our systems utilize end-to-end encryption for data in transit and at rest.
              </p>
              <p className="mt-4 text-base leading-relaxed text-lp-on-surface-variant">
                No online system is completely risk-free, so users should also protect account credentials and avoid
                sharing sensitive information through unsecured channels such as public social media or non-encrypted
                messaging apps.
              </p>
            </section>

            <section id="choices" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">5. Your choices</h2>
              <p className="text-base leading-relaxed text-lp-on-surface-variant">
                You may request updates to your account information, unsubscribe from marketing communications, or
                contact us about privacy questions. Some records may be retained when required for security, legal,
                audit, or healthcare operations, ensuring compliance with medical record retention regulations.
              </p>
            </section>

            <section id="emergencies" className="scroll-mt-28">
              <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-8 md:flex-row md:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-600">
                  <ShieldAlert className="size-6 text-white" aria-hidden />
                </div>
                <div>
                  <h2 className="mb-2 font-heading text-2xl font-semibold text-red-900">
                    6. Children and emergencies
                  </h2>
                  <p className="mb-4 text-base font-semibold leading-relaxed text-red-900">
                    Protealth is not intended to replace emergency medical care. If you are experiencing a medical
                    emergency, contact local emergency services immediately.
                  </p>
                  <p className="text-sm leading-relaxed text-red-800/80">
                    Use by minors should occur with appropriate parent or guardian involvement. We do not knowingly
                    collect data from children without verifiable parental consent.
                  </p>
                </div>
              </div>
            </section>

            <section id="contact" className="scroll-mt-28">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">7. Contact us</h2>
              <div className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-high p-8">
                <p className="mb-4 text-base text-lp-on-surface">
                  For privacy questions or requests, you can reach our data protection officer directly:
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                  <a
                    href="mailto:care@protealth.com"
                    className="flex items-center gap-3 text-sm font-semibold text-lp-brand hover:underline"
                  >
                    <Mail className="size-5 shrink-0" aria-hidden />
                    care@protealth.com
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 text-sm font-semibold text-lp-brand hover:underline"
                  >
                    <MessageCircle className="size-5 shrink-0" aria-hidden />
                    Visit contact page
                  </Link>
                </div>
              </div>
            </section>
        </article>
      </main>

      {/* Mobile section nav */}
      <nav
        className="glass-card fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-2xl border border-lp-outline-variant/40 p-2 shadow-2xl lg:hidden"
        aria-label="Privacy policy sections"
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
                isActive ? "text-lp-brand" : "text-lp-on-surface-variant",
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
