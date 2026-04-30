"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import indianCities from "@/data/indian-cities.json";

const placesSearchSchema = z.object({
  input: z.string().min(1, "Input is required").max(100, "Input too long"),
});

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

type IndianCityRow = (typeof indianCities)[number];

function toPlacePrediction(c: IndianCityRow): PlacePrediction {
  return {
    place_id: `in-city-${c.id}`,
    description: `${c.name}, ${c.state}, India`,
    structured_formatting: {
      main_text: c.name,
      secondary_text: c.state,
    },
  };
}

const MAX_RESULTS = 25;

/** Local search over bundled Indian cities (no external Places API). */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  const validation = placesSearchSchema.safeParse({ input });
  if (!validation.success) {
    return [];
  }

  const q = validation.data.input.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const scored: { row: IndianCityRow; score: number }[] = [];

  for (const row of indianCities) {
    const name = row.name.toLowerCase();
    const state = row.state.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (state.startsWith(q)) score = 40;
    else if (state.includes(q)) score = 20;
    else continue;
    scored.push({ row, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.row.name.localeCompare(b.row.name);
  });

  const seen = new Set<string>();
  const out: PlacePrediction[] = [];
  for (const { row } of scored) {
    const key = `${row.name}\0${row.state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toPlacePrediction(row));
    if (out.length >= MAX_RESULTS) break;
  }

  return out;
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
  /** From `?cref=` — professional `users.id`; omit or null for generic booking */
  professionalId: z.string().uuid().nullish(),
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
    professional_id: validated.data.professionalId ?? null,
  };

  const { data, error } = await supabase.from("guest_appointments").insert(payload).select("id").single();
  if (error) {
    console.error("❌ [SERVER ACTION] submitGuestAppointment error:", error);
    return { error: error.message };
  }
  return { success: true, id: data.id };
}
