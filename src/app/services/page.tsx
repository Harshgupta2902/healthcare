import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import { Stethoscope, Shield, Clock, Users, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
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
          
          <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Solutions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Healthcare <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                Without Limits
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium mb-12">
              Experience the next generation of digital healthcare. We've simplified medical access so you can focus on what matters most: your wellbeing.
            </p>
            
            {/* Trust Indicators - Minimalist & Modern */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-8 border-t border-border/50">
              {[
                { icon: Stethoscope, label: "Board-Certified", sub: "Professionals" },
                { icon: Shield, label: "HIPAA Compliant", sub: "Secure Platform" },
                { icon: Clock, label: "24/7 Access", sub: "On-Demand Care" },
                { icon: Users, label: "10,000+ Patients", sub: "Trusted by Many" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black uppercase tracking-wider">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section - Clean Layout */}
        <section className="w-full py-12 relative">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ServicesSection />
          </div>
        </section>

        {/* Why Choose Us Section - Modern Grid */}
        <section className="w-full py-32 relative overflow-hidden bg-secondary/20 border-y border-border/50">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="md:w-1/3 sticky top-32">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                  Why settle for <br />
                  <span className="text-primary">ordinary?</span>
                </h2>
                <p className="text-lg text-muted-foreground font-medium mb-8">
                  We're committed to making quality healthcare accessible, affordable, and convenient for everyone.
                </p>
                <Button asChild className="rounded-xl h-12 px-6 font-bold">
                  <Link href="/book-consultation">Start Journey <ChevronRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
              
              <div className="md:w-2/3 grid gap-6">
                {[
                  {
                    title: "Affordable Care",
                    desc: "Transparent pricing with no hidden fees. We accept most major insurance plans and offer flexible payment options."
                  },
                  {
                    title: "Quality Assured",
                    desc: "All our healthcare professionals are board-certified and undergo rigorous verification to ensure the highest standards of care."
                  },
                  {
                    title: "Seamless Experience",
                    desc: "From booking to follow-up, our platform is designed for simplicity. Get care without the complexity of traditional healthcare."
                  }
                ].map((feature, i) => (
                  <div key={i} className="group p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
                    <h3 className="text-xl font-black mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
