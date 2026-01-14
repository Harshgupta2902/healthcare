"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Apple, Phone, Loader2, Eye, EyeOff, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created successfully! Please log in to continue.");
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        return;
      }

        toast.success("Welcome back! You've successfully logged in.");
        
        const userRole = data?.user?.role || "client";
        const redirectPath = searchParams.get("redirect") || (userRole === "professional" ? "/dashboard/professional" : "/dashboard");
        
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`);
  };

  return (
    <div className="min-h-screen relative bg-background flex items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Designer Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <div className="relative z-10 w-full max-w-md">
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
                <span>Secure Access</span>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Enter your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 focus:bg-background transition-all font-bold ${
                      errors.email ? "border-red-500/50" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-bold ml-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`h-14 rounded-2xl border-border/50 bg-secondary/20 px-6 pr-14 focus:bg-background transition-all font-bold ${
                        errors.password ? "border-red-500/50" : ""
                      }`}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-bold ml-1">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-border/50 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <Label htmlFor="rememberMe" className="text-xs font-bold text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" size="sm" className="text-xs font-black text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground">
                    Or Continue With
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: "Google" },
                  { icon: Apple, label: "Apple" },
                  { icon: Phone, label: "Phone" }
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    onClick={() => handleSocialLogin(item.label)}
                    className="h-14 rounded-2xl border-border/50 hover:bg-secondary/50 transition-all group"
                    disabled={isLoading}
                  >
                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground font-medium">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-black text-primary hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
