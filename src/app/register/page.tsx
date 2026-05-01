"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Apple,
  Phone,
  Loader2,
  Sparkles,
  User,
  Stethoscope,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "client" | "professional";
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password rules
  const passwordRules = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "client" || roleParam === "professional") {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }


    if (!formData.password) {
      newErrors.password = "Required";
    } else if (!isPasswordValid) {
      newErrors.password = "Weak password";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const messages = Object.values(validationErrors).filter(Boolean) as string[];
      toast.error(messages.join(" • "));
      return;
    }

    setIsLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;

    try {
      const { signUp } = await import("@/features/profile/actions");

      const result = await signUp(
        formData.email,
        formData.password,
        fullName,
        formData.role
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account created!");

      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="rounded-[32px] shadow-2xl">
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
              {/* ROLE */}
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


              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* FIRST + LAST NAME */}
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                </div>

                {/* MOBILE */}
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input
                    name="mobileNumber"
                    placeholder="9876543210"
                    value={formData.mobileNumber}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    }}
                    onChange={handleChange}
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                {/* PASSWORD */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Confirm Password</Label>
                      <Input
                        name="confirmPassword"
                      type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD RULES */}
                  <div className="mt-4 rounded-2xl space-y-2">
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

                {/* CONFIRM */}


                <Button
                  type="submit"
                  className="md:col-span-2 h-14"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <Separator />

              <p className="text-center text-sm">
                Already have account?{" "}
                <Link href="/login" className="font-bold text-primary">
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}