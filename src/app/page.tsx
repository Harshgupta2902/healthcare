import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import { HealthProfessionalSearch } from "@/components/SearchSection";
import { MedicalSpecialties } from "@/components/MedicalSpecialties";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex flex-col">
        {/* Hero Section with background and padding */}
        <section className="w-full">
          <Hero />
        </section>
        
        {/* Medical Specialties Section - moved below hero */}
        <section className="!w-[97%] !h-[442px]">
          <div className="container mx-auto px-6 md:px-12 !w-[1152px] !h-full !max-w-6xl">
            <MedicalSpecialties />
          </div>
        </section>
        
        {/* Search Section with proper spacing */}
        <section className="py-8 !w-full !h-[709px]">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <HealthProfessionalSearch />
          </div>
        </section>
        
        {/* Services Section moved down with visual separation */}
        <section id="services" className="w-full">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <ServicesSection />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>);

}import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import { HealthProfessionalSearch } from "@/components/SearchSection";
import { MedicalSpecialties } from "@/components/MedicalSpecialties";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex flex-col">
        {/* Hero Section with background and padding */}
        <section className="w-full">
          <Hero />
        </section>
        
        {/* Medical Specialties Section - moved below hero */}
        <section className="w-full">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-6xl">
            <MedicalSpecialties />
          </div>
        </section>
        
        {/* Search Section with proper spacing */}
        <section className="py-8 md:py-12 w-full">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <HealthProfessionalSearch />
          </div>
        </section>
        
        {/* Services Section moved down with visual separation */}
        <section id="services" className="w-full">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <ServicesSection />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>);

}