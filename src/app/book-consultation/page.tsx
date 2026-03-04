"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Stethoscope, Brain, Baby, Eye, Heart, Activity, Bone, Pill, Smile, Users } from "lucide-react";

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

const popularCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad"
];

export default function BookConsultationPage() {
  const router = useRouter();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [step, setStep] = useState(1);

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

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">

      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Book Your Free Consultation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell us what you're experiencing and we'll connect you with the right specialist
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
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
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
              What health concern would you like to address?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthConcerns.map((concern) => (
                <Card
                  key={concern.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 ${selectedConcern === concern.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-primary/30'
                    }`}
                  onClick={() => handleConcernSelect(concern.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${selectedConcern === concern.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                        }`}>
                        {concern.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{concern.name}</h3>
                        <p className="text-sm text-muted-foreground">{concern.description}</p>
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
          <div className="max-w-lg mx-auto space-y-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setStep(1)}
            >
              ← Back to health concerns
            </Button>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  Enter Your City
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  We'll find {healthConcerns.find(c => c.id === selectedConcern)?.specialty}s near you
                </p>

                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter your city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-lg py-6"
                  />

                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((cityName) => (
                      <Button
                        key={cityName}
                        variant={city === cityName ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCitySelect(cityName)}
                        className="rounded-full"
                      >
                        {cityName}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCitySubmit}
                  disabled={!city.trim()}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  Find Specialists
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {selectedConcern && (
              <div className="text-center p-4 bg-primary/5 rounded-xl">
                <p className="text-sm text-muted-foreground">Selected concern:</p>
                <p className="font-semibold text-primary">
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
