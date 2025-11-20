import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles, session } from '@/db/schema';
import { eq, gt } from 'drizzle-orm';

async function getSessionUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessions = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];
    
    if (new Date(userSession.expiresAt) <= new Date()) {
      return null;
    }

    return { userId: userSession.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const {
      phone,
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      address,
      city,
      state,
      postalCode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      profilePhotoUrl
    } = body;

    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.userId))
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingProfile.length > 0) {
      const updated = await db.update(userProfiles)
        .set({
          phone: phone ?? existingProfile[0].phone,
          dateOfBirth: dateOfBirth ?? existingProfile[0].dateOfBirth,
          gender: gender ?? existingProfile[0].gender,
          bloodType: bloodType ?? existingProfile[0].bloodType,
          height: height ?? existingProfile[0].height,
          weight: weight ?? existingProfile[0].weight,
          address: address ?? existingProfile[0].address,
          city: city ?? existingProfile[0].city,
          state: state ?? existingProfile[0].state,
          postalCode: postalCode ?? existingProfile[0].postalCode,
          emergencyContactName: emergencyContactName ?? existingProfile[0].emergencyContactName,
          emergencyContactPhone: emergencyContactPhone ?? existingProfile[0].emergencyContactPhone,
          emergencyContactRelationship: emergencyContactRelationship ?? existingProfile[0].emergencyContactRelationship,
          profilePhotoUrl: profilePhotoUrl ?? existingProfile[0].profilePhotoUrl,
          updatedAt: currentTimestamp
        })
        .where(eq(userProfiles.userId, user.userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      const newProfile = await db.insert(userProfiles)
        .values({
          userId: user.userId,
          phone: phone ?? null,
          dateOfBirth: dateOfBirth ?? null,
          gender: gender ?? null,
          bloodType: bloodType ?? null,
          height: height ?? null,
          weight: weight ?? null,
          address: address ?? null,
          city: city ?? null,
          state: state ?? null,
          postalCode: postalCode ?? null,
          emergencyContactName: emergencyContactName ?? null,
          emergencyContactPhone: emergencyContactPhone ?? null,
          emergencyContactRelationship: emergencyContactRelationship ?? null,
          profilePhotoUrl: profilePhotoUrl ?? null,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 200 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}