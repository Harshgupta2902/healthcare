import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionalProfiles, user, userProfiles } from "@/db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get("specialty");
    const city = searchParams.get("city");

    const conditions = [];

    if (specialty) {
      conditions.push(
        like(professionalProfiles.specialization, `%${specialty}%`)
      );
    }

    if (city) {
      conditions.push(
        like(userProfiles.city, `%${city}%`)
      );
    }

    const professionals = await db
      .select({
        id: professionalProfiles.userId,
        name: user.name,
        specialization: professionalProfiles.specialization,
        bio: professionalProfiles.bio,
        yearsOfExperience: professionalProfiles.yearsOfExperience,
        consultationFee: professionalProfiles.consultationFee,
        profilePhotoUrl: professionalProfiles.profilePhotoUrl,
        isVerified: professionalProfiles.isVerified,
        city: userProfiles.city,
      })
      .from(professionalProfiles)
      .innerJoin(user, eq(professionalProfiles.userId, user.id))
      .leftJoin(userProfiles, eq(professionalProfiles.userId, userProfiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error("Error searching professionals:", error);
    return NextResponse.json(
      { error: "Failed to search professionals" },
      { status: 500 }
    );
  }
}
