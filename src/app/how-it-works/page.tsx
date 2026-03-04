"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MessageSquare, MapPin, Clock, Shield, Calendar, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Designer Background: Subtle texture across the whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />


      <main className="relative z-10 flex flex-col">
        {/* Modern Hero Section */}
        <section className="relative w-full py-24 md:py-32 overflow-hidden">
          {/* Atmospheric Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Platform Guide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
            >
              How <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                HealthHere Works
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium mb-16"
            >
              We've designed multiple ways to connect with healthcare professionals,
              ensuring you get the care you need, when and how you need it.
            </motion.p>

            {/* Key Benefits - Modernized */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Clock, label: "24/7 Availability", desc: "Access care anytime, anywhere" },
                { icon: Shield, label: "Secure & Private", desc: "HIPAA-compliant platform" },
                { icon: Calendar, label: "Flexible Scheduling", desc: "Book appointments that fit your life" }
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black mb-2">{benefit.label}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Consultation Sections */}
        {[
          {
            id: "video",
            icon: Video,
            title: "Video Consultations",
            desc: "Connect face-to-face with licensed healthcare professionals through secure, high-quality video calls from the comfort of your home. Perfect for routine check-ups, follow-ups, and mental health sessions.",
            steps: ["Choose a convenient time slot", "Join the secure video call", "Discuss your health concerns", "Receive digital prescriptions"],
            img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            dark: true
          },
          {
            id: "chat",
            icon: MessageSquare,
            title: "Text/Chat Support",
            desc: "Get expert medical advice through secure text messaging when you need quick answers or prefer written communication. Ideal for follow-ups and prescription refills.",
            steps: ["Send your health question", "Provider responds within hours", "Continue the conversation", "Access complete chat history"],
            img: "https://images.unsplash.com/photo-1512428559083-a400a3b84c6e?w=800&q=80",
            dark: false
          },
          {
            id: "in-person",
            icon: MapPin,
            title: "In-Person Visits",
            desc: "Schedule traditional face-to-face visits at one of our partner clinics when physical examinations are necessary. Essential for comprehensive screenings and diagnostic procedures.",
            steps: ["Search for nearby partner clinics", "Select your preferred provider", "Complete pre-visit forms online", "Visit for comprehensive exam"],
            img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            dark: true
          }
        ].map((section, idx) => (
          <section key={section.id} className={`py-32 relative overflow-hidden ${section.dark ? 'bg-secondary/20 border-y border-border/50' : 'bg-background'}`}>
            {section.dark && <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />}

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col lg:items-center gap-16 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                <div className="lg:w-1/2 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <section.icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{section.title}</h2>
                  </div>

                  <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                    {section.desc}
                  </p>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">The Process:</h4>
                    <div className="grid gap-3">
                      {section.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 group/step">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary group-hover/step:bg-primary group-hover/step:text-white transition-colors">
                            {i + 1}
                          </div>
                          <span className="font-medium text-muted-foreground group-hover/step:text-foreground transition-colors">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button size="lg" className="rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group">
                      Get Started Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="relative rounded-[32px] overflow-hidden border border-border/50 shadow-2xl">
                      <img
                        src={section.img}
                        alt={section.title}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Final CTA - Designer Style */}
        <section className="py-32 w-full bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto max-w-4xl px-4 text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Experience the future <br />
              of <span className="text-primary">care today.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              We're not just another healthcare app. We're your dedicated health partner, available whenever and wherever you need us.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" onClick={() => router.push("/register")}>
                Create Free Account
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl border-2 hover:bg-secondary/50 transition-all" onClick={() => router.push("/specialists")}>
                Meet the Experts
              </Button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
