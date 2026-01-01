import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { professionalAvailability, session } from '@/db/schema';
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

    const availability = await db.select()
      .from(professionalAvailability)
      .where(eq(professionalAvailability.professionalId, user.userId));

    return NextResponse.json(availability, { status: 200 });
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

    const { dayOfWeek, startTime, endTime, isAvailable } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Day of week, start time, and end time are required',
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const newAvailability = await db.insert(professionalAvailability)
      .values({
        professionalId: user.userId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .returning();

    return NextResponse.json(newAvailability[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
