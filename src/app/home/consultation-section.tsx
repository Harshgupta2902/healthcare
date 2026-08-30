"use client";

import Link from "next/link";
import { UserSearch, CalendarCheck, Video, ClipboardCheck } from "lucide-react";

const processSteps = [
  {
    icon: UserSearch,
    title: "Find Your Specialist",
    description: "Browse by specialty and choose the right expert for you.",
  },
  {
    icon: CalendarCheck,
    title: "Book Your Slot",
    description: "Pick a time that works best for your schedule.",
  },
  {
    icon: Video,
    title: "Consult Online",
    description: "Join a secure video consultation with your doctor.",
  },
  {
    icon: ClipboardCheck,
    title: "Follow Up With Care",
    description: "Receive prescriptions, reports and follow-up care.",
  },
];

export function ConsultationSection() {
  return (
    <section className="consultation py-12 md:py-16 bg-[#f5f8fd]" id="how-it-works">
      <div className="container mx-auto max-w-[1120px] px-4">
        <div className="consultation-box bg-[#eef5ff] rounded-2xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[47%_53%] gap-8">
          {/* LEFT - Image */}
          <div className="consultation-image rounded-xl overflow-hidden relative bg-[#dbe8f8] min-h-[320px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85"
              alt="Online doctor consultation"
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="image-overlay absolute left-5 bottom-5 text-white z-10">
              <small className="text-xs block mb-1">▣ Unlimited access</small>
              <h3 className="text-2xl font-bold tracking-tight">Instant Video Consultations</h3>
            </div>
          </div>

          {/* RIGHT - Content */}
          <div className="consultation-content flex flex-col">
            <div className="blue-label text-[#2870d4] text-xs font-semibold mb-3">
              ● &nbsp; Consultation Made Simple
            </div>
            
            <h2 className="text-3xl leading-tight text-[#12345d] tracking-tight mb-4 font-bold">
              Healthcare That<br />Fits Your Life
            </h2>
            
            <p className="text-sm text-[#718198] leading-relaxed mb-6">
              We make it easy to connect with the right doctor and get the care you deserve.
            </p>

            {/* Process Steps */}
            <div className="process flex flex-col gap-4 flex-1">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="process-item flex items-center gap-3">
                    <div className="process-icon w-[30px] h-[30px] border border-[#cbdcf1] rounded-lg flex items-center justify-center text-[#2771d4] bg-white flex-shrink-0">
                      <Icon className="w-[15px] h-[15px]" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1f385a] mb-1">{step.title}</h4>
                      <p className="text-xs text-[#7c8a9e]">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-[#1769d8] text-white rounded-lg px-6 py-3 text-sm font-semibold shadow-lg shadow-[#1769d8]/20 hover:bg-[#1556b8] transition-colors"
              >
                How It Works ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
