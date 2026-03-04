"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Apple, Phone, Loader2, Eye, EyeOff, Sparkles, ChevronLeft, User, Stethoscope, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

interface FormData {
  fullName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  confirmPassword: string;
  role: "client" | "professional";
}

interface FormErrors {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
}

function RegisterContent() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const passwordRules = {
    length: formData.password.trim().length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    if (isPasswordValid && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [isPasswordValid]);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "professional" || roleParam === "client") {
      setFormData(prev => ({ ...prev, role: roleParam as "client" | "professional" }));
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "At least 8 characters required";
    } else if (!isPasswordValid) {
      const missing = [];
      if (!passwordRules.lowercase) missing.push("small letter");
      if (!passwordRules.uppercase) missing.push("capital letter");
      if (!passwordRules.number) missing.push("number");
      if (!passwordRules.symbol) missing.push("symbol");
      newErrors.password = `Missing: ${missing.join(", ")}`;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords match error";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Client: handleSubmit triggered with formData:", { email: formData.email, name: formData.fullName, role: formData.role });

    if (!validateForm()) {
      console.log("Client: Form validation failed:", errors);
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    console.log("Client: Form validated successfully, initiating signUp...");
    setIsLoading(true);

    try {
      const { signUp } = await import("@/features/profile/actions");
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      );

      console.log("Client: signUp result received:", result);

      if (result.error) {
        console.error("Client: Registration Error:", result.error);
        toast.error(result.error || "Registration failed. Try again.");
        return;
      }

      if (result.needsConfirmation) {
        console.log("Client: Confirmation required redirecting to login.");
        toast.success("Account created! PLEASE CHECK YOUR EMAIL to confirm your account.");
      } else {
        console.log("Client: Auto-login successful, redirecting to dashboard.");
        toast.success("Account created! You've been automatically logged in.");
        // Redirect to dashboard immediately after auto-login sync
        const redirectPath = formData.role === "professional" ? "/dashboard/professional" : "/dashboard";
        router.push(redirectPath);
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Client: UNEXPECTED ERROR during registration:", error);
      toast.error("An unexpected error occurred. Please check console.");
    } finally {
      setIsLoading(false);
      console.log("Client: handleSubmit finished.");
    }
  };


  return (
    <div className="min-h-screen relative bg-background flex items-center justify-center p-4 py-12 selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Designer Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <Card className="relative shadow-2xl border border-border/50 bg-background/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <CardHeader className="space-y-4 text-center pt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mx-auto mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Join the network</span>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                {formData.role === "professional"
                  ? "Register as a verified healthcare provider"
                  : "Join thousands of patients receiving expert care"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pb-10">
              <Tabs
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as "client" | "professional" }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/30 rounded-2xl h-14">
                  <TabsTrigger value="client" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <User className="h-3.5 w-3.5 mr-2" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <Stethoscope className="h-3.5 w-3.5 mr-2" />
                    Provider
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <Input
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 focus:bg-background transition-all font-bold ${errors.fullName ? "border-red-500/50 ring-red-500/20" : ""}`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 focus:bg-background transition-all font-bold ${errors.email ? "border-red-500/50 ring-red-500/20" : ""}`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 focus:bg-background transition-all font-bold ${errors.password ? "border-red-500/50 ring-red-500/20" : ""}`}
                  />
                  {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.password}</p>}

                  {/* Password Validation Box */}
                  <div className="mt-4 p-4 rounded-2xl bg-secondary/10 border border-border/50 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Password Security</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: "Min 8 Characters (Verified)", met: passwordRules.length },
                        { label: "Small Letter", met: passwordRules.lowercase },
                        { label: "Capital Letter", met: passwordRules.uppercase },
                        { label: "One Number", met: passwordRules.number },
                        { label: "Special Symbol", met: passwordRules.symbol },
                      ].map((rule, idx) => (
                        <div key={idx} className={`flex items-center gap-2 transition-colors duration-300 ${rule.met ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                          {rule.met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                          <span className="text-[10px] font-bold">{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm</Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 focus:bg-background transition-all font-bold ${errors.confirmPassword ? "border-red-500/50 ring-red-500/20" : ""}`}
                  />
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.confirmPassword}</p>}
                </div>

                <Button
                  type="submit"
                  className="md:col-span-2 h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground">Join with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[Mail, Apple, Phone].map((Icon, i) => (
                  <Button key={i} variant="outline" className="h-14 rounded-2xl border-border/50 hover:bg-secondary/50 transition-all group">
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                ))}
              </div>

              <p className="text-center text-sm font-medium text-muted-foreground">
                Already member? <Link href="/login" className="font-black text-primary hover:underline">Log In</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

