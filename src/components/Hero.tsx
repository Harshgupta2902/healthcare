"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheckBig } from "lucide-react";
import { toast } from "sonner";

export default function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "DUPLICATE_EMAIL") {
          toast.error("This email is already subscribed to our newsletter");
        } else if (data.code === "INVALID_EMAIL_FORMAT") {
          toast.error("Please enter a valid email address");
        } else {
          toast.error(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
      setEmail("");
      toast.success("Thank you! You're now subscribed to our newsletter.");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookConsultation = () => {
    toast.info("Booking system coming soon! We'll contact you shortly.");
  };

  const handleLearnMore = () => {
    router.push("/how-it-works");
  };

  return (
    <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 overflow-hidden">
      {/* Doctor treating patient background image with 30% opacity */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&h=1080&fit=crop&auto=format&q=80')"
          }}
        />
      </div>
      
      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="space-y-6 md:space-y-8">
            {/* Headline */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading leading-tight">
                {" "}
                <span className="text-primary"></span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Your trusted partner for confidential, personalized healthcare. 
                Simple consultations, expert care, all from the comfort of your home.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleBookConsultation}
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-200">

                Book a free consultation
              </Button>
              <Button
                onClick={handleLearnMore}
                variant="secondary"
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-white/95 hover:bg-white border border-primary/20 shadow-md hover:shadow-lg transition-all duration-200">

                Learn how it works
              </Button>
            </div>

            {/* Email capture form */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-lg border-0 rounded-xl max-w-md">
              <CardContent className="p-4 sm:p-6">
                {!isSuccess ?
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Get updates on our launch
                      </label>
                      <div className="flex gap-2">
                        <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="flex-1 bg-background/50 border-input/50 focus:border-primary/50" />

                        <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6">

                          {isSubmitting ? "..." : "→"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CircleCheckBig className="w-3 h-3" />
                      <span>Your privacy is protected. No spam, ever.</span>
                    </div>
                  </form> :

                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <CircleCheckBig className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-green-700">Thank you!</p>
                      <p className="text-sm text-muted-foreground">
                        We'll notify you when we launch.
                      </p>
                    </div>
                    <Button
                    onClick={handleBookConsultation}
                    variant="outline"
                    size="sm"
                    className="w-full">

                      Schedule consultation
                    </Button>
                  </div>
                }
              </CardContent>
            </Card>
          </div>

          {/* Right column - Illustration */}
          <div className="flex justify-center lg:justify-end">
            <Card className="bg-card/90 backdrop-blur-sm shadow-xl border-0 rounded-xl overflow-hidden max-w-md w-full">
              <CardContent className="p-0">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&crop=faces&auto=format&q=80"
                  alt="Friendly healthcare professional in a consultation setting, representing empathetic and accessible medical care"
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover" />

                <div className="p-4 sm:p-6 bg-gradient-to-t from-card to-card/95">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="font-heading font-semibold text-base sm:text-lg">
                      Trusted Healthcare
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Professional consultations with licensed healthcare providers, 
                      designed around your schedule and comfort.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>);
}