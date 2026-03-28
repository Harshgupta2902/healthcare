"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Calendar,
  CreditCard,
  FileText,
  LifeBuoy,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Link from "next/link";

const faqs = [
  {
    category: "Appointments & Booking",
    questions: [
      {
        q: "How do I book a free consultation?",
        a: "You can book a free consultation by clicking the 'Book a free consultation' button on our landing page. This will guide you through a quick process to select your health concerns and choose a specialist.",
      },
      {
        q: "How can I cancel or reschedule my appointment?",
        a: "You can manage your appointments directly from your Dashboard under the 'Upcoming Appointments' section. We request a minimum of 2 hours notice for cancellations.",
      },
      {
        q: "Are the consultations video-based?",
        a: "Yes, all consultations are conducted via our secure integrated video platform. You'll receive a link in your dashboard 10 minutes before your scheduled time.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "Is my medical data secure?",
        a: "Absolutely. We use industry-standard end-to-end encryption for all medical records and consultations. Your data is stored in compliance with healthcare data protection regulations.",
      },
      {
        q: "How do I update my profile information?",
        a: "Navigate to your Dashboard and select 'Profile Settings'. You can update your contact details, insurance information, and medical history from there.",
      },
    ],
  },
  {
    category: "Medical Services",
    questions: [
      {
        q: "What specialties are available?",
        a: "We offer a wide range of specialties including General Medicine, Mental Health, Pediatrics, Women's Health, Dermatology, and Cardiology.",
      },
      {
        q: "Do you provide emergency services?",
        a: "No, we are an outpatient consultation platform. In case of a medical emergency, please call 108 immediately or visit your nearest emergency department.",
      },
    ],
  },
];

const categories = [
  { icon: ShieldCheck, title: "Account & Privacy", description: "Manage security and personal data" },
  { icon: Calendar, title: "Booking Flow", description: "How to schedule and manage visits" },
  { icon: CreditCard, title: "Payments & Refunds", description: "Pricing, billing, and insurance" },
  { icon: FileText, title: "Medical Records", description: "Accessing your history and reports" },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Designer Background: Subtle texture across the whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />


      <main className="relative z-10">
        {/* Support Hero Section */}
        <section className="relative w-full py-24 md:py-32 overflow-hidden">
          {/* Atmospheric Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Help & Support Center</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
            >
              How can we <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                Support You Today?
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto relative group mt-12"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative">
                <Input
                  placeholder="Search for articles, guides, or questions..."
                  className="h-16 pl-6 pr-6 rounded-2xl border-border/50 bg-secondary/20 backdrop-blur-sm text-lg font-medium focus:bg-background transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="py-20 bg-secondary/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-[32px] bg-background border border-border/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{cat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="pt-32 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tight mb-4 italic">Frequently Asked Questions</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 mx-auto rounded-full" />
            </div>

            <div className="space-y-16">
              {faqs.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                    <span className="w-8 h-px bg-primary/20" />
                    {group.category}
                  </h3>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {group.questions.map((faq, faqIdx) => (
                      <AccordionItem
                        key={faqIdx}
                        value={`${groupIdx}-${faqIdx}`}
                        className="border border-border/50 rounded-2xl bg-background px-6 overflow-hidden transition-all data-[state=open]:border-primary/20 data-[state=open]:shadow-lg"
                      >
                        <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary transition-colors">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground font-medium text-base pb-6 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Need Help? */}
        <section className="py-32 container mx-auto px-4 max-w-6xl">
          <div className="relative rounded-[48px] bg-foreground text-background p-12 md:p-20 overflow-hidden group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
                  Still have <br />
                  <span className="text-white italic">questions?</span>
                </h2>
                <p className="text-background/70 text-lg md:text-xl font-medium mb-10 max-w-md">
                  Can't find the answer you're looking for? Please chat to our friendly team.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <button className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:scale-105 transition-transform flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Contact Support
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="h-16 px-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-lg hover:bg-white/20 transition-all flex items-center gap-2 group/btn">
                      Browse Services
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: LifeBuoy, label: "24/7 Support" },
                  { icon: MessageSquare, label: "Live Chat" },
                  { icon: HelpCircle, label: "Help Guides" },
                  { icon: FileText, label: "Tutorials" },
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 hover:bg-white/10 transition-colors">
                    <item.icon className="w-8 h-8 mx-auto text-white" />
                    <div className="text-sm font-black uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
