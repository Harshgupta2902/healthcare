import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Keyboard, MessageCircle, Sparkles, Volume2 } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Healthcare access should be usable for everyone",
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
    icon: MessageCircle,
  },
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <main className="relative z-10">
        <section className="py-20 sm:py-24 md:py-32">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Accessibility
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
                Healthcare access should be usable for everyone.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                We are committed to improving HealthHere so patients, professionals, and administrators can use the platform with confidence across abilities and devices.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: May 11, 2026</p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {commitments.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-3xl border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-black">{item.title}</h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-primary/10 bg-secondary/30 p-6 sm:p-8">
                <h2 className="text-2xl font-black">Standards and ongoing work</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Our goal is to align key user journeys with recognized accessibility practices, including WCAG guidance where practical. Accessibility is an ongoing process, and we continue improving navigation, forms, contrast, labels, and responsive behavior as the platform grows.
                </p>
              </div>

              <div className="rounded-[2rem] border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Report a barrier</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  If you experience difficulty using HealthHere, please contact us with the page URL, your device/browser, and a short description of the issue.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:care@healthhere.com"
                    className="inline-flex justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Email accessibility support
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex justify-center rounded-xl border border-primary/20 px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5"
                  >
                    Contact form
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
