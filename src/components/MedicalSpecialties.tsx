"use client";

import { ChevronRight, HeartPulse, Brain, Zap, Baby, Eye, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const specialties: MedicalSpecialty[] = [
  {
    id: "general-physician",
    name: "General Physician",
    description: "Primary care for your daily health needs.",
    icon: <HeartPulse className="w-6 h-6" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  {
    id: "psychologist",
    name: "Psychologist",
    description: "Mental health and emotional wellbeing.",
    icon: <Brain className="w-6 h-6" />,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  {
    id: "gynecologist",
    name: "Gynecologist",
    description: "Specialized women's health care.",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20"
  },
  {
    id: "pediatrician",
    name: "Pediatrician",
    description: "Dedicated care for your children.",
    icon: <Baby className="w-6 h-6" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  {
    id: "ophthalmologist",
    name: "Ophthalmologist",
    description: "Expert eye care and vision health.",
    icon: <Eye className="w-6 h-6" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  {
    id: "psychiatrist",
    name: "Psychiatrist",
    description: "Medical mental health treatment.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
  }
];

export const MedicalSpecialties = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground whitespace-nowrap md:whitespace-normal">
              Specialized Care{ " "}
              <span className="text-primary">For Every Need</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              We've gathered the finest specialists across multiple disciplines to ensure you receive expert guidance no matter the concern.
            </p>
          </div>
          <Link
            href="/specialists"
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-all"
          >
            View All Specialists
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty, index) => (
            <motion.div
              key={specialty.id}
              initial={{ opacity: 0.5, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${specialty.color} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                {specialty.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {specialty.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {specialty.description}
                </p>
              </div>

              {/* Decorative Arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { ArrowRight } from "lucide-react";
