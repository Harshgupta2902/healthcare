import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import { MedicalSpecialties } from "@/components/MedicalSpecialties";

export default function HomePage() {
  return (
    <div className="bg-background selection:bg-primary selection:text-primary-foreground min-h-screen">
      {/* Designer Background: Subtle texture across the whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <section className="w-full">
          <Hero />
        </section>

        
        {/* Medical Specialties Section */}
        <section className="w-full">
          <MedicalSpecialties />
        </section>

        {/* Services Section */}
        <section id="services" className="w-full">
          <ServicesSection />
        </section>
      </div>
    </div>
  );
}
