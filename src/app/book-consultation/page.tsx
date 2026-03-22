"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ArrowRight, MapPin, Stethoscope, Brain, Baby, Eye, Heart, Activity, Bone, Pill, Smile, Users, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthConcern {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  specialty: string;
}

const healthConcerns: HealthConcern[] = [
  {
    id: "general",
    name: "General Health",
    description: "Fever, cold, cough, fatigue, or general checkup",
    icon: <Activity className="w-6 h-6" />,
    specialty: "General Physician"
  },
  {
    id: "mental-health",
    name: "Mental Health",
    description: "Anxiety, depression, stress, or emotional concerns",
    icon: <Brain className="w-6 h-6" />,
    specialty: "Psychologist"
  },
  {
    id: "womens-health",
    name: "Women's Health",
    description: "Menstrual issues, pregnancy, hormonal concerns",
    icon: <Heart className="w-6 h-6" />,
    specialty: "Gynecologist"
  },
  {
    id: "child-health",
    name: "Child Health",
    description: "Pediatric care, vaccinations, growth concerns",
    icon: <Baby className="w-6 h-6" />,
    specialty: "Pediatrician"
  },
  {
    id: "eye-problems",
    name: "Eye Problems",
    description: "Vision issues, eye pain, infections",
    icon: <Eye className="w-6 h-6" />,
    specialty: "Ophthalmologist"
  },
  {
    id: "psychiatric",
    name: "Psychiatric Care",
    description: "Severe mental health, medication management",
    icon: <Pill className="w-6 h-6" />,
    specialty: "Psychiatrist"
  },
  {
    id: "bone-joint",
    name: "Bone & Joint Pain",
    description: "Back pain, arthritis, fractures, sports injuries",
    icon: <Bone className="w-6 h-6" />,
    specialty: "Orthopedic"
  },
  {
    id: "skin-issues",
    name: "Skin Issues",
    description: "Rashes, acne, allergies, skin infections",
    icon: <Smile className="w-6 h-6" />,
    specialty: "Dermatologist"
  },
  {
    id: "heart-health",
    name: "Heart Health",
    description: "Chest pain, blood pressure, heart conditions",
    icon: <Stethoscope className="w-6 h-6" />,
    specialty: "Cardiologist"
  },
  {
    id: "family-health",
    name: "Family Medicine",
    description: "Healthcare for the whole family",
    icon: <Users className="w-6 h-6" />,
    specialty: "General Physician"
  }
];

import { searchPlaces } from "./actions";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}


export default function BookConsultationPage() {
  const router = useRouter();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleConcernSelect = (concernId: string) => {
    setSelectedConcern(concernId);
    setStep(2);
  };

  const handleCitySubmit = () => {
    if (!city.trim()) return;

    const concern = healthConcerns.find(c => c.id === selectedConcern);
    if (concern) {
      const params = new URLSearchParams({
        specialty: concern.specialty,
        city: city.trim()
      });
      router.push(`/specialists?${params.toString()}`);
    }
  };

  const handlePlaceSelect = (description: string) => {
    console.log("📍 [CLIENT] Place selected:", description);
    setCity(description);
    setSearchQuery("");
    setPredictions([]);
    setOpen(false);
    console.log("✅ [CLIENT] City set to:", description);
  };

  // Debounced search for place predictions
  useEffect(() => {
    console.log("🔄 [CLIENT] useEffect triggered, searchQuery:", searchQuery);
    
    if (debounceTimerRef.current) {
      console.log("⏱️ [CLIENT] Clearing previous debounce timer");
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      console.log("🚫 [CLIENT] Empty search query, clearing predictions");
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    console.log("⏳ [CLIENT] Setting loading state, starting debounce timer (300ms)");
    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      console.log("🚀 [CLIENT] Debounce timer fired, calling searchPlaces with:", searchQuery);
      try {
        const startTime = Date.now();
        const results = await searchPlaces(searchQuery);
        const duration = Date.now() - startTime;
        console.log("✅ [CLIENT] searchPlaces completed in", duration, "ms");
        console.log("📊 [CLIENT] Results received:", results);
        console.log("📊 [CLIENT] Results count:", results.length);
        setPredictions(results);
        console.log("💾 [CLIENT] Predictions state updated");
      } catch (error) {
        console.error("❌ [CLIENT] Error fetching places:");
        console.error("   - Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("   - Error message:", error instanceof Error ? error.message : String(error));
        console.error("   - Full error:", error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
        console.log("🏁 [CLIENT] Loading state set to false");
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        console.log("🧹 [CLIENT] Cleanup: clearing debounce timer");
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-12 md:pt-16 pb-24">
      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 pt-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Book Your Free Consultation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell us what you're experiencing and we'll connect you with the right specialist
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-muted/40 border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-10 pt-2">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
              What health concern would you like to address?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {healthConcerns.map((concern) => (
                <Card
                  key={concern.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 rounded-2xl ${selectedConcern === concern.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-primary/30'
                    }`}
                  onClick={() => handleConcernSelect(concern.id)}
                >
                  <CardContent className="p-6 md:p-7">
                    <div className="flex items-start gap-5">
                      <div className={`p-3 rounded-xl ${selectedConcern === concern.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                        }`}>
                        {concern.icon}
                      </div>
                      <div className="flex-1 min-h-[110px]">
                        <h3 className="font-semibold text-lg mb-1.5">{concern.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1.5">{concern.description}</p>
                        <p className="text-xs text-primary mt-2 font-medium">
                          → {concern.specialty}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl mx-auto space-y-7 pt-2">
            <Button
              variant="ghost"
              className="mb-1 -ml-2"
              onClick={() => setStep(1)}
            >
              ← Back to health concerns
            </Button>

            <Card className="border-2 rounded-2xl shadow-md">
              <CardHeader className="pt-6 pb-3 px-6">
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  Enter Your City
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-0 px-6">
                <p className="text-muted-foreground">
                  We'll find {healthConcerns.find(c => c.id === selectedConcern)?.specialty}s near you
                </p>

                <div className="space-y-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal h-14 md:h-12 text-base bg-muted/40 border-muted hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                        onClick={() => {
                          setOpen(true);
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 100);
                        }}
                      >
                        <span className={cn("truncate", !city && "text-muted-foreground")}>
                          {city || "Search for your city..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-full max-w-lg p-0 rounded-xl shadow-lg border" 
                      align="start" 
                      sideOffset={4}
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          ref={inputRef}
                          placeholder="Type to search cities..."
                          value={searchQuery}
                          onValueChange={(inputValue) => {
                            console.log("⌨️ [CLIENT] Input changed:", inputValue);
                            setSearchQuery(inputValue);
                            if (inputValue && !open) {
                              console.log("📂 [CLIENT] Opening popover");
                              setOpen(true);
                            }
                          }}
                          className="h-12 md:h-11"
                        />
                        <CommandList>
                          {isLoading ? (
                            <CommandEmpty>Searching...</CommandEmpty>
                          ) : predictions.length > 0 ? (
                            <CommandGroup>
                              {predictions.map((prediction) => (
                                <CommandItem
                                  key={prediction.place_id}
                                  value={prediction.description}
                                  onSelect={() => handlePlaceSelect(prediction.description)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      city === prediction.description ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{prediction.structured_formatting?.main_text || prediction.description}</span>
                                    {prediction.structured_formatting?.secondary_text && (
                                      <span className="text-xs text-muted-foreground">
                                        {prediction.structured_formatting.secondary_text}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : searchQuery.trim() ? (
                            <CommandEmpty>No cities found. Try a different search.</CommandEmpty>
                          ) : (
                            <CommandEmpty>Start typing to search for cities...</CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={handleCitySubmit}
                  disabled={!city.trim()}
                  className="w-full py-6 text-lg mt-4"
                  size="lg"
                >
                  Find Specialists
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {selectedConcern && (
              <div className="text-center p-6 bg-muted/30 border rounded-2xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Selected concern:</p>
                <p className="font-semibold text-primary text-lg">
                  {healthConcerns.find(c => c.id === selectedConcern)?.name}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
