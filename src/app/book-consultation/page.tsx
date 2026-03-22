"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ArrowRight, MapPin, Stethoscope, Brain, Baby, Eye, Heart, Activity, Bone, Pill, Smile, Users, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface HealthConcern {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  specialty: string;
}

const healthConcerns: HealthConcern[] = [
  {
    id: "general",
    name: "General Health",
    description: "Fever, cold, cough, fatigue, or general checkup",
    icon: <Activity className="w-6 h-6" />,
    specialty: "General Physician"
  },
  {
    id: "mental-health",
    name: "Mental Health",
    description: "Anxiety, depression, stress, or emotional concerns",
    icon: <Brain className="w-6 h-6" />,
    specialty: "Psychologist"
  },
  {
    id: "womens-health",
    name: "Women's Health",
    description: "Menstrual issues, pregnancy, hormonal concerns",
    icon: <Heart className="w-6 h-6" />,
    specialty: "Gynecologist"
  },
  {
    id: "child-health",
    name: "Child Health",
    description: "Pediatric care, vaccinations, growth concerns",
    icon: <Baby className="w-6 h-6" />,
    specialty: "Pediatrician"
  },
  {
    id: "eye-problems",
    name: "Eye Problems",
    description: "Vision issues, eye pain, infections",
    icon: <Eye className="w-6 h-6" />,
    specialty: "Ophthalmologist"
  },
  {
    id: "psychiatric",
    name: "Psychiatric Care",
    description: "Severe mental health, medication management",
    icon: <Pill className="w-6 h-6" />,
    specialty: "Psychiatrist"
  },
  {
    id: "bone-joint",
    name: "Bone & Joint Pain",
    description: "Back pain, arthritis, fractures, sports injuries",
    icon: <Bone className="w-6 h-6" />,
    specialty: "Orthopedic"
  },
  {
    id: "skin-issues",
    name: "Skin Issues",
    description: "Rashes, acne, allergies, skin infections",
    icon: <Smile className="w-6 h-6" />,
    specialty: "Dermatologist"
  },
  {
    id: "heart-health",
    name: "Heart Health",
    description: "Chest pain, blood pressure, heart conditions",
    icon: <Stethoscope className="w-6 h-6" />,
    specialty: "Cardiologist"
  },
  {
    id: "family-health",
    name: "Family Medicine",
    description: "Healthcare for the whole family",
    icon: <Users className="w-6 h-6" />,
    specialty: "General Physician"
  }
];

import { searchPlaces, submitGuestAppointment } from "./actions";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}


export default function BookConsultationPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // state & city are parsed from a single location input
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceStateRef = useRef<NodeJS.Timeout | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const appointmentSchema = z
    .object({
      firstName: z
        .string()
        .min(2, "First name is required")
        .max(50, "Max 50 characters")
        .regex(/^[A-Za-z\s'-]+$/, "Only letters are allowed"),
      lastName: z
        .string()
        .min(2, "Last name is required")
        .max(50, "Max 50 characters")
        .regex(/^[A-Za-z\s'-]+$/, "Only letters are allowed"),
      age: z
        .coerce
        .number()
        .int("Age must be a whole number")
        .min(0, "Age cannot be negative")
        .max(100, "Age must be ≤ 100"),
      phone: z
        .string()
        .length(10, "Phone must be exactly 10 digits")
        .regex(/^[0-9]{10}$/, "Only digits allowed (no country code)"),
      email: z.string().email("Invalid email").max(254, "Max 254 characters"),
      category: z.string().min(1, "Please select a category"),
      state: z.string().min(1, "State is required").max(60, "Max 60 characters"),
      city: z.string().min(1, "City is required").max(60, "Max 60 characters"),
      date: z.string().min(1, "Date is required"),
      time: z.string().min(1, "Time is required"),
      message: z.string().max(500, "Max 500 characters").optional(),
    })
    .superRefine((val, ctx) => {
      // Date cannot be in the past
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const pickedDate = new Date(val.date);
      if (isNaN(pickedDate.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Invalid date" });
        return;
      }
      if (pickedDate < startOfToday) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Date cannot be in the past" });
      }
      // If date is today, time must not be in the past
      if (
        pickedDate.getFullYear() === startOfToday.getFullYear() &&
        pickedDate.getMonth() === startOfToday.getMonth() &&
        pickedDate.getDate() === startOfToday.getDate()
      ) {
        const [hh, mm] = val.time.split(":");
        const picked = new Date(pickedDate);
        picked.setHours(parseInt(hh || "0", 10), parseInt(mm || "0", 10), 0, 0);
        if (picked < new Date()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["time"], message: "Time cannot be earlier than now" });
        }
      }
    });

  type AppointmentForm = z.infer<typeof appointmentSchema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      category: "",
      state: "",
      city: "",
    }
  });

  // single-page form: no stepper

  const parseIndianLocation = (description: string) => {
    // Heuristic: "City, State, India" or "City, State"
    const parts = description.split(",").map((p) => p.trim());
    let cityPart = parts[0] || "";
    // find state as second last (before country) or second
    let statePart = "";
    if (parts.length >= 3) {
      statePart = parts[parts.length - 2]; // before country
    } else if (parts.length >= 2) {
      statePart = parts[1];
    }
    return { cityPart, statePart };
  };

  const handlePlaceSelect = (description: string) => {
    const { cityPart, statePart } = parseIndianLocation(description);
    setCity(cityPart);
    setStateName(statePart);
    setValue("city", cityPart);
    setValue("state", statePart);
    setSearchQuery("");
    setPredictions([]);
    setOpen(false);
  };

  // Debounced search for place predictions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const startTime = Date.now();
        // General city/location search
        const results = await searchPlaces(searchQuery);
        const duration = Date.now() - startTime;
        setPredictions(results);
      } catch (error) {
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const onSubmit = async (data: AppointmentForm) => {
    const res = await submitGuestAppointment({
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      phone: data.phone,
      email: data.email,
      category: data.category,
      state: data.state,
      city: data.city,
      date: data.date,
      time: data.time,
      message: data.message ?? "",
    });
    if ((res as any)?.error) {
      toast.error("Failed to book appointment", {
        description: typeof (res as any).error === "string" ? (res as any).error : "Please try again.",
      });
      return;
    }
    toast.success("Appointment booked", {
      description: "We’ve received your request. We’ll get back to you shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-12 md:pt-16 pb-24">
      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 pt-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">Make an Appointment</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Fill your details and pick appointment preferences.</p>
        </div>

        <form className="max-w-xl mx-auto space-y-7 pt-2" onSubmit={handleSubmit(onSubmit)}>

            <Card className="border-2 rounded-2xl shadow-md">
              <CardHeader className="pt-6 pb-3 px-6">
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-0 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Input placeholder="First name" maxLength={50} {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input placeholder="Last name" maxLength={50} {...register("lastName")} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input placeholder="Age" type="number" min={0} max={100} {...register("age")} />
                    {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input placeholder="Phone number" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} {...register("phone")} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Input placeholder="Email" type="email" maxLength={254} {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 rounded-2xl shadow-md">
              <CardHeader className="pt-6 pb-3 px-6">
                <CardTitle className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-0 p-6">
                <div className="space-y-1.5">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal h-12 text-base"
                        onClick={() => {
                          setOpen(true);
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 100);
                        }}
                      >
                        <span className={cn("truncate", !city && "text-muted-foreground")}>
                          {city ? `${city}${stateName ? `, ${stateName}` : ""}` : "Search location (city/state)"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-full max-w-lg p-0 rounded-xl shadow-lg border" 
                      align="start" 
                      sideOffset={4}
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          ref={inputRef}
                          placeholder="Type to search location..."
                          value={searchQuery}
                          onValueChange={(inputValue) => {
                            setSearchQuery(inputValue);
                            if (inputValue && !open) {
                              setOpen(true);
                            }
                          }}
                          className="h-11"
                        />
                        <CommandList>
                          {isLoading ? (
                            <CommandEmpty>Searching...</CommandEmpty>
                          ) : predictions.length > 0 ? (
                            <CommandGroup>
                              {predictions.map((prediction) => (
                                <CommandItem
                                  key={prediction.place_id}
                                  value={prediction.description}
                                  onSelect={() => handlePlaceSelect(prediction.description)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      prediction.description.includes(city) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{prediction.structured_formatting?.main_text || prediction.description}</span>
                                    {prediction.structured_formatting?.secondary_text && (
                                      <span className="text-xs text-muted-foreground">
                                        {prediction.structured_formatting.secondary_text}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : searchQuery.trim() ? (
                            <CommandEmpty>No locations found. Try a different search.</CommandEmpty>
                          ) : (
                            <CommandEmpty>Start typing to search location...</CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between text-left font-normal h-12 text-base">
                          <span className={cn("truncate", !watch("category") && "text-muted-foreground")}>
                            {watch("category") || "Select Category"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search category..." className="h-11" />
                          <CommandList>
                            <CommandGroup>
                              {healthConcerns.map((c) => (
                                <CommandItem key={c.id} value={c.name} onSelect={() => { setValue("category", c.name); setCategoryOpen(false); }}>
                                  <Check className={cn("mr-2 h-4 w-4", watch("category") === c.name ? "opacity-100" : "opacity-0")} />
                                  {c.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input type="date" min={new Date().toISOString().split("T")[0]} {...register("date")} />
                    {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input type="time" {...register("time")} />
                    {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
                  </div>
                  <div className="md:col-span-3">
                    <Input placeholder="Additional message (optional)" maxLength={500} {...register("message")} />
                  </div>
                </div>

                <Button type="submit" className="w-full py-6 text-lg mt-4" size="lg">
                  Find Specialists
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </form>
      </main>

    </div>
  );
}
