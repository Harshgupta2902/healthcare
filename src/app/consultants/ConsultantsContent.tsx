"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Grid,
    List,
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
import { Badge } from "@/components/ui/badge";
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
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
            <div className="sticky top-16 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center divide-x divide-slate-100">

                    {/* City Switcher */}
                    <div className="px-4 first:pl-0 flex items-center gap-3 min-w-[180px]">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <Select value={currentCity} onValueChange={(val) => updateQuery({ city: val })}>
                            <SelectTrigger className="border-none bg-transparent h-auto p-0 font-black text-slate-900 focus:ring-0 w-full shadow-none gap-2">
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

                    {/* Search Field */}
                    <div className="flex-1 px-6 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find consultant name..."
                            className="w-full pl-8 border-none bg-transparent h-12 focus-visible:ring-0 text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-bold"
                            defaultValue={currentSearch}
                            onChange={(e) => updateQuery({ q: e.target.value })}
                        />
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

                    <div className="px-4 last:pr-0 flex items-center gap-1.5 ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-10 w-10 rounded-xl", viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400")}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-10 w-10 rounded-xl", viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Second Bar: Specialty Horizontal Tabs */}
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center border-t border-slate-50 overflow-hidden">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 w-full">
                        {specialties.map((s) => (
                            <button
                                key={s}
                                onClick={() => updateQuery({ specialty: s })}
                                className={cn(
                                    "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2",
                                    currentSpecialty === s
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100"
                                )}
                            >
                                {s === "all" ? <Briefcase className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
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
            <div className="max-w-7xl mx-auto px-6 py-12 pb-40">

                <AnimatePresence mode="popLayout">
                    <div className={cn(
                        "grid gap-6",
                        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredProfessionals.map((prof, idx) => (
                            <ConsultantCard
                                key={prof.id}
                                prof={prof}
                                mode={viewMode}
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

function ConsultantCard({ prof, mode, index }: { prof: any, mode: "grid" | "list", index: number }) {
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
                    "relative border-slate-200 bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 group flex",
                    mode === "grid" ? "flex-col" : "flex-row items-center gap-8 p-4 h-auto"
                )}>
                    {/* Visual Section */}
                    <div className={cn(
                        "relative bg-slate-50 overflow-hidden", 
                        mode === "grid" ? "aspect-square w-full" : "h-40 w-40 rounded-2xl shrink-0"
                    )}>
                        {prof.profilePhotoUrl ? (
                            <Image
                                src={prof.profilePhotoUrl}
                                alt={prof.displayName ?? prof.name}
                                fill
                                sizes={
                                    mode === "grid"
                                        ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        : "160px"
                                }
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-400 text-3xl font-black">{prof.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                        )}

                        {/* Status Overlays */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-slate-200 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                                {prof.specialization}
                            </Badge>
                            {prof.isVerified && (
                                <div className="w-fit bg-emerald-500 text-white p-1 rounded-full shadow-xl flex items-center gap-1 pr-2">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className={cn(
                        "p-6 flex flex-col flex-1 h-full",
                        mode === "list" && "p-0"
                    )}>
                        <div className="space-y-4 flex-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-2 opacity-50">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Certified Choice</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{prof.displayName ?? prof.name}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50/80 p-3 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp.</p>
                                    <div className="flex items-center gap-2">
                                        <Award className="h-3.5 w-3.5 text-indigo-500" />
                                        <span className="text-xs font-black text-slate-700">{prof.yearsOfExperience}+ Yrs</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50/80 p-3 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee</p>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-xs font-black text-slate-700">₹{((prof.consultationFee || 0) / 100).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 mt-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{prof.city || "Online Consultation"}</span>
                            </div>
                        </div>

                        <div className="pt-2 mt-auto">
                            <div className="flex items-center justify-between group/row">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Connect Specialist</span>
                                <div className="h-10 w-10 rounded-full bg-slate-900 group-hover:bg-primary flex items-center justify-center text-white transition-all shadow-xl shadow-slate-100">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
