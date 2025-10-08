import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    name: "Personal Trainer",
    description: "Designs fitness programs to improve strength, endurance, and overall physical health.",
    dealsWith: "Obesity, muscle imbalance, posture correction, and performance enhancement."
  },
  {
    id: 8,
    name: "Dietician",
    description: "Creates nutrition plans to support health, weight management, and disease prevention.",
    dealsWith: "Obesity, diabetes, food intolerances, and nutritional deficiencies."
  },
  {
    id: 9,
    name: "Homeopathy",
    description: "Uses diluted natural substances to stimulate the body's self-healing response.",
    dealsWith: "Allergies, chronic fatigue, migraines, and skin conditions."
  },
  {
    id: 10,
    name: "Ayurveda",
    description: "Ancient Indian medicine balancing body, mind, and spirit through diet and herbs.",
    dealsWith: "Digestive issues, stress, hormonal imbalance, and chronic pain."
  },
  {
    id: 11,
    name: "Naturopathy",
    description: "Promotes healing through natural remedies, lifestyle changes, and holistic care.",
    dealsWith: "Fatigue, allergies, hormonal issues, and stress-related disorders."
  },
  {
    id: 12,
    name: "Radiologist",
    description: "Uses imaging technologies to diagnose and monitor diseases and injuries.",
    dealsWith: "Fractures, tumors, internal bleeding, and organ abnormalities."
  },
  {
    id: 13,
    name: "Allergist",
    description: "Specializes in diagnosing and managing allergic reactions and immune system disorders.",
    dealsWith: "Asthma, sinusitis, food allergies, and seasonal allergies."
  },
  {
    id: 14,
    name: "Cardiologist",
    description: "Focuses on the heart and circulatory system's health and diseases.",
    dealsWith: "Chest pain, hypertension, arrhythmia, and heart attacks."
  },
  {
    id: 15,
    name: "Dermatologist",
    description: "Treats conditions related to the skin, hair, and nails.",
    dealsWith: "Acne, eczema, psoriasis, and skin infections."
  },
  {
    id: 16,
    name: "Urologist",
    description: "Specializes in urinary tract and male reproductive system health.",
    dealsWith: "Kidney stones, urinary infections, prostate issues, and infertility."
  },
  {
    id: 17,
    name: "Surgeon",
    description: "Performs operations to treat injuries, deformities, and diseases.",
    dealsWith: "Appendicitis, hernias, trauma injuries, and tumor removals."
  },
  {
    id: 18,
    name: "Pathologist",
    description: "Examines tissues and lab samples to diagnose diseases at the microscopic level.",
    dealsWith: "Cancer diagnosis, infections, and blood disorders."
  },
  {
    id: 19,
    name: "Otolaryngologist (ENT)",
    description: "Treats disorders of the ear, nose, and throat and related structures.",
    dealsWith: "Sinusitis, hearing loss, tonsillitis, and balance problems."
  },
  {
    id: 20,
    name: "Oncologist",
    description: "Diagnoses and treats various types of cancers using medication, radiation, or surgery.",
    dealsWith: "Breast, lung, blood, and prostate cancers."
  },
  {
    id: 21,
    name: "Neurologist",
    description: "Specializes in disorders of the brain, spinal cord, and nervous system.",
    dealsWith: "Migraines, epilepsy, stroke, Parkinson's, and neuropathy."
  },
  {
    id: 22,
    name: "Endocrinologist",
    description: "Focuses on hormone-related diseases and metabolism regulation.",
    dealsWith: "Diabetes, thyroid disorders, obesity, and reproductive hormone issues."
  }
];

export default function SpecialistsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Medical Specialties
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Explore our comprehensive network of medical specialists across various fields. 
            Each specialist is board-certified and ready to provide expert care tailored to your needs.
          </p>
        </div>

        {/* Specialists Grid */}
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
                
                <Button className="w-full" size="sm">
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-secondary/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our care team can help connect you with the right specialist for your specific needs.
          </p>
          <Button size="lg">
            Contact Care Team
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}