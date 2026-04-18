"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Search,
  User,
  Award,
  Sparkles,
  ChevronRight,
  HeartPulse,
  Brain,
  Zap,
  Baby,
  Eye,
  ShieldCheck,
  Bone,
  Heart,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { searchProfessionals } from "@/features/professional/actions";
import { toast } from "sonner";


interface Professional {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  city?: string;
}

interface Specialist {
  id: number;
  name: string;
  description: string;
  dealsWith: string;
  icon: LucideIcon;
  /** Matches MedicalSpecialties.tsx card icon treatment */
  color: string;
}

const specialists: Specialist[] = [
  {
    id: 1,
    name: "General Physician",
    description: "Provides primary healthcare, diagnosing and treating a wide range of common illnesses.",
    dealsWith: "Infections, fevers, hypertension, diabetes, and general health checkups.",
    icon: HeartPulse,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    id: 2,
    name: "Psychologist",
    description: "Focuses on understanding behavior, emotions, and mental processes through therapy and assessment.",
    dealsWith: "Anxiety, depression, trauma, stress, and emotional regulation.",
    icon: Brain,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    id: 3,
    name: "Gynecologist",
    description: "Specializes in women's reproductive health, pregnancy, and hormonal concerns.",
    dealsWith: "Menstrual issues, PCOS, fertility, pregnancy, and menopause.",
    icon: Zap,
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  {
    id: 4,
    name: "Pediatrician",
    description: "Cares for the physical, emotional, and developmental health of infants and children.",
    dealsWith: "Infections, vaccinations, growth concerns, and behavioral issues in kids.",
    icon: Baby,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: 5,
    name: "Ophthalmologist",
    description: "Treats eye-related diseases and performs vision correction and eye surgeries.",
    dealsWith: "Cataracts, glaucoma, vision loss, and eye infections.",
    icon: Eye,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    id: 6,
    name: "Psychiatrist",
    description: "A medical doctor specializing in mental health using both therapy and medication.",
    dealsWith: "Mood disorders, schizophrenia, addiction, and personality disorders.",
    icon: ShieldCheck,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  {
    id: 7,
    name: "Orthopedic",
    description: "Specializes in bones, joints, muscles, and the musculoskeletal system.",
    dealsWith: "Fractures, arthritis, back pain, sports injuries, and joint replacements.",
    icon: Bone,
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  },
  {
    id: 8,
    name: "Dermatologist",
    description: "Treats conditions related to the skin, hair, and nails.",
    dealsWith: "Acne, eczema, psoriasis, and skin infections.",
    icon: Sparkles,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    id: 9,
    name: "Cardiologist",
    description: "Focuses on the heart and circulatory system's health and diseases.",
    dealsWith: "Chest pain, hypertension, arrhythmia, and heart attacks.",
    icon: Heart,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  {
    id: 10,
    name: "Neurologist",
    description: "Specializes in disorders of the brain, spinal cord, and nervous system.",
    dealsWith: "Migraines, epilepsy, stroke, Parkinson's, and neuropathy.",
    icon: BrainCircuit,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
];

function SpecialistsContent() {
  const searchParams = useSearchParams();
  const specialtyParam = searchParams.get("specialty");
  const cityParam = searchParams.get("city");

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState(cityParam || "");
  const [searchSpecialty, setSearchSpecialty] = useState(specialtyParam || "");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchProfessionals = async (specialty: string, city: string) => {
    setLoading(true);
    try {
      const result = await searchProfessionals(specialty, city);
      if (!result.success) {
        toast.error(result.error);
        setProfessionals([]);
        return;
      }
      setProfessionals(result.data || []);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.error("Could not load specialists. Please try again.");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    if (specialtyParam || cityParam) {
      fetchProfessionals(specialtyParam || "", cityParam || "");
    }
  }, [specialtyParam, cityParam]);

  const handleSearch = () => {
    fetchProfessionals(searchSpecialty, searchCity);
  };

  const showFiltered = specialtyParam || cityParam || hasSearched;

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Designer Background: Subtle texture across the whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />


      <main className="relative z-10 flex flex-col">
        {/* Modern Hero Section */}
        <section className="relative w-full pt-24 md:pt-32 overflow-hidden">
          {/* Atmospheric Glows */}
          <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <Link href={specialtyParam ? "/book-consultation" : "/"} className="inline-flex items-center text-sm font-black uppercase tracking-widest text-primary hover:gap-3 transition-all duration-300 gap-2 mb-8">
                <ArrowLeft className="h-4 w-4" />
                {specialtyParam ? "Back to Booking" : "Back to Home"}
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Experts</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
              >
                {specialtyParam ? `${specialtyParam}s` : "Medical"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                  Specialists
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-medium"
              >
                {specialtyParam
                  ? `Find trusted ${specialtyParam}s${cityParam ? ` near ${cityParam}` : ""} for your health needs.`
                  : "Explore our comprehensive network of medical specialists across various fields."}
              </motion.p>
            </div>

            {/* Premium Search Bar */}
            <div className="relative group mb-12">
              <div className="relative ">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input
                      placeholder="Specialty (e.g. Cardiologist)"
                      value={searchSpecialty}
                      onChange={(e) => setSearchSpecialty(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-primary/20 bg-secondary/20 focus:bg-background transition-all font-bold"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input
                      placeholder="City (e.g. Mumbai)"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-primary/20 bg-secondary/20 focus:bg-background transition-all font-bold"
                    />
                  </div>
                  <Button onClick={handleSearch} className="h-14 px-10 rounded-2xl font-black text-lg hover:shadow-primary/40 transition-all">
                    Search Experts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Results Section */}
        {showFiltered && (
          <section className={`relative ${professionals.length > 0 ? "pb-16" : ""}`}>
            <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[300px] rounded-3xl bg-background/50 animate-pulse border border-border/50" />
                  ))}
                </div>
              ) : professionals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="group  rounded-[32px] p-8 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                      <div className="flex items-start gap-6 mb-8 relative">
                        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-500">
                          {professional.profilePhotoUrl ? (
                            <img
                              src={professional.profilePhotoUrl}
                              alt={professional.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-primary/40" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black flex items-center gap-2">
                            {professional.name}
                            {professional.isVerified && (
                              <Award className="h-5 w-5 text-blue-500" />
                            )}
                          </h3>
                          <div className="text-sm font-black uppercase tracking-widest text-primary">
                            {professional.specialization}
                          </div>
                        </div>
                      </div>

                      {professional.bio && (
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                          {professional.bio}
                        </p>
                      )}

                      <div className="pt-8 border-t border-border/50 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Consultation Fee</div>
                          <div className="text-2xl font-black text-foreground">₹{professional.consultationFee || 0}</div>
                        </div>
                        <Button className="rounded-xl font-black shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-background border border-border/50 rounded-[40px] space-y-6">
                  <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto text-primary/20">
                    <User className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black">No specialists found in this area</h3>
                  <p className="text-muted-foreground font-medium max-w-md mx-auto">
                    Try expanding your search or browse all medical categories below.
                  </p>
                  <Button variant="outline" className="rounded-xl font-bold h-12 px-8" onClick={() => {
                    setSearchCity("");
                    setSearchSpecialty("");
                    setHasSearched(false);
                  }}>
                    Clear Search Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Directory Section */}
        <section className="pb-32 relative">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">
              Browse by Specialty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialists.map((specialist) => {
                const Icon = specialist.icon;
                return (
                  <div
                    key={specialist.id}
                    className="group relative flex h-full flex-col rounded-xl lg:rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <div
                      className={`mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${specialist.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {specialist.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {specialist.description}
                      </p>
                    </div>

                    <div className="mt-auto space-y-3 border-t border-border/50 pt-6">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Expertise:</div>
                      <p className="text-xs font-bold leading-relaxed line-clamp-2 italic text-foreground/90">
                        {specialist.dealsWith}
                      </p>
                    </div>

                    <Link
                      href="/book-consultation"
                      className="mt-6 flex w-full items-center justify-between rounded-2xl bg-secondary/40 p-4 font-black text-sm uppercase tracking-widest transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      <span>Book Expert</span>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-32 w-full bg-background relative overflow-hidden border-t border-border/50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto max-w-4xl px-4 text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Need help <br />
              <span className="text-primary">finding a specialist?</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Our dedicated care team is available 24/7 to help you find the right medical expert for your specific concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
                <Link href="/contact">Talk to Care Team</Link>
              </Button>
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

