"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  Calendar,
  FileText,
  MapPin,
  Check,
  ChevronsUpDown,
  Loader2,
  BadgeCheck,
  Zap,
  Lock,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { LpButton } from "@/components/ui/lp-button";
import { LpTextField } from "@/components/ui/lp-text-field";
import { getBookingFormPrefill, searchPlaces, submitGuestAppointment, type PlacePrediction } from "./actions";
import { getProfessionalById } from "@/features/professional/actions";
import { buildBookingSuccessHref } from "@/lib/booking-confirmation-ref";
import { decodeConsultantIdRef } from "@/lib/consultant-booking-ref";
import { HOME_DOC_AVATARS } from "@/app/home/constants";
import { BOOKING_TIME_SLOTS } from "./constants";
import { BookingConsultantSidebar } from "./booking-consultant-sidebar";

const healthCategories = [
  "General Medicine",
  "Mental Health",
  "Women's Health",
  "Child Health",
  "Eye Problems",
  "Psychiatric Care",
  "Bone & Joint Pain",
  "Skin Issues",
  "Heart Health",
  "Family Medicine",
] as const;

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
    age: z.coerce.number().int("Age must be a whole number").min(0, "Age cannot be negative").max(100, "Age must be ≤ 100"),
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

const lpBookingFieldClass =
  "block w-full appearance-none rounded-lg border border-lp-outline-variant/50 bg-lp-surface-container-low py-3 px-4 font-sans text-base leading-6 text-lp-on-surface outline-none transition-all focus:border-lp-brand focus:ring-2 focus:ring-lp-brand/20 disabled:opacity-50 md:text-sm";

function BookingSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="booking-shadow rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-lp-brand">{icon}</span>
        <h2 className="font-heading text-2xl font-semibold text-lp-on-surface">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BookingSelect({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export function BookConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cref = searchParams.get("cref")?.trim() ?? "";
  const isConsultantBooking = cref.length > 0;
  const decodedConsultantId = useMemo(
    () => (isConsultantBooking ? decodeConsultantIdRef(cref) : null),
    [cref, isConsultantBooking],
  );
  const [bookingConsultant, setBookingConsultant] = useState<
    Awaited<ReturnType<typeof getProfessionalById>> | undefined
  >(undefined);
  const [bookingConsultantLoading, setBookingConsultantLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { category: "", state: "", city: "", time: "" },
  });

  useEffect(() => {
    let cancelled = false;
    void getBookingFormPrefill().then(({ prefill }) => {
      if (cancelled || !prefill) return;

      reset((current) => ({
        ...current,
        ...(prefill.firstName ? { firstName: prefill.firstName } : {}),
        ...(prefill.lastName ? { lastName: prefill.lastName } : {}),
        ...(prefill.email ? { email: prefill.email } : {}),
        ...(prefill.phone ? { phone: prefill.phone } : {}),
        ...(prefill.age != null ? { age: prefill.age } : {}),
        ...(!isConsultantBooking && prefill.city
          ? { city: prefill.city, state: prefill.state || prefill.city }
          : {}),
      }));

      if (!isConsultantBooking && prefill.city) {
        setCity(prefill.city);
        setStateName(prefill.state || prefill.city);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reset, isConsultantBooking]);

  useEffect(() => {
    if (!decodedConsultantId) {
      setBookingConsultant(undefined);
      setBookingConsultantLoading(false);
      return;
    }
    let cancelled = false;
    setBookingConsultantLoading(true);
    getProfessionalById(decodedConsultantId)
      .then((data) => {
        if (!cancelled) setBookingConsultant(data ?? undefined);
      })
      .finally(() => {
        if (!cancelled) setBookingConsultantLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [decodedConsultantId]);

  useEffect(() => {
    if (!bookingConsultant) return;
    const location = bookingConsultant.city?.trim() || "Online";
    setCity(location);
    setStateName(location);
    setValue("city", location);
    setValue("state", location);
    const specialization = bookingConsultant.specialization?.trim();
    if (specialization) {
      setValue("category", specialization);
    }
  }, [bookingConsultant, setValue]);

  const parseIndianLocation = (description: string) => {
    const parts = description.split(",").map((p) => p.trim());
    const cityPart = parts[0] || "";
    let statePart = "";
    if (parts.length >= 3) statePart = parts[parts.length - 2];
    else if (parts.length >= 2) statePart = parts[1];
    return { cityPart, statePart };
  };

  const handlePlaceSelect = (description: string) => {
    const { cityPart, statePart } = parseIndianLocation(description);
    setCity(cityPart);
    setStateName(statePart);
    setValue("city", cityPart, { shouldValidate: true });
    setValue("state", statePart, { shouldValidate: true });
    setSearchQuery("");
    setPredictions([]);
    setLocationOpen(false);
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!searchQuery.trim()) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setPredictions(results);
      } catch {
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  const onSubmit = async (data: AppointmentForm) => {
    setIsSubmitting(true);
    try {
      const res = await submitGuestAppointment({
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        phone: data.phone,
        email: data.email,
        category: bookingConsultant?.specialization?.trim() || data.category,
        state: data.state || bookingConsultant?.city?.trim() || "Online",
        city: data.city || bookingConsultant?.city?.trim() || "Online",
        date: data.date,
        time: data.time,
        message: data.message ?? "",
        professionalId: decodedConsultantId ?? undefined,
      });
      if ((res as { error?: string })?.error) {
        toast.error("Failed to book appointment", {
          description:
            typeof (res as { error?: string }).error === "string"
              ? (res as { error: string }).error
              : "Please try again.",
        });
        return;
      }
      const booked = res as { success: true; id: string };
      router.push(buildBookingSuccessHref(booked.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationLabel = city ? `${city}${stateName ? `, ${stateName}` : ""}` : "";
  const locationError = errors.city?.message || errors.state?.message;

  return (
    <div className="w-full bg-lp-surface px-5 py-12 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-lp-cta-bg sm:text-5xl md:text-[48px] md:leading-[56px]">
            Schedule Your Consultation
          </h1>
          <p className="font-sans text-lg leading-relaxed text-lp-on-surface-variant">
            {isConsultantBooking
              ? "Complete your details to book with your selected specialist."
              : "Connect with world-class healthcare specialists in just a few steps."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
            <div className={cn("space-y-6", isConsultantBooking ? "lg:col-span-7" : "lg:col-span-8")}>

              <BookingSection icon={<User className="size-6" aria-hidden />} title="Patient Information">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                  <LpTextField
                    id="firstName"
                    label="First Name"
                    placeholder="e.g. Jane"
                    rounding="lg"
                    inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                    error={errors.firstName?.message}
                    maxLength={50}
                    {...register("firstName")}
                  />
                  <LpTextField
                    id="lastName"
                    label="Last Name"
                    placeholder="e.g. Doe"
                    rounding="lg"
                    inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                    error={errors.lastName?.message}
                    maxLength={50}
                    {...register("lastName")}
                  />
                  <LpTextField
                    id="age"
                    label="Age"
                    type="number"
                    placeholder="Years"
                    rounding="lg"
                    inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                    error={errors.age?.message}
                    min={0}
                    max={100}
                    {...register("age")}
                  />
                  <LpTextField
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    rounding="lg"
                    inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                    error={errors.phone?.message}
                    maxLength={10}
                    {...register("phone")}
                  />
                  <div className="md:col-span-2">
                    <LpTextField
                      id="email"
                      label="Email Address"
                      type="email"
                      placeholder="jane.doe@example.com"
                      rounding="lg"
                      inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                      error={errors.email?.message}
                      maxLength={254}
                      {...register("email")}
                    />
                  </div>
                </div>
              </BookingSection>

              <BookingSection icon={<Calendar className="size-6" aria-hidden />} title="Appointment Details">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                  {!isConsultantBooking && (
                  <BookingSelect id="location" label="Location Search" error={locationError} className="md:col-span-1">
                    <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          role="combobox"
                          aria-expanded={locationOpen}
                          className={cn(
                            lpBookingFieldClass,
                            "flex items-center justify-between gap-2 text-left",
                            !locationLabel && "text-lp-on-surface-variant/70",
                          )}
                          onClick={() => {
                            setLocationOpen(true);
                            setTimeout(() => locationInputRef.current?.focus(), 100);
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <MapPin className="size-5 shrink-0 text-lp-outline-variant" aria-hidden />
                            <span className="truncate">{locationLabel || "Enter city or clinic name"}</span>
                          </span>
                          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-lp-outline-variant/30 p-0 shadow-lg" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            ref={locationInputRef}
                            placeholder="Type to search location..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className="h-11"
                          />
                          <CommandList>
                            {isSearching ? (
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
                                        "mr-2 size-4",
                                        prediction.description.includes(city) ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{prediction.structured_formatting?.main_text || prediction.description}</span>
                                      {prediction.structured_formatting?.secondary_text && (
                                        <span className="text-xs text-lp-on-surface-variant">
                                          {prediction.structured_formatting.secondary_text}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ) : searchQuery.trim() ? (
                              <CommandEmpty>No locations found.</CommandEmpty>
                            ) : (
                              <CommandEmpty>Start typing to search...</CommandEmpty>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </BookingSelect>
                  )}

                  {!isConsultantBooking && (
                  <BookingSelect id="category" label="Medical Category" error={errors.category?.message}>
                    <select
                      id="category"
                      className={lpBookingFieldClass}
                      value={watch("category")}
                      onChange={(e) => setValue("category", e.target.value, { shouldValidate: true })}
                    >
                      <option value="">Select category</option>
                      {healthCategories.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </BookingSelect>
                  )}

                  <LpTextField
                    id="date"
                    label="Preferred Date"
                    type="date"
                    rounding="lg"
                    inputClassName="bg-lp-surface-container-low border-lp-outline-variant/50"
                    error={errors.date?.message}
                    min={new Date().toISOString().split("T")[0]}
                    {...register("date")}
                  />

                  <BookingSelect id="time" label="Preferred Time" error={errors.time?.message}>
                    <select
                      id="time"
                      className={lpBookingFieldClass}
                      value={watch("time")}
                      onChange={(e) => setValue("time", e.target.value, { shouldValidate: true })}
                    >
                      <option value="">Select time slot</option>
                      {BOOKING_TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </BookingSelect>
                </div>
              </BookingSection>

              <BookingSection icon={<FileText className="size-6" aria-hidden />} title="Additional Information">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="font-sans text-xs font-semibold uppercase tracking-wide text-lp-on-surface-variant"
                  >
                    Optional Message (Symptoms, history, or specific requests)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Briefly describe your reason for consultation..."
                    maxLength={500}
                    className={cn(lpBookingFieldClass, "resize-y min-h-[120px]")}
                    {...register("message")}
                  />
                  {errors.message && <p className="text-xs font-medium text-red-600">{errors.message.message}</p>}
                </div>
              </BookingSection>

              <div className="flex flex-col items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                <div className="flex items-center justify-center gap-2 text-lp-on-surface-variant sm:justify-start">
                  <BadgeCheck className="size-5 shrink-0 text-emerald-600" aria-hidden />
                  <span className="font-sans text-sm">Encrypted &amp; Secure booking process</span>
                </div>
                <LpButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border-0 bg-lp-brand-bright px-10 py-0 font-heading text-base font-semibold leading-none normal-case tracking-normal shadow-xl hover:shadow-lp-brand-bright/25 sm:w-auto sm:min-w-[220px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </LpButton>
              </div>
            </div>

            {isConsultantBooking ? (
              <BookingConsultantSidebar consultant={bookingConsultant ?? undefined} loading={bookingConsultantLoading} />
            ) : (
            <aside className="space-y-6 lg:col-span-4">
              <div className="relative overflow-hidden rounded-xl bg-lp-brand-bright p-6 text-lp-on-secondary-container sm:p-8">
                <div className="relative z-10">
                  <h3 className="mb-2 font-heading text-2xl font-bold text-white">Expert Care Awaits</h3>
                  <p className="mb-4 font-sans text-sm leading-relaxed text-white">
                    Our network includes over 500+ board-certified specialists ready to provide personalized healthcare
                    solutions.
                  </p>
                  <div className="flex -space-x-3">
                    {HOME_DOC_AVATARS.map((src, i) => (
                      <Image
                        key={i}
                        src={src}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="size-10 shrink-0 rounded-full border-2 border-lp-on-secondary-container object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-lp-on-secondary-container bg-lp-brand text-xs font-bold">
                      +12k
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
              </div>

              <div className="rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-high p-6 sm:p-8">
                <h4 className="mb-6 font-sans text-xs font-semibold uppercase tracking-widest text-lp-brand">
                  Why HealthHere?
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Zap className="size-5 shrink-0 text-lp-brand" aria-hidden />
                    <div>
                      <p className="font-sans text-sm font-semibold text-lp-on-surface">Fast Response</p>
                      <p className="font-sans text-sm text-lp-on-surface-variant">Confirmed within 15 minutes.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Lock className="size-5 shrink-0 text-lp-brand" aria-hidden />
                    <div>
                      <p className="font-sans text-sm font-semibold text-lp-on-surface">HIPAA Compliant</p>
                      <p className="font-sans text-sm text-lp-on-surface-variant">Your health data is encrypted.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Headphones className="size-5 shrink-0 text-lp-brand" aria-hidden />
                    <div>
                      <p className="font-sans text-sm font-semibold text-lp-on-surface">24/7 Support</p>
                      <p className="font-sans text-sm text-lp-on-surface-variant">Talk to our care team anytime.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
