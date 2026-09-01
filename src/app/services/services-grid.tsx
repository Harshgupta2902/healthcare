"use client";

import { Calendar, IdCard, ShieldCheck, Zap, Headphones, Truck } from "lucide-react";

const services = [
  {
    icon: Calendar,
    title: "Instant Video Consultations",
    description: "Connect with doctors instantly through secure video calls.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: IdCard,
    title: "Global Specialist Network",
    description: "Access top specialists from around the world.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Smart Health Records",
    description: "Store and manage your health records securely.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "AI-Powered Care Plans",
    description: "Personalized treatment plans you need it.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Get help and support whenever you need it.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Truck,
    title: "Prescription Delivery",
    description: "Medicines delivered to your doorstep.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

export function ServicesGrid() {
  return (
    <section className="services-grid py-8 md:py-10 bg-white">
      <div className="container mx-auto max-w-[1120px] px-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group rounded-2xl border border-[#e1e8f2] bg-white p-6 transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${service.iconBg} ${service.iconColor}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <h3 className="mb-1.5 text-base font-bold text-[#1f385a]">{service.title}</h3>

                <p className="text-sm leading-relaxed text-[#718198]">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
