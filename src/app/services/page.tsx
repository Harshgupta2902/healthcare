import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import { Stethoscope, Shield, Clock, Users } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-br from-primary/5 via-accent/20 to-secondary/30 border-b border-border overflow-hidden">
          {/* Background image with 20% opacity and parallax effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop&auto=format&q=80')",
              opacity: 0.2
            }}
          />
          
          <div className="container relative mx-auto max-w-6xl px-6 md:px-12 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Healthcare Services Designed for You
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                Experience comprehensive, accessible healthcare through our range of innovative digital services. 
                Quality care, whenever and wherever you need it.
              </p>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">Board-Certified</div>
                  <div className="text-xs text-muted-foreground">Professionals</div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">HIPAA Compliant</div>
                  <div className="text-xs text-muted-foreground">Secure Platform</div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">24/7 Access</div>
                  <div className="text-xs text-muted-foreground">On-Demand Care</div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">10,000+ Patients</div>
                  <div className="text-xs text-muted-foreground">Trusted by Many</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full py-8">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <ServicesSection />
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="w-full bg-secondary/30 border-y border-border py-16">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Why Choose HealthHere?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're committed to making quality healthcare accessible, affordable, and convenient for everyone.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card/50 p-6 rounded-lg border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Affordable Care</h3>
                <p className="text-muted-foreground">
                  Transparent pricing with no hidden fees. We accept most major insurance plans and offer flexible payment options.
                </p>
              </div>
              
              <div className="bg-card/50 p-6 rounded-lg border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Quality Assured</h3>
                <p className="text-muted-foreground">
                  All our healthcare professionals are board-certified and undergo rigorous verification to ensure the highest standards of care.
                </p>
              </div>
              
              <div className="bg-card/50 p-6 rounded-lg border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Seamless Experience</h3>
                <p className="text-muted-foreground">
                  From booking to follow-up, our platform is designed for simplicity. Get care without the complexity of traditional healthcare.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}