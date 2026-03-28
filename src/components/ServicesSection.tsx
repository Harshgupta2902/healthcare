"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, IdCard, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  color: string;
}

const services: Service[] = [
  {
    id: "consultations",
    title: "Instant Video Consultations",
    description: "Connect with board-certified doctors in minutes. Secure, private, and available 24/7 from any device.",
    icon: <Calendar className="w-8 h-8" />,
    benefits: ["Zero wait time", "HIPAA compliant", "e-Prescriptions"],
    color: "from-blue-600 to-cyan-500"
  },
  {
    id: "specialists",
    title: "Global Specialist Network",
    description: "Access a world-class network of specialists across 40+ disciplines without the months of waiting.",
    icon: <IdCard className="w-8 h-8" />,
    benefits: ["Direct referrals", "Top-tier experts", "Rapid booking"],
    color: "from-indigo-600 to-purple-500"
  },
  {
    id: "records",
    title: "Smart Health Records",
    description: "Your entire medical history, unified. Securely store and share lab results, imaging, and care plans.",
    icon: <ShieldCheck className="w-8 h-8" />,
    benefits: ["Bank-grade security", "One-tap sharing", "Lifetime access"],
    color: "from-emerald-600 to-teal-500"
  },
  {
    id: "plans",
    title: "AI-Powered Care Plans",
    description: "Personalized health strategies that evolve with you. Data-driven insights for optimal outcomes.",
    icon: <Zap className="w-8 h-8" />,
    benefits: ["Smart reminders", "Goal tracking", "Proactive alerts"],
    color: "from-amber-600 to-orange-500"
  }
];

export default function ServicesSection() {
  return (
    <section className="pt-12 relative overflow-hidden bg-secondary/30">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-20">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in zoom-in-95 duration-700"
          >
            <Star className="w-3 h-3 fill-primary" />
            <span>Premium Experience</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            Everything you need for <br />
            <span className="text-primary">Superior Health</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            We've built a comprehensive ecosystem that puts the most advanced medical tools and expertise directly in your hands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0.5, x: index % 2 === 0 ? -10 : 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-10 rounded-[40px] bg-card border border-border hover:border-primary/20 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl"
            >
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`} />

              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-medium">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  {service.benefits.map((benefit) => (
                    <span key={benefit} className="px-4 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-bold border border-border">
                      {benefit}
                    </span>
                  ))}
                </div>

                <Button variant="ghost" className="group/btn p-0 hover:bg-transparent font-bold text-primary flex items-center gap-2">
                  Learn more about this
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 p-8 md:p-12 rounded-[40px] bg-foreground text-background flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-bold text-white">Ready to take control?</h4>
            <p className="text-background/60 font-medium">Join 10,000+ patients who trust us with their wellbeing.</p>
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 rounded-2xl text-lg font-bold">
            <Link href="/book-consultation">
              Book Your Free Call
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
