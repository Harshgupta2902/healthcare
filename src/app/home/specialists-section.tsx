"use client";

import Link from "next/link";
import { 
  Stethoscope, 
  Brain, 
  Sparkles, 
  Baby, 
  Heart,
  Bone,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { consultantsHrefForSpecialty, type Specialty } from "@/lib/specialties";

type SpecialistTile = {
  icon: typeof Stethoscope;
  name: string;
  specialty: Specialty | null;
  isArrow?: boolean;
};

const specialists: SpecialistTile[] = [
  { icon: Stethoscope, name: "General\nPhysician", specialty: "General Physician" },
  { icon: Brain, name: "Psychiatrist", specialty: "Psychiatrist" },
  { icon: Sparkles, name: "Dermatologist", specialty: "Dermatologist" },
  { icon: Baby, name: "Pediatrician", specialty: "Pediatrician" },
  { icon: Heart, name: "Gynecologist", specialty: "Gynecologist" },
  { icon: Bone, name: "Orthopedic", specialty: "Orthopedic" },
  { icon: HeartPulse, name: "Cardiologist", specialty: "Cardiologist" },
  { icon: ArrowRight, name: "View All", specialty: null, isArrow: true },
];

export function SpecialistsSection() {
  return (
    <section className="specialists py-12 md:py-16 bg-white" id="specialists">
      <div className="container mx-auto max-w-[1120px] px-4">
        {/* Section Title */}
        <div className="section-title text-left mb-8">
          <h2 className="text-2xl md:text-3xl text-[#122e52] mb-2 tracking-tight font-bold">
            Consult Top Specialists
          </h2>
          <p className="text-sm text-[#77869a]">
            Choose from a wide range of expert doctors across specialties.
          </p>
        </div>

        {/* Specialists Grid */}
        <div className="specialist-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {specialists.map((specialist, index) => {
            const Icon = specialist.icon;
            const href = specialist.specialty
              ? consultantsHrefForSpecialty(specialist.specialty)
              : "/specialists";
            return (
              <Link
                key={index}
                href={href}
                className="specialist text-center cursor-pointer group"
              >
                <div className="specialist-icon w-[58px] h-[58px] border border-[#e1e8f2] rounded-full mx-auto mb-[10px] flex items-center justify-center text-[#2871d4] bg-white transition-all duration-[250ms] group-hover:-translate-y-1 group-hover:border-[#b9d2f2] group-hover:bg-[#f7faff] group-hover:shadow-[0_8px_20px_rgba(31,102,190,0.08)]">
                  <Icon className={specialist.isArrow ? 'w-[21px] h-[21px]' : 'w-[22px] h-[22px]'} strokeWidth={1.6} />
                </div>
                <div className="specialist-name text-xs leading-tight font-semibold text-[#263d5e] whitespace-pre-line">
                  {specialist.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
