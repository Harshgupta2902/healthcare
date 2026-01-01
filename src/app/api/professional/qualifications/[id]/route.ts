import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { professionalQualifications, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const qualificationId = parseInt(id);

    if (isNaN(qualificationId)) {
      return NextResponse.json({ 
        error: 'Invalid qualification ID',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const qualification = await db.select()
      .from(professionalQualifications)
      .where(and(
        eq(professionalQualifications.id, qualificationId),
        eq(professionalQualifications.professionalId, user.userId)
      ))
      .limit(1);

    if (qualification.length === 0) {
      return NextResponse.json({ 
        error: 'Qualification not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    await db.delete(professionalQualifications)
      .where(eq(professionalQualifications.id, qualificationId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
