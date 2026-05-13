import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HeartPulse, ShieldCheck, Sparkles, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About us",
  description:
    "Learn about HealthHere's mission to make trusted healthcare access simpler, safer, and more human-centered.",
  pathname: "/about",
  keywords: ["about HealthHere", "healthcare mission", "trusted care platform"],
});

const values = [
  {
    title: "Clinical Trust",
    description:
      "We prioritize verified professionals, transparent information, and care pathways that help patients make informed decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Human-Centered Care",
    description:
      "Technology should reduce friction, not replace empathy. HealthHere is designed around patient clarity, comfort, and continuity.",
    icon: HeartPulse,
  },
  {
    title: "Accessible Support",
    description:
      "From specialist discovery to appointment support, our goal is to make quality care easier to reach wherever you are.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <main className="relative z-10">
        <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
          <div className="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                About HealthHere
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
                Clinical access, designed around people.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                HealthHere connects patients with trusted healthcare professionals through a secure, simple, and supportive digital care experience.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-3xl border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-black">{value.title}</h2>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-[2rem] border border-primary/10 bg-secondary/30 p-6 sm:p-10">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Our mission</h2>
              <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
                We are building a healthcare platform where patients can discover specialists, understand their options, and request care with confidence. HealthHere is not a substitute for emergency services or in-person medical judgment, but it helps make routine access, communication, and coordination easier.
              </p>
              <Link
                href="/book-consultation"
                className="mt-8 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Start a consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
