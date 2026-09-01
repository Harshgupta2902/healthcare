"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { openAuthModal } from "@/features/auth/open-auth-modal";
import {
  Video,
  MessageSquare,
  MapPin,
  Clock,
  Shield,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: Clock, label: "24/7 Availability", desc: "Access care anytime, anywhere." },
  { icon: Shield, label: "Secure & Private", desc: "HIPAA-compliant platform." },
  { icon: Calendar, label: "Flexible Scheduling", desc: "Book appointments that fit your life." },
];

const methods = [
  {
    id: "video",
    icon: Video,
    title: "Video Consultations",
    desc: "Connect face-to-face with licensed healthcare professionals through secure, high-quality video calls from the comfort of your home. Perfect for routine check-ups, follow-ups, and mental health sessions.",
    steps: [
      "Choose a convenient time slot",
      "Join the secure video call",
      "Discuss your health concerns",
      "Receive digital prescriptions",
    ],
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Text / Chat Support",
    desc: "Get expert medical advice through secure text messaging when you need quick answers or prefer written communication. Ideal for follow-ups and prescription refills.",
    steps: [
      "Send your health question",
      "Provider responds within hours",
      "Continue the conversation",
      "Access complete chat history",
    ],
    img: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80",
  },
  {
    id: "in-person",
    icon: MapPin,
    title: "In-Person Visits",
    desc: "Schedule traditional face-to-face visits at one of our partner clinics when physical examinations are necessary. Essential for comprehensive screenings and diagnostic procedures.",
    steps: [
      "Search for nearby partner clinics",
      "Select your preferred provider",
      "Complete pre-visit forms online",
      "Visit for a comprehensive exam",
    ],
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  },
];

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-lp-on-surface">
      <main className="flex flex-col">
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-[#f9fbff]">
          <div className="container mx-auto max-w-[1120px] px-4 py-14 text-center md:py-20">

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight text-[#102b51] md:text-5xl"
            >
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
               How Protealth Works
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto max-w-2xl text-base leading-relaxed text-[#6f7f94] md:text-lg"
            >
              We&apos;ve designed multiple ways to connect with healthcare professionals, so you get
              the care you need, when and how you need it.
            </motion.p>

            {/* Benefits */}
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="group rounded-2xl border border-[#e1e8f2] bg-white p-6 text-center transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
                  >
                    <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl text-[#2871d4]">
                      <Icon className="size-5" strokeWidth={1.7} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-[#1f385a]">{benefit.label}</h3>
                    <p className="text-sm text-[#718198]">{benefit.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Consultation methods */}
        <section className="container mx-auto max-w-[1120px] px-4 py-12 md:py-16">
          <div className="space-y-12 md:space-y-16">
            {methods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`flex flex-col gap-8 lg:items-center lg:gap-14 ${
                    idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Text */}
                  <div className="lg:w-1/2">
                    {/* <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2871d4]">
                      <Icon className="size-6" strokeWidth={1.7} />
                    </div> */}
                    <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#122e52] md:text-3xl">
                      {method.title}
                    </h2>
                    <p className="mb-6 max-w-xl text-base leading-relaxed text-[#6f7f94]">
                      {method.desc}
                    </p>

                    <div>
                      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#2871d4]">
                        The Process
                      </h4>
                      <ol className="relative space-y-5 pl-2">
                        {method.steps.map((step, i) => (
                          <li key={i} className="relative flex items-start gap-4">
                            {/* connector line */}
                            {i < method.steps.length - 1 && (
                              <span
                                className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-[#d7e4f5]"
                                aria-hidden
                              />
                            )}
                            <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1769d8] text-xs font-bold text-white shadow-sm shadow-[#1769d8]/30">
                              {i + 1}
                            </div>
                            <span className="pt-1.5 text-sm font-medium text-[#40597d]">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Link
                      href="/book-consultation"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1769d8] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1769d8]/20 transition-colors hover:bg-[#1556b8]"
                    >
                      Get Started Now
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  {/* Visual */}
                  <div className="lg:w-1/2">
                    <div className="overflow-hidden rounded-2xl border border-[#e1e8f2] bg-[#edf4ff] shadow-sm">
                      <img
                        src={method.img}
                        alt={method.title}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-[1120px] px-4 pb-16">
          <div className="cta-box relative overflow-hidden rounded-2xl px-8 py-12 text-center text-white md:px-12 md:py-16">
            <style jsx>{`
              .cta-box {
                background: linear-gradient(105deg, #123b7d, #2873dc);
              }
              .cta-box::after {
                content: "";
                position: absolute;
                width: 300px;
                height: 300px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 50%;
                right: -140px;
                top: -150px;
              }
            `}</style>

            <div className="relative z-10">
              <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                Experience the future of care today
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-sm text-white/90 md:text-base">
                We&apos;re not just another healthcare app. We&apos;re your dedicated health partner,
                available whenever and wherever you need us.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openAuthModal({ view: "signup" })}
                  className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#2265b8] transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/consultants")}
                  className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
                >
                  Meet the Experts
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
