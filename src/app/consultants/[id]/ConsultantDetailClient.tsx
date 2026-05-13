"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { buildBookConsultationHref } from "@/lib/consultant-booking-ref";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatFee(fee?: number | null) {
  return `₹${((fee || 0) / 100).toLocaleString()}`;
}

export default function ConsultantDetailClient({ prof }: { prof: any }) {
  const router = useRouter();
  const bookConsultationPath = buildBookConsultationHref(prof.id);
  const displayName = prof.displayName ?? prof.name ?? "Consultant";
  const location = prof.city || "Online Consultation";
  const qualifications = Array.isArray(prof.qualifications) ? prof.qualifications : [];
  const availability = Array.isArray(prof.availability) ? prof.availability : [];

  const handleBookAppointment = () => {
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push(`/login?redirect=${encodeURIComponent(bookConsultationPath)}`);
        return;
      }

      router.push(bookConsultationPath);
    })();
  };

  const aboutText =
    prof.bio?.trim() ||
    `${displayName} is a trusted ${prof.specialization || "healthcare professional"} available through HealthHere for secure, patient-focused consultation support.`;

  return (
    <div className="min-h-screen bg-white pb-20 pt-10 text-[#083b3a] sm:pt-14">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 lg:hidden">
          <div className="flex gap-4">
            <div className="relative h-36 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
              {prof.profilePhotoUrl ? (
                <Image
                  src={prof.profilePhotoUrl}
                  alt={displayName}
                  fill
                  priority
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700">
                  <span className="text-3xl font-black text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              {prof.isVerified ? (
                <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-teal-600 shadow-md">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 py-1">
              <h1 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-[#073b3a]">
                {displayName}
              </h1>
              <div className="mt-3 space-y-2">
                <MobileMeta icon={Stethoscope} label="Skill" value={prof.specialization || "Healthcare Professional"} />
                <MobileMeta icon={MapPin} label="Address" value={location} />
                <MobileMeta icon={Award} label="Experience" value={`${prof.yearsOfExperience || 0}+ Years`} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-sm">
              {prof.profilePhotoUrl ? (
                <Image
                  src={prof.profilePhotoUrl}
                  alt={displayName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 340px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700">
                  <span className="text-6xl font-black text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              {prof.isVerified ? (
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-teal-600 shadow-lg">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-teal-100 bg-white shadow-xl shadow-teal-100/60">
              <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                <p className="text-lg font-black text-[#073b3a]">Booking Details</p>
                <p className="mt-1 text-sm text-slate-500">Secure consultation request</p>
              </div>
              <div className="space-y-5 p-6">
                <SidebarInfo icon={IndianRupee} label="Consultation Fee" value={formatFee(prof.consultationFee)} />
                <SidebarInfo icon={Award} label="Experience" value={`${prof.yearsOfExperience || 0}+ Years`} />
                <Button
                  type="button"
                  onClick={handleBookAppointment}
                  className="mt-2 h-12 w-full rounded-2xl bg-primary font-black text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90 cursor-pointer"
                >
                  Book Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-12 md:space-y-16">
            <section className="hidden lg:block">
              <h2 className="text-4xl font-black tracking-tight text-[#073b3a] sm:text-5xl lg:text-6xl">
                {displayName}
              </h2>
              <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-500">
                {prof.specialization || "Healthcare Professional"} • {location}
              </p>
            </section>

            <section>
              <h2 className="text-4xl font-black tracking-tight text-[#073b3a] sm:text-5xl">About me</h2>
              <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-500 sm:text-base">{aboutText}</p>

              <div className="my-8 h-px bg-slate-200" />

              <div className="grid gap-6 md:grid-cols-2">
                <FeatureBlock
                  title="Patient-Centered Care Approach"
                  description="Focused on clear communication, comfort, and practical next steps for every consultation."
                />
                <FeatureBlock
                  title="Modern Digital Consultation"
                  description="Secure online booking flow with care coordination built for convenient healthcare access."
                />
              </div>
            </section>

            <section>
              <h2 className="text-4xl font-black tracking-tight text-[#073b3a] sm:text-5xl">Education & qualifications</h2>
              <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-500 sm:text-base">
                Professional credentials and qualification details available for public review on HealthHere.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {qualifications.length > 0 ? (
                  qualifications.map((qual: any, idx: number) => (
                    <QualificationCard key={`${qual.degree}-${idx}`} qual={qual} />
                  ))
                ) : (
                  <>
                    <QualificationCard qual={{ degree: prof.specialization || "Clinical Practice", institution: "Verified professional profile" }} />
                    <QualificationCard qual={{ degree: "Patient Consultation", institution: "HealthHere care access network" }} />
                  </>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-4xl font-black tracking-tight text-[#073b3a] sm:text-5xl">Areas of expertise</h2>
              <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-500 sm:text-base">
                A practical overview of the care strengths this profile is positioned around.
              </p>

              <div className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
                <ExpertiseBar label={prof.specialization || "Clinical Consultation"} value={95} />
                <ExpertiseBar label="Patient Care & Communication" value={90} />
                <ExpertiseBar label="Preventive Guidance" value={85} />
                <ExpertiseBar label="Care Planning" value={80} />
              </div>
            </section>

            <section className="rounded-[2rem] bg-cyan-50 p-4 sm:p-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-[#073b3a] sm:text-4xl">
                  Book appointment with {displayName}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                  Continue to the secure booking flow to confirm your details, request a slot, and connect with the care team.
                </p>
                {availability.length > 0 ? (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                    {availability.slice(0, 4).map((slot: any, idx: number) => (
                      <div key={`${slot.day_of_week}-${idx}`} className="rounded-2xl bg-white p-4 text-sm shadow-sm">
                        <p className="font-black text-[#073b3a]">{dayNames[slot.day_of_week] || "Available"}</p>
                        <p className="mt-1 text-slate-500">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-teal-100 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,118,110,0.12)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Fee</p>
            <p className="text-lg font-black text-[#073b3a]">{formatFee(prof.consultationFee)}</p>
          </div>
          <Button
            type="button"
            onClick={handleBookAppointment}
            className="h-12 shrink-0 rounded-2xl bg-primary px-5 font-black text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary/90"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="truncate text-xs font-black text-[#073b3a]" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SidebarInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-base font-black text-[#073b3a]" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

function FeatureBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 fill-cyan-500 text-white" />
        <h3 className="text-base font-black text-[#073b3a]">{title}</h3>
      </div>
      <p className="text-sm leading-7 text-slate-500">{description}</p>
      <div className="border-t border-slate-200 pt-4">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Trusted healthcare access through HealthHere.
        </p>
      </div>
    </div>
  );
}

function QualificationCard({ qual }: { qual: any }) {
  return (
    <div className="rounded-[1.75rem] bg-cyan-50 p-6 sm:p-8">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white">
        <GraduationCap className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black text-[#073b3a]">{qual.degree || "Qualification"}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        {qual.institution || "This qualification reflects verified professional training and healthcare experience."}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {qual.year ? (
          <Badge className="rounded-full bg-white px-3 py-1 font-black text-[#073b3a] hover:bg-white">
            {qual.year}
          </Badge>
        ) : null}
        {qual.document_url && qual.document_approved === true ? (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-black text-cyan-700"
            onClick={() => window.open(qual.document_url, "_blank")}
          >
            <FileText className="mr-1.5 h-4 w-4" />
            View document
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ExpertiseBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-cyan-50">
        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
