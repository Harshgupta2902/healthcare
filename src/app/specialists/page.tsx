"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, Clock, Search, Filter, User, Award, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
}

const specialists: Specialist[] = [
  {
    id: 1,
    name: "General Physician",
    description: "Provides primary healthcare, diagnosing and treating a wide range of common illnesses.",
    dealsWith: "Infections, fevers, hypertension, diabetes, and general health checkups."
  },
  {
    id: 2,
    name: "Psychologist",
    description: "Focuses on understanding behavior, emotions, and mental processes through therapy and assessment.",
    dealsWith: "Anxiety, depression, trauma, stress, and emotional regulation."
  },
  {
    id: 3,
    name: "Gynecologist",
    description: "Specializes in women's reproductive health, pregnancy, and hormonal concerns.",
    dealsWith: "Menstrual issues, PCOS, fertility, pregnancy, and menopause."
  },
  {
    id: 4,
    name: "Pediatrician",
    description: "Cares for the physical, emotional, and developmental health of infants and children.",
    dealsWith: "Infections, vaccinations, growth concerns, and behavioral issues in kids."
  },
  {
    id: 5,
    name: "Ophthalmologist",
    description: "Treats eye-related diseases and performs vision correction and eye surgeries.",
    dealsWith: "Cataracts, glaucoma, vision loss, and eye infections."
  },
  {
    id: 6,
    name: "Psychiatrist",
    description: "A medical doctor specializing in mental health using both therapy and medication.",
    dealsWith: "Mood disorders, schizophrenia, addiction, and personality disorders."
  },
  {
    id: 7,
    name: "Orthopedic",
    description: "Specializes in bones, joints, muscles, and the musculoskeletal system.",
    dealsWith: "Fractures, arthritis, back pain, sports injuries, and joint replacements."
  },
  {
    id: 8,
    name: "Dermatologist",
    description: "Treats conditions related to the skin, hair, and nails.",
    dealsWith: "Acne, eczema, psoriasis, and skin infections."
  },
  {
    id: 9,
    name: "Cardiologist",
    description: "Focuses on the heart and circulatory system's health and diseases.",
    dealsWith: "Chest pain, hypertension, arrhythmia, and heart attacks."
  },
  {
    id: 10,
    name: "Neurologist",
    description: "Specializes in disorders of the brain, spinal cord, and nervous system.",
    dealsWith: "Migraines, epilepsy, stroke, Parkinson's, and neuropathy."
  }
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
      const params = new URLSearchParams();
      if (specialty) params.set("specialty", specialty);
      if (city) params.set("city", city);
      
      const response = await fetch(`/api/professional/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
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
      
      <Header />
      
      <main className="relative z-10 flex flex-col">
        {/* Modern Hero Section */}
        <section className="relative w-full py-24 md:py-32 overflow-hidden">
          {/* Atmospheric Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          
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
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-indigo-500/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-4 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input
                      placeholder="Specialty (e.g. Cardiologist)"
                      value={searchSpecialty}
                      onChange={(e) => setSearchSpecialty(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-none bg-secondary/20 focus:bg-background transition-all font-bold"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input
                      placeholder="City (e.g. Mumbai)"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-none bg-secondary/20 focus:bg-background transition-all font-bold"
                    />
                  </div>
                  <Button onClick={handleSearch} className="h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Search Experts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Results Section */}
        {showFiltered && (
          <section className="py-20 relative bg-secondary/10 border-y border-border/50 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  Available Professionals
                  {professionals.length > 0 && (
                    <span className="text-sm font-bold bg-primary text-white px-3 py-1 rounded-full">
                      {professionals.length}
                    </span>
                  )}
                </h2>
              </div>

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
                      className="group bg-background border border-border/50 rounded-[32px] p-8 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
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
        <section className="py-32 relative">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">
              Browse by <span className="text-primary">Specialty</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialists.map((specialist) => (
                <div 
                  key={specialist.id}
                  className="group p-8 rounded-[32px] bg-secondary/20 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                >
                  <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">
                    {specialist.name}
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                    {specialist.description}
                  </p>
                  
                  <div className="space-y-4 pt-8 border-t border-border/50">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Expertise:</div>
                    <p className="text-xs font-bold leading-relaxed line-clamp-2 italic">
                      {specialist.dealsWith}
                    </p>
                  </div>
                  
                  <Link href={`/book-consultation`} className="mt-8 flex items-center justify-between w-full p-4 rounded-2xl bg-background group-hover:bg-primary group-hover:text-white transition-all duration-500 font-black text-sm uppercase tracking-widest">
                    <span>Book Expert</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
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
      
      <Footer />
    </div>
  );
}
