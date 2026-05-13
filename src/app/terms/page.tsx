import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileText, Sparkles } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms for using HealthHere",
  description:
    "Terms for using HealthHere: rules and responsibilities for the website, patient features, professional tools, and admin services—including emergency care and medical information disclaimers.",
  pathname: "/terms",
  keywords: ["HealthHere terms", "terms of service", "platform rules"],
});

const terms = [
  {
    title: "Use of HealthHere",
    body: "HealthHere provides a digital platform for discovering healthcare professionals, requesting consultations, managing related information, and receiving support. You agree to use the platform lawfully, respectfully, and only for legitimate healthcare access or administrative purposes.",
  },
  {
    title: "Not emergency care",
    body: "HealthHere is not an emergency medical service. If you believe you may have a medical emergency, call local emergency services or visit the nearest hospital immediately. Do not wait for a platform response.",
  },
  {
    title: "Medical information",
    body: "Information on the website is for general informational purposes and does not replace advice, diagnosis, or treatment from a qualified clinician. Healthcare professionals using the platform remain responsible for their own clinical judgment and professional obligations.",
  },
  {
    title: "Accounts and accuracy",
    body: "You are responsible for maintaining account security and for providing accurate, current information. False, misleading, abusive, or unauthorized use may result in account restriction or removal.",
  },
  {
    title: "Appointments and payments",
    body: "Consultation availability, fees, and professional profiles may change. Any appointment, cancellation, refund, or payment terms shown at the time of booking or communicated by HealthHere will apply to that transaction.",
  },
  {
    title: "Professional verification",
    body: "We may review professional information, credentials, and documents for platform eligibility. Verification status does not guarantee a particular clinical outcome or replace independent patient judgment.",
  },
  {
    title: "Platform changes",
    body: "We may update features, policies, content, or these terms as the platform evolves. Continued use after updates means you accept the revised terms.",
  },
  {
    title: "Limitation of liability",
    body: "To the fullest extent permitted by law, HealthHere is not liable for indirect, incidental, or consequential losses arising from platform use, unavailable services, user-provided information, or third-party actions.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <main className="relative z-10">
        <section className="py-20 sm:py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Terms of Service
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Terms for using HealthHere.
              </h1>
              <p className="mt-6 text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                These terms describe the rules and responsibilities that apply when using the HealthHere website, patient features, professional tools, and admin services.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: May 11, 2026</p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  HealthHere does not provide emergency medical services. For urgent or life-threatening concerns, contact emergency services immediately.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {terms.map((term) => (
                <article key={term.title} className="rounded-3xl border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
                  <div className="flex gap-3">
                    <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-xl font-black">{term.title}</h2>
                      <p className="mt-3 leading-relaxed text-muted-foreground">{term.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-primary/10 bg-secondary/30 p-6 sm:p-8">
              <h2 className="text-xl font-black">Questions about these terms?</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Contact us at{" "}
                <a href="mailto:care@healthhere.com" className="font-semibold text-primary">
                  care@healthhere.com
                </a>{" "}
                or visit the{" "}
                <Link href="/contact" className="font-semibold text-primary">
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
