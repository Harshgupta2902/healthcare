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

        {/* Visual Separator */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Medical Specialties Section */}
        <section className="w-full">
          <MedicalSpecialties />
        </section>

        {/* Services Section */}
        <section id="services" className="w-full">
          <ServicesSection />
        </section>

        {/* Final Trust Section / Banner */}
        <section className="py-24 w-full bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto max-w-4xl px-4 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Experience the future of <span className="text-primary">care today.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
              We're not just another healthcare app. We're your dedicated health partner, available whenever and wherever you need us.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
