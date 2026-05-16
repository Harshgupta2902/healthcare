"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  IndianRupee,
  ArrowRight,
  Star,
  ShieldCheck,
  Briefcase,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LpButton, lpButtonVariants } from "@/components/ui/lp-button";
import { LpTextField } from "@/components/ui/lp-text-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConsultantsContentProps {
  initialProfessionals: any[];
}

const specialties = [
  "all",
  "Cardiologist",
  "Dermatologist",
  "General Practitioner",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Orthopedic",
  "Gynecologist",
  "Ophthalmologist",
];

function specialtyLabel(s: string) {
  if (s === "all") return "All Specialists";
  return s.replace("Specialist", "");
}

/** Same visual height as `LpTextField` search (py-3 + line + border). */
const DIRECTORY_FIELD_CLASS =
  "min-h-12 !h-auto border border-lp-outline-variant py-3 text-base leading-6 md:text-sm";

const SORT_OPTIONS = [
  { value: "price-desc", label: "Price · High to low" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "experience-desc", label: "Experience · High to low" },
  { value: "experience-asc", label: "Experience · Low to high" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export default function ConsultantsContent({ initialProfessionals }: ConsultantsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortOption, setSortOption] = useState<SortOption>("price-desc");

  const currentSearch = searchParams.get("q") || "";
  const currentSpecialty = searchParams.get("specialty") || "all";
  const currentCity = searchParams.get("city") || "all";

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "all") params.delete(key);
      else params.set(key, val);
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredProfessionals = useMemo(() => {
    return initialProfessionals.filter((p) => {
      const matchesCity = currentCity === "all" || p.city === currentCity;
      return matchesCity;
    });
  }, [initialProfessionals, currentCity]);

  const sortedProfessionals = useMemo(() => {
    const list = [...filteredProfessionals];
    const feeRupee = (p: (typeof list)[0]) => (p.consultationFee || 0) / 100;
    const years = (p: (typeof list)[0]) => p.yearsOfExperience ?? 0;
    const sortKey = sortOption.startsWith("price") ? "price" : "experience";
    const sortDir = sortOption.endsWith("desc") ? "desc" : "asc";
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "price") return (feeRupee(a) - feeRupee(b)) * dir;
      return (years(a) - years(b)) * dir;
    });
    return list;
  }, [filteredProfessionals, sortOption]);

  const cities = useMemo(() => {
    const set = new Set(initialProfessionals.map((p) => p.city).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [initialProfessionals]);

  return (
    <div className="min-h-0 bg-lp-surface pb-16 font-sans text-lp-on-surface selection:bg-lp-brand/20">
      <div className="mx-auto max-w-7xl px-5 md:px-16">
        <section className="mb-8 pt-2">
          <h1 className="mb-4 mt-8 font-heading text-4xl font-bold leading-tight tracking-tight text-lp-cta-bg md:text-5xl md:leading-[56px]">
            Find Your Specialist
          </h1>
          <p className="max-w-2xl font-sans text-lg leading-7 text-lp-on-surface-variant">
            Connect with top-tier healthcare professionals through our verified directory. Clinical excellence meets
            personal care.
          </p>
        </section>

        <div className="sticky top-20 z-40 -mx-5 bg-lp-surface px-5 py-4 md:-mx-16 md:px-16">
          <div className="mx-auto flex max-w-7xl w-full flex-col gap-4 md:flex-row md:items-stretch">
            <div className="flex w-full min-w-0 items-stretch md:w-auto md:min-w-[180px]">
              <Select value={currentCity} onValueChange={(val) => updateQuery({ city: val })}>
                <SelectTrigger
                  className={cn(
                    "w-full rounded-2xl bg-lp-surface-container-lowest px-4 shadow-none",
                    DIRECTORY_FIELD_CLASS,
                    "font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface",
                    "focus:ring-2 focus:ring-lp-brand/20 focus:ring-offset-0 focus-visible:border-lp-brand",
                    "data-[placeholder]:text-lp-on-surface-variant [&>svg]:text-lp-on-surface-variant",
                    "data-[size=default]:!min-h-12 data-[size=default]:!h-auto",
                  )}
                >
                  <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
                    <MapPin className="size-5 shrink-0 text-lp-brand" aria-hidden />
                    <SelectValue placeholder="Everywhere" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-lp-outline-variant/30 shadow-xl">
                  {cities.map((c) => (
                    <SelectItem
                      key={c || "all"}
                      value={c || "all"}
                      className="cursor-pointer py-3 font-sans text-sm capitalize"
                    >
                      {c === "all" ? "Everywhere" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 flex-1 [&_.space-y-2]:space-y-0">
              <LpTextField
                key={currentSearch}
                id="consultant-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Search consultants by name..."
                defaultValue={currentSearch}
                onChange={(e) => updateQuery({ q: e.target.value || null })}
                startIcon={<Search className="size-5" aria-hidden />}
                surface="white"
                rounding="2xl"
                inputClassName={cn(
                  DIRECTORY_FIELD_CLASS,
                  "placeholder:font-normal placeholder:text-lp-on-surface-variant/80",
                )}
              />
            </div>
          </div>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4 pt-2">
          {specialties.map((s) => (
            <LpButton
              key={s}
              type="button"
              variant={currentSpecialty === s ? "pillOn" : "pillOff"}
              className="shrink-0 gap-2 normal-case"
              onClick={() => updateQuery({ specialty: s })}
            >
              {s === "all" ? <Briefcase className="size-4 shrink-0" aria-hidden /> : <Stethoscope className="size-4 shrink-0" aria-hidden />}
              {specialtyLabel(s)}
            </LpButton>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-baseline ">
          <p className="font-heading text-sm font-bold text-lp-on-surface md:text-2xl">
            <span className="tabular-nums text-sm">{sortedProfessionals.length.toLocaleString()}</span>{" "}
            <span className="font-sans text-sm font-bold text-lp-on-surface-variant">Experts Found</span>
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-sans text-sm text-lp-on-surface-variant">Sort by:</span>
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger
                className={cn(
                  "inline-flex h-auto min-h-0 w-auto max-w-full border-0 bg-transparent px-0 py-0 shadow-none",
                  "gap-1.5 font-sans text-sm font-medium text-lp-on-surface",
                  "rounded-none hover:bg-transparent hover:text-lp-brand cursor-pointer",
                  "focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                  "data-[state=open]:text-lp-brand",
                  "data-[size=default]:h-auto data-[size=default]:min-h-0 data-[size=default]:px-0 data-[size=default]:py-0",
                  "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-lp-on-surface-variant [&>svg]:opacity-70",
                )}
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <SelectValue placeholder="Sort order" />
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-lp-outline-variant/40 bg-lp-surface-container-lowest shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer py-2.5 font-sans text-sm normal-case focus:bg-lp-surface-container"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedProfessionals.map((prof, idx) => (
              <ConsultantCard key={prof.id} prof={prof} index={idx} />
            ))}
          </div>
        </AnimatePresence>

        {sortedProfessionals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-lp-outline-variant/40 bg-lp-surface-container-lowest py-24 text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-lp-surface-container">
              <Search className="size-10 text-lp-outline-variant" aria-hidden />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-lp-cta-bg">No expert found</h2>
            <p className="mb-6 font-sans text-sm text-lp-on-surface-variant">
              Try another search, location, or specialty.
            </p>
            <LpButton
              type="button"
              variant="ghost"
              className="font-semibold uppercase tracking-widest text-lp-brand"
              onClick={() => {
                updateQuery({ q: null, specialty: "all", city: "all" });
              }}
            >
              Reset search
            </LpButton>
          </motion.div>
        )}

        <div className="mt-12 flex items-center justify-center gap-4">
          <LpButton type="button" variant="paginationIcon" disabled aria-label="Previous page">
            <ChevronLeft className="size-5" />
          </LpButton>
          <span className="px-4 font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
            Page 1 of 1
          </span>
          <LpButton type="button" variant="paginationIcon" disabled aria-label="Next page">
            <ChevronRight className="size-5" />
          </LpButton>
        </div>
      </div>
    </div>
  );
}

function ConsultantCard({ prof, index }: { prof: any; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="h-full"
    >
      <Link href={`/consultants/${prof.id}`} className="group block h-full">
        <div className="flex h-full flex-col rounded-3xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-lp-surface-container">
            {prof.profilePhotoUrl ? (
              <Image
                src={prof.profilePhotoUrl}
                alt={prof.displayName ?? prof.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lp-surface-container-high to-lp-surface-container">
                <span className="font-heading text-3xl font-bold text-lp-brand/50">{prof.name?.slice(0, 2).toUpperCase()}</span>
              </div>
            )}

            {prof.isVerified && (
              <div className="absolute left-4 top-4 flex gap-2">
                <div className="flex items-center gap-1 rounded-full bg-lp-surface/90 px-3 py-1 shadow-sm backdrop-blur-md">
                  <ShieldCheck className="size-3.5 shrink-0 text-lp-brand" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lp-brand">Verified</span>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)]">
              <span className="inline-block rounded-lg bg-lp-brand/90 px-3 py-1 font-sans text-xs font-semibold text-lp-on-brand backdrop-blur-md">
                {prof.specialization}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col px-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-heading text-xl font-semibold leading-tight text-lp-on-surface md:text-2xl">
                {prof.displayName ?? prof.name}
              </h3>
            </div>

            <div className="mb-4 flex items-center gap-2 text-lp-on-surface-variant">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span className="font-sans text-sm">{prof.city || "Online consultation"}</span>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-lp-surface-container-low p-4">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-lp-on-surface-variant">Experience</p>
                <p className="font-heading text-xl font-semibold text-lp-on-surface">
                  {prof.yearsOfExperience ?? 0}+ <span className="text-xs font-normal">Yrs</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-lp-on-surface-variant">
                  Consultation Fee
                </p>
                <p className="flex items-center gap-0.5 font-heading text-xl font-semibold text-lp-on-surface">
                  <IndianRupee className="size-4 shrink-0" aria-hidden />
                  {((prof.consultationFee || 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-lp-outline-variant/30 pt-5">
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
                <span className="font-sans text-xs font-semibold text-emerald-700">Accepting consultations</span>
              </div>
              <div className={cn(lpButtonVariants({ variant: "directoryFab", size: "default" }))} aria-hidden>
                <ArrowRight className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
