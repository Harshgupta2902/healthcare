import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | HealthHere",
  description:
    "Read how HealthHere collects, uses, protects, and manages personal and healthcare-related information.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We may collect account details, contact information, appointment requests, profile information, uploaded documents, communication preferences, and technical information such as device, browser, and usage data. Healthcare-related information is collected only when you choose to provide it for consultation, support, verification, or care coordination purposes.",
  },
  {
    title: "How we use information",
    body: "We use information to operate the platform, connect patients and professionals, manage appointments, verify professional profiles, respond to support requests, send service notifications, improve security, and maintain legal or operational records where required.",
  },
  {
    title: "Sharing and disclosure",
    body: "We do not sell personal information. We may share relevant information with healthcare professionals involved in your request, service providers who help run the platform, and authorities or regulators when required by law or necessary to protect users and the platform.",
  },
  {
    title: "Security",
    body: "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No online system is completely risk-free, so users should also protect account credentials and avoid sharing sensitive information through unsecured channels.",
  },
  {
    title: "Your choices",
    body: "You may request updates to your account information, unsubscribe from marketing communications, or contact us about privacy questions. Some records may be retained when required for security, legal, audit, or healthcare operations.",
  },
  {
    title: "Children and emergencies",
    body: "HealthHere is not intended to replace emergency medical care. If you are experiencing a medical emergency, contact local emergency services immediately. Use by minors should occur with appropriate parent or guardian involvement.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <main className="relative z-10">
        <section className="py-20 sm:py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Privacy Policy
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Your privacy matters.
              </h1>
              <p className="mt-6 text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                This policy explains how HealthHere handles information when you use our website, services, forms, dashboards, and communications.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: May 11, 2026</p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: LockKeyhole, label: "Secure handling" },
                { icon: ShieldCheck, label: "No sale of data" },
                { icon: Mail, label: "Contact support" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-primary/10 bg-card p-5 shadow-sm">
                    <Icon className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-sm font-bold">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              {sections.map((section) => (
                <article key={section.title} className="rounded-3xl border border-primary/10 bg-card p-6 shadow-sm sm:p-8">
                  <h2 className="text-xl font-black">{section.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-primary/10 bg-secondary/30 p-6 sm:p-8">
              <h2 className="text-xl font-black">Contact us</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                For privacy questions or requests, contact us at{" "}
                <a href="mailto:care@healthhere.com" className="font-semibold text-primary">
                  care@healthhere.com
                </a>
                . You can also use our{" "}
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
