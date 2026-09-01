"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Star,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { searchProfessionals } from "@/features/professional/actions";
import { toast } from "sonner";
import {
  SPECIALTIES,
  specialtyLabel,
  consultantsHrefForSpecialty,
  specialtyIcon,
} from "@/lib/specialties";

interface Professional {
  id: string;
  name: string;
  displayName?: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  city?: string;
}

function SpecialistsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const specialtyParam = searchParams.get("specialty");
  const cityParam = searchParams.get("city");

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!specialtyParam && !cityParam) return;

    let active = true;
    setLoading(true);
    (async () => {
      try {
        const result = await searchProfessionals(specialtyParam || "", cityParam || "");
        if (!active) return;
        if (!result.success) {
          toast.error(result.error);
          setProfessionals([]);
          return;
        }
        setProfessionals((result.data || []) as Professional[]);
      } catch (error) {
        console.error("Error fetching professionals:", error);
        if (active) toast.error("Could not load specialists. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [specialtyParam, cityParam]);

  const showFiltered = Boolean(specialtyParam || cityParam);

  return (
    <div className="min-h-screen bg-white font-sans text-lp-on-surface">
      <main className="flex flex-col">
        {/* Hero */}
        <section>
          <div className="mx-auto max-w-[1120px] px-4 py-12 md:py-14">
            <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-[#102b51] md:text-5xl">
              {specialtyParam ? `${specialtyLabel(specialtyParam)}s` : "Medical"}{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Specialists
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[#6f7f94] md:text-lg">
              {specialtyParam
                ? `Find trusted ${specialtyLabel(specialtyParam)}s${cityParam ? ` near ${cityParam}` : ""} for your health needs.`
                : "Explore our comprehensive network of medical specialists across various fields."}
            </p>
          </div>
        </section>

        {/* Results */}
        {showFiltered && (
          <section className="mx-auto w-full max-w-[1120px] px-4 pt-10">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-56 animate-pulse rounded-2xl border border-[#e1e8f2] bg-[#f9fbff]" />
                ))}
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {professionals.map((prof) => (
                  <Link
                    key={prof.id}
                    href={`/consultants/${prof.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-[#e1e8f2] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[#eef5ff]">
                        {prof.profilePhotoUrl ? (
                          <Image
                            src={prof.profilePhotoUrl}
                            alt={prof.displayName ?? prof.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="size-7 text-[#2871d4]/50" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="flex items-center gap-1 truncate font-heading text-base font-semibold text-[#1f385a]">
                          <span className="truncate">{prof.displayName ?? prof.name}</span>
                          {prof.isVerified && <ShieldCheck className="size-4 shrink-0 text-[#2871d4]" aria-hidden />}
                        </h3>
                        <p className="mt-0.5 truncate text-sm font-medium text-[#2871d4]">{prof.specialization}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                          <span className="text-xs font-semibold text-[#1f385a]">4.9</span>
                          <span className="text-xs text-[#8390a0]">· {prof.yearsOfExperience ?? 0} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#e1e8f2] pt-3">
                      <div>
                        <span className="flex items-center gap-0.5 font-heading text-lg font-bold text-[#1f385a]">
                          <IndianRupee className="size-4 shrink-0" aria-hidden />
                          {((prof.consultationFee || 0) / 100).toLocaleString()}
                        </span>
                        <span className="text-xs text-[#8390a0]">{prof.city || "Online"}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1769d8] px-4 py-2 text-xs font-semibold text-white transition-transform group-hover:scale-[1.03]">
                        Book
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e1e8f2] bg-[#f9fbff] py-16 text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2871d4]/50">
                  <User className="size-8" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold text-[#122e52]">
                  No specialists found{specialtyParam ? ` for ${specialtyLabel(specialtyParam)}` : ""}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm text-[#718198]">
                  Browse the specialties below to find verified experts available for consultation.
                </p>
                <Link
                  href="/specialists"
                  className="rounded-lg border border-[#e1e8f2] bg-white px-6 py-2.5 text-sm font-semibold text-[#2871d4] transition-colors hover:bg-[#f5f8fd]"
                >
                  View all specialties
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Browse by specialty */}
        <section className="mx-auto w-full max-w-[1120px] px-4 py-12 md:py-16">

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SPECIALTIES.map((specialty) => {
              const Icon = specialtyIcon(specialty);
              return (
                <Link
                  key={specialty}
                  href={consultantsHrefForSpecialty(specialty)}
                  className="group flex items-center gap-3 rounded-2xl border border-[#e1e8f2] bg-white p-4 transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[#2871d4] transition-colors group-hover:bg-[#2871d4]">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1f385a]">
                    {specialty}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[#b9c6d8] transition-colors group-hover:text-[#2871d4]" aria-hidden />
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto w-full max-w-[1120px] px-4 pb-16">
          <div className="cta-box relative overflow-hidden rounded-2xl px-8 py-12 text-center text-white md:px-12 md:py-14">
            <style jsx>{`
              .cta-box {
                background: linear-gradient(105deg, #123b7d, #2873dc);
              }
              .cta-box::after {
                content: "";
                position: absolute;
                width: 300px;
                height: 300px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 50%;
                right: -140px;
                top: -150px;
              }
            `}</style>

            <div className="relative z-10">
              <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">Need help finding a specialist?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-sm text-white/90 md:text-base">
                Our dedicated care team is available to help you find the right medical expert for your concerns.
              </p>
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#2265b8] transition-colors hover:bg-gray-50"
              >
                Connect with Us
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function SpecialistsPage() {
  return (
    <Suspense>
      <SpecialistsContent />
    </Suspense>
  );
}
