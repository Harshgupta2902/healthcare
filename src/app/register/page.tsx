"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Apple, Phone, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Stethoscope } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

export default function RegisterPage() {
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
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/[\s-]/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      } else if (age > 120) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
    if (errors.gender) {
      setErrors(prev => ({ ...prev, gender: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.fullName,
        password: formData.password,
        role: formData.role,
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered. Please login instead."
        };
        toast.error(errorMap[error.code] || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created successfully! Redirecting...");
      
      // The signUp call should have signed the user in and set the token via the onSuccess hook in auth-client.ts
      // We'll give it a moment to ensure localStorage is updated
      setTimeout(() => {
        const redirectPath = formData.role === "professional" ? "/dashboard/professional" : "/dashboard";
        window.location.href = redirectPath;
      }, 800);
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} sign-up coming soon!`);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] flex items-center justify-center p-4 py-8">
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 text-2xl font-heading font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
      >
        HealthHere
      </Link>
      
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&h=1080&fit=crop&auto=format&q=80")'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading font-bold text-[var(--color-foreground)]">
              Create your account
            </CardTitle>
            <CardDescription className="text-[var(--color-muted-foreground)]">
              {formData.role === "professional" 
                ? "Join as a healthcare professional to provide care" 
                : "Join HealthHere to access quality healthcare"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as "client" | "professional" }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Professional
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-[var(--color-foreground)]">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] ${
                    errors.fullName ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-sm font-medium text-[var(--color-foreground)]">
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] ${
                    errors.mobileNumber ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.mobileNumber && (
                  <p className="text-sm text-red-500">{errors.mobileNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[var(--color-foreground)]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] ${
                    errors.email ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-[var(--color-foreground)]">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] ${
                    errors.dateOfBirth ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  disabled={isLoading}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-[var(--color-foreground)]">
                  Gender
                </Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={handleGenderChange}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] ${
                      errors.gender ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--color-foreground)]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] pr-10 ${
                      errors.password ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-foreground)]">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`bg-white border-[var(--color-border)] focus:border-[var(--color-ring)] focus:ring-[var(--color-ring)] pr-10 ${
                      errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium py-2.5 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[var(--color-muted-foreground)]">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("Google")}
                className="h-10 border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors"
                disabled={isLoading}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("Apple")}
                className="h-10 border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors"
                disabled={isLoading}
              >
                <Apple className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("Phone")}
                className="h-10 border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors"
                disabled={isLoading}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[var(--color-primary)] hover:underline transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}