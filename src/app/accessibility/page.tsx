import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  Eye,
  Keyboard,
  Mail,
  Monitor,
  Volume2,
} from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Accessibility Statement",
  description:
    "Healthcare access should be usable for everyone: HealthHere's accessibility commitments for patients, professionals, and administrators across devices and assistive technologies.",
  pathname: "/accessibility",
  keywords: ["HealthHere accessibility", "inclusive healthcare", "WCAG", "a11y"],
});

const commitments = [
  {
    title: "Readable content",
    description:
      "We aim to use clear headings, readable contrast, responsive layouts, and understandable language across key pages.",
    icon: Eye,
  },
  {
    title: "Keyboard support",
    description:
      "Interactive controls should be reachable with a keyboard and visible focus states should help users understand their current position.",
    icon: Keyboard,
  },
  {
    title: "Assistive technology",
    description:
      "We work to keep semantic HTML, labels, alt text, and ARIA usage aligned with screen reader and assistive technology needs.",
    icon: Volume2,
  },
  {
    title: "Responsive access",
    description:
      "HealthHere is designed to work across mobile, tablet, and desktop screens so healthcare access is not limited by device size.",
    icon: Monitor,
  },
] as const;

const standardsTags = ["WCAG 2.1 AA", "ADA Compliant", "Section 508"] as const;

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15 selection:text-lp-on-surface">
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
        {/* Hero */}
        <section className="mx-auto mb-16 max-w-3xl text-center sm:mb-24">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lp-surface-container-high px-4 py-1.5">
            <Accessibility className="size-[18px] text-lp-brand" aria-hidden />
            <span className="font-sans text-sm font-semibold uppercase tracking-widest text-lp-brand">
              Accessibility
            </span>
          </div>
          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-lp-cta-bg sm:text-5xl md:text-[48px] md:leading-[56px]">
            Healthcare access should be usable for everyone.
          </h1>
          <p className="mb-2 font-sans text-lg leading-relaxed text-lp-on-surface-variant">
            We are committed to improving HealthHere so patients, professionals, and administrators can use the
            platform with confidence across abilities and devices.
          </p>
          <p className="font-sans text-sm font-semibold text-lp-outline">Last updated: May 11, 2026</p>
        </section>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {commitments.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(10,25,47,0.05)] transition-all duration-300 hover:border-lp-brand/30"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-lp-surface-container-low">
                  <Icon className="size-6 text-lp-brand" aria-hidden />
                </div>
                <h2 className="mb-2 font-heading text-2xl font-semibold text-lp-on-surface">{item.title}</h2>
                <p className="font-sans text-base leading-6 text-lp-on-surface-variant">{item.description}</p>
              </article>
            );
          })}

          <article className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-low p-8 shadow-[0px_4px_20px_rgba(10,25,47,0.05)]">
            <h2 className="mb-2 font-heading text-2xl font-semibold text-lp-on-surface">Standards and ongoing work</h2>
            <p className="mb-4 font-sans text-base leading-6 text-lp-on-surface-variant">
              Our goal is to align key user journeys with recognized accessibility practices, including WCAG 2.1 Level
              AA guidance where practical. Accessibility is an ongoing process, and we continue improving navigation,
              forms, contrast, and labels.
            </p>
            <div className="flex flex-wrap gap-2">
              {standardsTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-lp-outline-variant/20 bg-lp-surface-container-lowest px-3 py-1 font-sans text-sm font-semibold text-lp-brand"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-xl border-2 border-lp-brand/10 bg-lp-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(10,25,47,0.05)]">
            <div>
              <h2 className="mb-2 font-heading text-2xl font-semibold text-lp-on-surface">Report a barrier</h2>
              <p className="font-sans text-base leading-6 text-lp-on-surface-variant">
                If you experience difficulty using HealthHere, please contact us with the page URL, your
                device/browser, and a short description of the issue.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <LpButton
                variant="primary"
                className="rounded-lg px-6 py-3 normal-case tracking-normal"
                asChild
              >
                <a href="mailto:care@healthhere.com">
                  <Mail className="size-[18px]" aria-hidden />
                  Email accessibility support
                </a>
              </LpButton>
              <LpButton variant="outlineSoft" className="rounded-lg px-6 py-3 normal-case tracking-normal" asChild>
                <Link href="/contact">Contact form</Link>
              </LpButton>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
