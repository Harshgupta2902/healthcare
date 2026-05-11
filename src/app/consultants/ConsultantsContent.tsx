"use client";

import { useState, useMemo } from "react";
import {
    Search,
    MapPin,
    IndianRupee,
    ArrowRight,
    Star,
    Award,
    ShieldCheck,
    Filter,
    ChevronRight,
    SlidersHorizontal,
    Briefcase,
    Building2,
    X,
    Stethoscope
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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
    "Ophthalmologist"
];

export default function ConsultantsContent({ initialProfessionals }: ConsultantsContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filters State
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [expRange, setExpRange] = useState([0, 40]);
    const [showFilters, setShowFilters] = useState(false);

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
        return initialProfessionals.filter(p => {
            const fee = (p.consultationFee || 0) / 100;
            const exp = p.yearsOfExperience || 0;
            const matchesPrice = fee >= priceRange[0] && fee <= priceRange[1];
            const matchesExp = exp >= expRange[0] && exp <= expRange[1];
            const matchesCity = currentCity === "all" || p.city === currentCity;

            return matchesPrice && matchesExp && matchesCity;
        });
    }, [initialProfessionals, priceRange, expRange, currentCity]);

    const cities = useMemo(() => {
        const set = new Set(initialProfessionals.map(p => p.city).filter(Boolean));
        return ["all", ...Array.from(set)];
    }, [initialProfessionals]);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* In-flow spacer: visible gap under header at rest; scrolls away so sticky bar meets header flush */}
            <div className="h-2 shrink-0 sm:h-3" aria-hidden />
            <div className="sticky top-16 z-30 w-full bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-0 sm:divide-x sm:divide-slate-100">

                    {/* Search Field */}
                    <div className="flex-1 px-1 sm:px-6 relative group min-w-0">
                        <Search className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search..."
                            className="w-full pl-9 sm:pl-8 border-none bg-slate-50 sm:bg-transparent rounded-2xl sm:rounded-none h-10 sm:h-12 focus-visible:ring-0 text-sm sm:text-base text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-bold"
                            defaultValue={currentSearch}
                            onChange={(e) => updateQuery({ q: e.target.value })}
                        />
                    </div>
                    {/* City Switcher */}
                    <div className="px-1 sm:px-4 sm:first:pl-0 flex items-center gap-2 sm:gap-3 min-w-0 w-[40%] sm:w-auto sm:min-w-[180px]">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <Select value={currentCity} onValueChange={(val) => updateQuery({ city: val })}>
                            <SelectTrigger className="border-none bg-transparent h-auto p-0 font-black text-slate-900 focus:ring-0 w-full min-w-0 shadow-none gap-1 sm:gap-2 text-sm sm:text-base">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                {cities.map(c => (
                                    <SelectItem key={c} value={c || "all"} className="font-bold py-3 capitalize">
                                        {c === "all" ? "Everywhere" : c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                    {/* Quick Stats / Controls */}
                    <div className="hidden lg:flex items-center gap-8 px-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Found</p>
                            <p className="text-sm font-black text-slate-900">{filteredProfessionals.length} Expert{filteredProfessionals.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className={cn(
                                "flex items-center gap-2 h-10 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                showFilters ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-900"
                            )}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Advanced Filters
                        </Button>
                    </div>
                </div>

                {/* Second Bar: Specialty Horizontal Tabs */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center border-t border-slate-50 overflow-hidden">
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 w-full">
                        {specialties.map((s) => (
                            <button
                                key={s}
                                onClick={() => updateQuery({ specialty: s })}
                                className={cn(
                                    "px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2",
                                    currentSpecialty === s
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"
                                )}
                            >
                                {s === "all" ? <Briefcase className="h-3.5 w-3.5 shrink-0" /> : <Stethoscope className="h-3.5 w-3.5 shrink-0" />}
                                {s.replace("Specialist", "")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Filters Expandable */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50 border-t border-slate-200 overflow-hidden"
                        >
                            <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Consultation Fee</h4>
                                        <span className="text-indigo-600 font-black text-lg">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                                    </div>
                                    <Slider
                                        defaultValue={[0, 5000]}
                                        max={10000}
                                        step={100}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="py-4"
                                    />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Adjust your budget to find standard or premium specialists.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Experience Level</h4>
                                        <span className="text-indigo-600 font-black text-lg">{expRange[0]} - {expRange[1]} Years</span>
                                    </div>
                                    <Slider
                                        defaultValue={[0, 40]}
                                        max={50}
                                        step={1}
                                        value={expRange}
                                        onValueChange={setExpRange}
                                        className="py-4"
                                    />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Filter by clinical maturity, from rising stars to veteran experts.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProfessionals.map((prof, idx) => (
                            <ConsultantCard
                                key={prof.id}
                                prof={prof}
                                index={idx}
                            />
                        ))}
                    </div>
                </AnimatePresence>

                {filteredProfessionals.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-40 bg-white rounded-3xl border-2 border-dashed border-slate-100"
                    >
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">No expert found</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Try thinning your filters or searching another specialization</p>
                        <Button
                            variant="link"
                            className="mt-6 font-black text-indigo-600 uppercase tracking-widest text-[10px]"
                            onClick={() => {
                                setPriceRange([0, 5000]);
                                setExpRange([0, 40]);
                                updateQuery({ q: null, specialty: 'all', city: 'all' });
                            }}
                        >
                            Reset all filters
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function ConsultantCard({ prof, index }: { prof: any, index: number }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="h-full"
        >
            <Link href={`/consultants/${prof.id}`} className="block h-full group">
                <Card className={cn(
                    "relative overflow-hidden border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/70 group flex",
                    "rounded-3xl flex-row items-stretch gap-3 p-3 h-auto md:flex-col md:gap-0 md:p-0"
                )}>
                    {/* Visual Section */}
                    <div className="relative min-h-36 w-[36%] max-w-[8rem] shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:aspect-[4/3] md:min-h-0 md:w-full md:max-w-none md:rounded-none">
                        {prof.profilePhotoUrl ? (
                            <Image
                                src={prof.profilePhotoUrl}
                                alt={prof.displayName ?? prof.name}
                                fill
                                sizes="(max-width: 767px) 38vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-400 text-3xl font-black">{prof.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                        )}

                        {prof.isVerified && (
                            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-emerald-600 shadow-md ring-1 ring-emerald-100 backdrop-blur-sm md:left-4 md:top-4 md:h-9 md:w-9">
                                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/25 to-transparent md:h-20" aria-hidden />
                    </div>

                    {/* Content Section */}
                    <CardContent className="flex min-w-0 flex-1 flex-col p-0 md:p-5 lg:p-6">
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:gap-4">
                            <div>
                                <div className="mb-1.5 flex items-center gap-1.5 text-slate-400 md:mb-2">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-[9px] font-black uppercase tracking-wide md:text-[10px] md:tracking-widest">Certified Choice</span>
                                </div>
                                <h3 className="line-clamp-2 text-lg font-black leading-tight text-slate-950 transition-colors group-hover:text-primary md:text-xl lg:text-2xl">
                                    {prof.displayName ?? prof.name}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="max-w-full truncate rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100 md:text-[10px]">
                                        {prof.specialization}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100 md:p-3">
                                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400 md:text-[9px]">Experience</p>
                                    <div className="flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5 text-indigo-500" />
                                        <span className="text-[11px] font-black text-slate-800 md:text-xs">{prof.yearsOfExperience}+ Yrs</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100 md:p-3">
                                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400 md:text-[9px]">Fee</p>
                                    <div className="flex items-center gap-1.5">
                                        <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="truncate text-[11px] font-black text-slate-800 md:text-xs">₹{((prof.consultationFee || 0) / 100).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-500">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                <span className="truncate text-[10px] font-black uppercase tracking-wide text-slate-500 md:tracking-widest">{prof.city || "Online Consultation"}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-2 md:pt-4">
                            <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5 text-indigo-700 transition-all group-hover:border-indigo-200 group-hover:bg-indigo-100/80">
                                <span className="text-[10px] font-black uppercase tracking-wide md:text-xs md:tracking-widest">View Profile</span>
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition-transform group-hover:translate-x-0.5">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
