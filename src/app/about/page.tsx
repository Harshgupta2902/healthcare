import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Users } from "lucide-react";
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
    <div className="min-h-screen bg-white font-sans text-lp-on-surface selection:bg-lp-brand/15">
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-[#f9fbff]">
          <div className="mx-auto max-w-[1120px] px-4 py-14 text-center md:py-20">
            <h1 className="mx-auto mb-4 max-w-3xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[#102b51] md:text-5xl">
              Clinical access,{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                designed around people
              </span>
            </h1>
            <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-[#6f7f94] md:text-lg">
              HealthHere connects patients with trusted healthcare professionals through a secure, simple, and
              supportive digital care experience.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-[1120px] px-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-[#e1e8f2] bg-white p-6 transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl text-[#2871d4] transition-colors group-hover:bg-[#2871d4]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h2 className="mb-2 font-heading text-base font-bold text-[#1f385a]">{title}</h2>
                  <p className="text-sm leading-relaxed text-[#718198]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-[1120px] px-4">
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#e1e8f2] bg-white shadow-sm lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h2 className="mb-4 font-heading text-2xl font-bold tracking-tight text-[#122e52] md:text-3xl">
                  Our mission
                </h2>
                <p className="mb-8 font-sans text-base leading-relaxed text-[#6f7f94]">
                  We are building a healthcare platform where patients can discover specialists, understand their
                  options, and request care with confidence. HealthHere is not a substitute for emergency services or
                  in-person medical judgment, but it helps make routine access, communication, and coordination easier.
                </p>
                <Link
                  href="/book-consultation"
                  className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1769d8] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1769d8]/20 transition-colors hover:bg-[#1556b8]"
                >
                  Start a consultation
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="relative min-h-[320px] lg:min-h-full">
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
