"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Baby,
  Brain,
  ChevronRight,
  Eye,
  HeartPulse,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SpecialtyCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  href: string;
};

const specialties: SpecialtyCard[] = [
  {
    icon: HeartPulse,
    title: "General Physician",
    desc: "Primary care for your daily health needs.",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    href: "/consultants?specialty=General%20Practitioner",
  },
  {
    icon: Brain,
    title: "Psychologist",
    desc: "Mental health and emotional wellbeing.",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    href: "/consultants?q=Psychologist",
  },
  {
    icon: Zap,
    title: "Gynecologist",
    desc: "Specialized women's health care.",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    href: "/consultants?specialty=Gynecologist",
  },
  {
    icon: Baby,
    title: "Pediatrician",
    desc: "Dedicated care for your children.",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    href: "/consultants?specialty=Pediatrician",
  },
  {
    icon: Eye,
    title: "Ophthalmologist",
    desc: "Expert eye care and vision health.",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    href: "/consultants?specialty=Ophthalmologist",
  },
  {
    icon: ShieldCheck,
    title: "Psychiatrist",
    desc: "Medical mental health treatment.",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    href: "/consultants?specialty=Psychiatrist",
  },
];

const gridClass =
  "flex flex-row gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-4 snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 lg:snap-none";

const cardClass =
  "group relative max-lg:shrink-0 max-lg:w-[min(85vw,20rem)] max-lg:snap-start p-8 rounded-xl lg:rounded-3xl bg-lp-surface-container-lowest border border-lp-outline-variant/30 transition-all duration-500 shadow-sm hover:border-lp-brand/30 hover:shadow-2xl hover:shadow-lp-brand/5 lg:w-auto lg:min-w-0";

export function SpecialtiesSection() {
  return (
    <section className="w-full bg-lp-surface-container-low py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-lp-cta-bg sm:text-4xl">
            Specialized Care For Every Need
          </h2>
          <p className="mt-2 font-sans text-base text-lp-on-surface-variant">
            Connect with board-certified professionals across all major disciplines.
          </p>
        </motion.div>

        <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className={gridClass}>
            {specialties.map(({ icon: Icon, title, desc, color, href }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Link href={href} className={cn(cardClass, "block")}>
                  <div
                    className={cn(
                      "mb-6 flex size-14 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                      color,
                    )}
                  >
                    <Icon className="size-6" aria-hidden />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-heading text-xl font-bold text-lp-on-surface transition-colors group-hover:text-lp-brand">
                      {title}
                    </h3>
                    <p className="font-sans text-sm font-medium leading-relaxed text-lp-on-surface-variant">
                      {desc}
                    </p>
                  </div>

                  <div className="absolute bottom-8 right-8 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <ArrowRight className="size-5 text-lp-brand" aria-hidden />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="mt-10 flex justify-center lg:mt-12"
          >
            <Link
              href="/specialists"
              className="group inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-lp-brand transition-all hover:opacity-80"
            >
              View All Specialists
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
