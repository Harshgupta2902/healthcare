"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const router = useRouter();

  const handleBookConsultation = () => {
    router.push("/book-consultation");
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-20 overflow-hidden">
      {/* Designer Background: Mesh Gradients and Patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent_70%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wide uppercase">Redefining Healthcare Accessibility</span>
          </div>

          <div className="space-y-10 max-w-5xl">
            {/* Headline with visual flair */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-foreground">
                Healthcare that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                  Actually Works
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
                Ditch the waiting room. Access world-class medical experts, personalized treatment plans, and secure care from anywhere in the world.
              </p>
            </div>

            {/* Premium CTAs */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
              <Button
                asChild
                size="lg"
                className="group relative h-16 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] transition-all duration-300 bg-primary hover:bg-primary/90"
              >
                <Link href="/book-consultation" className="flex items-center gap-2">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-16 px-10 text-lg font-semibold rounded-2xl border-2 hover:bg-secondary/50 backdrop-blur-sm transition-all"
              >
                <Link href="/how-it-works">
                  Explore Platform
                </Link>
              </Button>
            </div>

            {/* Trust Markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">10k+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Active Users</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">4.9/5</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">User Rating</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">24/7</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Expert Support</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">HIPAA</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Security Level</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
