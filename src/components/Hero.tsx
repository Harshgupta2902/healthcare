"use client";

import { motion } from "framer-motion";
import { CircleCheckBig, ArrowRight, Sparkles } from "lucide-react";
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
    router.push("/book-consultation");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-20 overflow-hidden">
      {/* Designer Background: Mesh Gradients and Patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_70%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      </div>
      
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3" />
            <span>Redefining Healthcare Accessibility</span>
          </motion.div>

          <div className="space-y-8 max-w-4xl">
            {/* Headline with visual flair */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight leading-[1.1] text-foreground">
                Healthcare that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                  Actually Works
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
                Ditch the waiting room. Access world-class medical experts, personalized treatment plans, and secure care from anywhere.
              </p>
            </motion.div>

            {/* Premium CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Button
                asChild
                size="lg"
                className="group relative h-16 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.5)] transition-all duration-300"
              >
                <Link href="/book-consultation" className="flex items-center gap-2">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-16 px-10 text-lg font-semibold rounded-2xl border-2 hover:bg-secondary/50 backdrop-blur-sm transition-all"
              >
                <Link href="/how-it-works">
                  Explore Platform
                </Link>
              </Button>
            </motion.div>

            {/* Trust Markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">10k+</span>
                <span className="text-xs uppercase tracking-widest font-semibold">Active Users</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">4.9/5</span>
                <span className="text-xs uppercase tracking-widest font-semibold">User Rating</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">24/7</span>
                <span className="text-xs uppercase tracking-widest font-semibold">Expert Support</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">HIPAA</span>
                <span className="text-xs uppercase tracking-widest font-semibold">Security Level</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
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
    router.push("/book-consultation");
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
          <div className="flex flex-col items-center text-center">
            {/* Content */}
            <div className="space-y-6 md:space-y-8 max-w-3xl">
              {/* Headline */}
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading leading-tight">
                  Your Health, <span className="text-primary">Our Priority</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Your trusted partner for confidential, personalized healthcare. 
                  Simple consultations, expert care, all from the comfort of your home.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/book-consultation">
                    Book a free consultation
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-white/95 hover:bg-white border border-primary/20 shadow-md hover:shadow-lg transition-all duration-200">
                  <Link href="/how-it-works">
                    Learn how it works
                  </Link>
                </Button>
              </div>

              {/* Email capture form */}
              <div className="flex justify-center pt-4">
                <Card className="bg-card/80 backdrop-blur-sm shadow-lg border-0 rounded-xl w-full max-w-md">
                  <CardContent className="p-4 sm:p-6">
                    {!isSuccess ?
                    <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
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
            </div>
          </div>
        </div>
    </section>);
}