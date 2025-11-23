import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MessageSquare, MapPin, Clock, Shield, Calendar, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/soft-calming-medical-consultation-backgr-1e7d43f4-20251123160242.jpg"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          <div className="container mx-auto max-w-6xl px-6 md:px-12 relative z-10">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading">
                How <span className="text-primary">HealthHere</span> Works
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                We've designed multiple ways to connect with healthcare professionals, 
                ensuring you get the care you need, when and how you need it.
              </p>
            </div>

            {/* Key Benefits Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="bg-card border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-2">
                  <Clock className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="font-heading font-semibold">24/7 Availability</h3>
                  <p className="text-sm text-muted-foreground">
                    Access care anytime, anywhere
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-2">
                  <Shield className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="font-heading font-semibold">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    HIPAA-compliant platform
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="font-heading font-semibold">Flexible Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Book appointments that fit your life
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Video Consultations Section */}
        <section className="py-12 md:py-16 bg-accent/30">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading">Video Consultations</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Connect face-to-face with licensed healthcare professionals through secure, 
                  high-quality video calls from the comfort of your home. Perfect for routine 
                  check-ups, follow-ups, mental health sessions, and non-emergency medical concerns. 
                  Our video platform enables real-time interaction where doctors can observe symptoms, 
                  provide diagnoses, and prescribe medications when appropriate.
                </p>

                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-lg">How It Works:</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Schedule:</span> Choose a convenient time slot that works for you
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Connect:</span> Join the secure video call at your appointment time
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Consult:</span> Discuss your health concerns with a qualified professional
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Follow-up:</span> Receive prescriptions, treatment plans, or referrals as needed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Video className="w-4 h-4 mr-2" />
                    Book Video Consultation
                  </Button>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <Card className="bg-card border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/professional-video-consultation-scene-sh-b9af7f06-20251123155858.jpg"
                      alt="Patient having a video consultation with doctor from home"
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Text/Chat Consultations Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Card className="bg-card border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/person-using-smartphone-for-text-based-m-fdb84eda-20251123155856.jpg"
                      alt="Person using smartphone for text-based medical chat consultation"
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading">Text/Chat Consultations</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get expert medical advice through secure text messaging when you need quick answers 
                  or prefer written communication. Ideal for follow-up questions, prescription refills, 
                  minor concerns, and ongoing condition management. Our chat platform allows you to 
                  communicate at your own pace, review conversation history, and share photos of 
                  symptoms or test results when needed.
                </p>

                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-lg">How It Works:</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Message:</span> Send your health question through our secure platform
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Respond:</span> Healthcare provider reviews and responds within hours
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Clarify:</span> Continue the conversation with follow-up questions
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Save:</span> Access your complete chat history anytime for reference
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/50 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">💡 Pro Tip:</span> Chat consultations 
                    are perfect for busy schedules - message anytime and receive responses when 
                    providers are available, no appointment needed.
                  </p>
                </div>

                <div className="pt-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat Consultation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* In-Person Appointments Section */}
        <section className="py-12 md:py-16 bg-accent/30">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading">In-Person Appointments</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Schedule traditional face-to-face visits at one of our partner clinics when physical 
                  examinations are necessary. Essential for comprehensive health screenings, diagnostic 
                  procedures, vaccinations, and situations requiring hands-on medical assessment. 
                  Our network of modern, well-equipped facilities ensures you receive thorough, 
                  professional care in comfortable environments close to your location.
                </p>

                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-lg">How It Works:</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Find:</span> Search for partner clinics near your location
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Book:</span> Select your preferred time and healthcare provider
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Prepare:</span> Complete pre-visit forms online to save time
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold">Visit:</span> Arrive at the clinic for your comprehensive examination
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-lg">When to Choose In-Person:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Physical examinations requiring hands-on assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Laboratory tests, blood work, or diagnostic imaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Vaccinations, injections, or medical procedures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Complex cases requiring specialized equipment</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Nearby Clinic
                  </Button>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <Card className="bg-card border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6fc308b1-2696-455e-8bb8-f03eddd2ed89/generated_images/warm-welcoming-in-person-medical-appoint-2c7b8302-20251123155857.jpg"
                      alt="Patient and doctor having face-to-face consultation in modern clinic"
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-heading">
                Choose What Works Best for You
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                All consultation types include access to qualified healthcare professionals, 
                secure medical records, and seamless care coordination.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl">Video</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Real-time interaction</li>
                    <li>✓ Visual assessment</li>
                    <li>✓ Scheduled appointments</li>
                    <li>✓ 15-30 minute sessions</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Best for: Routine check-ups, follow-ups, mental health
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl">Chat</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Asynchronous messaging</li>
                    <li>✓ Flexible timing</li>
                    <li>✓ No appointment needed</li>
                    <li>✓ Quick questions</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Best for: Follow-ups, refills, minor concerns
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl">In-Person</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Comprehensive exams</li>
                    <li>✓ Lab work & imaging</li>
                    <li>✓ Physical procedures</li>
                    <li>✓ Specialized care</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Best for: Physical exams, tests, vaccinations
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto max-w-4xl px-6 md:px-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-heading">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of patients who trust HealthHere for convenient, 
              quality healthcare. Your first consultation is free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8 py-6">
                Create Free Account
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Browse Specialists
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}