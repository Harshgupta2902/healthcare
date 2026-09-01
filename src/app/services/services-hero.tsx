"use client";

import Link from "next/link";
import { Stethoscope, ShieldCheck, Clock3, Users } from "lucide-react";

const trustItems = [
  { icon: Stethoscope, label: "Board-Certified", sub: "Verified professionals" },
  { icon: ShieldCheck, label: "HIPAA Compliant", sub: "Secure platform" },
  { icon: Clock3, label: "24/7 Access", sub: "On-demand care" },
  { icon: Users, label: "10,000+ Patients", sub: "Trusted by many" },
];

export function ServicesHero() {
  return (
    <section className="services-hero py-14 md:py-20 bg-gradient-to-b from-white to-[#f9fbff] overflow-hidden">
      <style jsx>{`
        .services-hero {
          background: radial-gradient(circle at 50% 0%, rgba(62, 125, 226, 0.08), transparent 40%),
                      linear-gradient(180deg, #fff 0%, #f9fbff 100%);
        }
      `}</style>

      <div className="container mx-auto max-w-[1120px] px-4 text-center">
        <h1 className="text-4xl md:text-6xl leading-tight tracking-tight text-[#102b51] mb-5 font-bold">
          Healthcare{" "}
          <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Without Limits
          </span>
        </h1>

        <p className="max-w-[620px] mx-auto text-base leading-relaxed text-[#6f7f94] mb-10">
          Everything you need for a better healthcare experience, all in one place. We&apos;ve simplified
          medical access so you can focus on what matters most: your wellbeing.
        </p>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[900px] mx-auto pt-10 border-t border-[#e1e8f2]">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl border border-[#e1e8f2] bg-white flex items-center justify-center text-[#2871d4] shadow-[0_8px_20px_rgba(31,102,190,0.06)]">
                  <Icon className="w-6 h-6" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#203b60]">{item.label}</div>
                  <div className="text-xs text-[#8390a0]">{item.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
