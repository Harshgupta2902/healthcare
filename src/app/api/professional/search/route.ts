import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get("specialty");
    const city = searchParams.get("city");

    let query = supabase
      .from('professional_profiles')
      .select(`
        user_id,
        specialization,
        bio,
        years_of_experience,
        consultation_fee,
        is_verified,
        users!inner (
          name
        ),
        client_medical_profiles (
          city
        )
      `);

    if (specialty) {
      query = query.ilike('specialization', `%${specialty}%`);
    }

    if (city) {
      // For filtering by joined table in Supabase, we can use the dot notation if defined properly
      // or filter in JS if the dataset is small. For better performance, we use !inner on the join.
      query = query.ilike('client_medical_profiles.city', `%${city}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const professionals = data.map((p: any) => ({
      id: p.user_id,
      name: p.users?.name,
      specialization: p.specialization,
      bio: p.bio,
      yearsOfExperience: p.years_of_experience,
      consultationFee: p.consultation_fee,
      isVerified: p.is_verified,
      city: p.client_medical_profiles?.city,
    }));

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error("Error searching professionals:", error);
    return NextResponse.json(
      { error: "Failed to search professionals: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

