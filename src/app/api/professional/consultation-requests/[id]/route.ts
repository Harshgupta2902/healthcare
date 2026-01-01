import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { consultationRequests, session } from '@/db/schema';
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

export async function PATCH(
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json({ 
        error: 'Invalid request ID',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ 
        error: 'Status is required',
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    const consultationRequest = await db.select()
      .from(consultationRequests)
      .where(and(
        eq(consultationRequests.id, requestId),
        eq(consultationRequests.professionalId, user.userId)
      ))
      .limit(1);

    if (consultationRequest.length === 0) {
      return NextResponse.json({ 
        error: 'Request not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const currentTimestamp = new Date().toISOString();

    const updated = await db.update(consultationRequests)
      .set({
        status,
        updatedAt: currentTimestamp
      })
      .where(eq(consultationRequests.id, requestId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
