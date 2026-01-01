import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { professionalQualifications, session } from '@/db/schema';
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

    const qualifications = await db.select()
      .from(professionalQualifications)
      .where(eq(professionalQualifications.professionalId, user.userId));

    return NextResponse.json(qualifications, { status: 200 });
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

    const { degree, institution, year, documentUrl } = body;

    if (!degree || !institution) {
      return NextResponse.json({ 
        error: 'Degree and institution are required',
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const newQualification = await db.insert(professionalQualifications)
      .values({
        professionalId: user.userId,
        degree,
        institution,
        year: year ?? null,
        documentUrl: documentUrl ?? null,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .returning();

    return NextResponse.json(newQualification[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
