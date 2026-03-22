"use server";

import { z } from "zod";

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

export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  console.log("🔍 [SERVER ACTION] searchPlaces called with input:", input);
  
  // Validate input
  const validation = placesSearchSchema.safeParse({ input });
  if (!validation.success) {
    console.log("❌ [SERVER ACTION] Validation failed:", validation.error.flatten());
    return [];
  }
  console.log("✅ [SERVER ACTION] Validation passed");

  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  console.log("🔑 [SERVER ACTION] API Key exists:", !!GOOGLE_PLACES_API_KEY);
  console.log("🔑 [SERVER ACTION] API Key length:", GOOGLE_PLACES_API_KEY?.length || 0);
  
  if (!GOOGLE_PLACES_API_KEY || !input.trim()) {
    console.log("❌ [SERVER ACTION] Missing API key or empty input");
    console.log("   - API Key:", GOOGLE_PLACES_API_KEY ? "EXISTS" : "MISSING");
    console.log("   - Input trimmed:", input.trim());
    return [];
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_PLACES_API_KEY}`;
  console.log("🌐 [SERVER ACTION] Making API request to Google Places");
  console.log("   - URL (without key):", apiUrl.replace(GOOGLE_PLACES_API_KEY, "***HIDDEN***"));

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 0 }, // Don't cache
    });

    console.log("📡 [SERVER ACTION] Response status:", response.status);
    console.log("📡 [SERVER ACTION] Response ok:", response.ok);
    console.log("📡 [SERVER ACTION] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [SERVER ACTION] Response not OK:", response.status, errorText);
      throw new Error(`Failed to fetch predictions: ${response.status} ${errorText}`);
    }

    const data: PlacesAutocompleteResponse = await response.json();
    console.log("📦 [SERVER ACTION] Response data:", JSON.stringify(data, null, 2));
    console.log("📦 [SERVER ACTION] Status:", data.status);
    console.log("📦 [SERVER ACTION] Predictions count:", data.predictions?.length || 0);

    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      const predictions = data.predictions || [];
      console.log("✅ [SERVER ACTION] Returning predictions:", predictions.length);
      return predictions;
    }

    console.log("⚠️ [SERVER ACTION] Unexpected status:", data.status);
    return [];
  } catch (error) {
    console.error("❌ [SERVER ACTION] Error fetching place predictions:");
    console.error("   - Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("   - Error message:", error instanceof Error ? error.message : String(error));
    console.error("   - Full error:", error);
    return [];
  }
}
