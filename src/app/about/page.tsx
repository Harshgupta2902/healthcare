import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Info, ShieldCheck, Users } from "lucide-react";
import { LpButton } from "@/components/ui/lp-button";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { ABOUT_MISSION_IMAGE } from "./constants";

export const metadata: Metadata = buildPageMetadata({
  title: "About HealthHere",
  description:
    "HealthHere connects patients with trusted healthcare professionals through a secure, simple, and supportive digital care experience—clinical access, designed around people.",
  pathname: "/about",
  keywords: ["about HealthHere", "clinical access", "patient-centered care", "trusted professionals"],
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
    icon: Heart,
  },
  {
    title: "Accessible Support",
    description:
      "From specialist discovery to appointment support, our goal is to make quality care easier to reach wherever you are.",
    icon: Users,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-lp-surface font-sans text-lp-on-surface selection:bg-lp-brand/15">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(0,89,187,0.05)_0%,rgba(248,249,255,0)_70%)] py-16 md:py-32">
          <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-16">
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-lp-outline-variant/30 bg-lp-surface-container-high px-4 py-1.5">
              <Info className="size-[18px] text-lp-brand" aria-hidden />
              <span className="font-sans text-sm font-semibold uppercase tracking-wider text-lp-on-surface-variant">
                About HealthHere
              </span>
            </div>
            <h1 className="mx-auto mb-6 max-w-4xl font-heading text-4xl font-bold tracking-tight text-lp-on-surface sm:text-5xl md:text-[48px] md:leading-[56px]">
              Clinical access, designed around people.
            </h1>
            <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-lp-on-surface-variant">
              HealthHere connects patients with trusted healthcare professionals through a secure, simple, and
              supportive digital care experience.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-8 transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-lp-surface-container-high">
                    <Icon className="size-6 text-lp-brand" aria-hidden />
                  </div>
                  <h2 className="mb-4 font-heading text-2xl font-semibold text-lp-on-surface">{title}</h2>
                  <p className="text-base leading-6 text-lp-on-surface-variant">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission bento */}
        <section className="bg-lp-surface-container-low/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
            <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-lp-outline-variant/20 bg-lp-surface-container-lowest shadow-sm lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-16">
                <h2 className="mb-8 font-heading text-3xl font-semibold tracking-tight text-lp-on-surface md:text-[32px] md:leading-10">
                  Our mission
                </h2>
                <p className="mb-10 font-sans text-lg leading-relaxed text-lp-on-surface-variant">
                  We are building a healthcare platform where patients can discover specialists, understand their
                  options, and request care with confidence. HealthHere is not a substitute for emergency services or
                  in-person medical judgment, but it helps make routine access, communication, and coordination easier.
                </p>
                <LpButton
                  className="inline-flex h-auto w-fit rounded-xl bg-lp-cta-bg px-8 py-4 normal-case tracking-normal text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/book-consultation">
                    Start a consultation
                    <ArrowRight className="size-5" aria-hidden />
                  </Link>
                </LpButton>
              </div>
              <div className="relative min-h-[400px]">
                <Image
                  src={ABOUT_MISSION_IMAGE}
                  alt="Healthcare professional in a modern clinical setting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
