"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, Clock, Search, Filter, User, Award } from "lucide-react";
import Link from "next/link";

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

export default function SpecialistsPage() {
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
        <div className="mb-8">
          <Link href={specialtyParam ? "/book-consultation" : "/"}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {specialtyParam ? "Back to Booking" : "Back to Home"}
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {specialtyParam ? `${specialtyParam}s` : "Medical Specialists"}
            {cityParam && <span className="text-primary"> in {cityParam}</span>}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {specialtyParam 
              ? `Find trusted ${specialtyParam}s${cityParam ? ` near ${cityParam}` : ""} for your health needs.`
              : "Explore our comprehensive network of medical specialists across various fields."}
          </p>
        </div>

        <Card className="mb-8 bg-card/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by specialty..."
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {showFiltered && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Available Professionals
              {professionals.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({professionals.length} found)
                </span>
              )}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-muted rounded-lg mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <Card 
                    key={professional.id}
                    className="bg-card hover:shadow-lg transition-all duration-200 border-border/50 h-full flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {professional.profilePhotoUrl ? (
                            <img 
                              src={professional.profilePhotoUrl} 
                              alt={professional.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            {professional.name}
                            {professional.isVerified && (
                              <Award className="h-4 w-4 text-green-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-primary font-medium">
                            {professional.specialization}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between">
                      {professional.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {professional.bio}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {professional.yearsOfExperience || 0} years exp.
                          </span>
                          <span className="font-semibold text-primary">
                            ₹{professional.consultationFee || 0}
                          </span>
                        </div>
                        
                        <Button className="w-full" size="sm">
                          Book Consultation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No Professionals Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We couldn't find any {searchSpecialty || "specialists"} 
                    {searchCity && ` in ${searchCity}`}. Try adjusting your search or browse all specialties below.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchCity("");
                    setSearchSpecialty("");
                    setHasSearched(false);
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {showFiltered ? "All Medical Specialties" : "Medical Specialties"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialists.map((specialist) => (
              <Card 
                key={specialist.id}
                className="bg-card hover:bg-secondary/50 transition-colors border-border/50 h-full flex flex-col"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {specialist.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {specialist.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Common Conditions:
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {specialist.dealsWith}
                    </p>
                  </div>
                  
                  <Link href={`/book-consultation`}>
                    <Button className="w-full" size="sm">
                      Book Consultation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center bg-secondary/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our care team can help connect you with the right specialist for your specific needs.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Contact Care Team
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
