"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const placesSearchSchema = z.object({
  input: z.string().min(1, "Input is required").max(100, "Input too long"),
});

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

function buildUrl(params: Record<string, string>) {
  const usp = new URLSearchParams(params);
  return `https://maps.googleapis.com/maps/api/place/autocomplete/json?${usp.toString()}`;
}

export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  
  // Validate input
  const validation = placesSearchSchema.safeParse({ input });
  if (!validation.success) {
    return [];
  }

  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!GOOGLE_PLACES_API_KEY || !input.trim()) {
    return [];
  }

  const apiUrl = buildUrl({
    input,
    key: GOOGLE_PLACES_API_KEY,
    components: "country:in",
    types: "(cities)",
  });

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 0 }, // Don't cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch predictions: ${response.status}`);
    }

    const data: PlacesAutocompleteResponse = await response.json();

    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      const predictions = data.predictions || [];
      return predictions;
    }

    return [];
  } catch (error) {
    return [];
  }
}

export async function searchStates(input: string): Promise<PlacePrediction[]> {

  const validation = placesSearchSchema.safeParse({ input });
  if (!validation.success) {
    return [];
  }

  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!GOOGLE_PLACES_API_KEY || !input.trim()) {
    return [];
  }

  const apiUrl = buildUrl({
    input,
    key: GOOGLE_PLACES_API_KEY,
    components: "country:in",
    types: "(regions)",
  });

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!response.ok) {
      return [];
    }
    const data: PlacesAutocompleteResponse = await response.json();
    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      return data.predictions || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

// ============================================
// Submit Guest Appointment
// ============================================

const guestAppointmentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.coerce.number().int().min(0).max(120),
  phone: z.string().min(8),
  email: z.string().email(),
  category: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  date: z.string().min(1), // yyyy-mm-dd
  time: z.string().min(1), // HH:mm
  message: z.string().optional().nullable(),
});

export async function submitGuestAppointment(form: unknown) {
  const validated = guestAppointmentSchema.safeParse(form);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    first_name: validated.data.firstName,
    last_name: validated.data.lastName,
    age: validated.data.age,
    phone: validated.data.phone,
    email: validated.data.email,
    category: validated.data.category,
    state: validated.data.state,
    city: validated.data.city,
    appointment_date: validated.data.date,
    appointment_time: validated.data.time,
    message: validated.data.message ?? null,
    created_by: user?.id ?? null,
  };

  const { data, error } = await supabase.from("guest_appointments").insert(payload).select("id").single();
  if (error) {
    console.error("❌ [SERVER ACTION] submitGuestAppointment error:", error);
    return { error: error.message };
  }
  return { success: true, id: data.id };
}
