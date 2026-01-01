import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { professionalProfiles, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, user.userId))
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

    const {
      specialization,
      licenseNumber,
      bio,
      yearsOfExperience,
      consultationFee,
      phone,
      profilePhotoUrl
    } = body;

    if (!specialization || !licenseNumber) {
      return NextResponse.json({ 
        error: 'Specialization and license number are required',
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    const existingProfile = await db.select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, user.userId))
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingProfile.length > 0) {
      const updated = await db.update(professionalProfiles)
        .set({
          specialization,
          licenseNumber,
          bio: bio ?? existingProfile[0].bio,
          yearsOfExperience: yearsOfExperience ?? existingProfile[0].yearsOfExperience,
          consultationFee: consultationFee ?? existingProfile[0].consultationFee,
          phone: phone ?? existingProfile[0].phone,
          profilePhotoUrl: profilePhotoUrl ?? existingProfile[0].profilePhotoUrl,
          updatedAt: currentTimestamp
        })
        .where(eq(professionalProfiles.userId, user.userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      const newProfile = await db.insert(professionalProfiles)
        .values({
          userId: user.userId,
          specialization,
          licenseNumber,
          bio: bio ?? null,
          yearsOfExperience: yearsOfExperience ?? null,
          consultationFee: consultationFee ?? null,
          phone: phone ?? null,
          profilePhotoUrl: profilePhotoUrl ?? null,
          isVerified: false,
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
