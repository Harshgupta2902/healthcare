import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, session, user } from '@/db/schema';
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
    const sessionUser = await getSessionUser(request);
    
    if (!sessionUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const professionalAppointments = await db.select({
      id: appointments.id,
      clientId: appointments.clientId,
      professionalId: appointments.professionalId,
      appointmentType: appointments.appointmentType,
      status: appointments.status,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      notes: appointments.notes,
      meetingUrl: appointments.meetingUrl,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      clientName: user.name,
      clientEmail: user.email
    })
      .from(appointments)
      .leftJoin(user, eq(appointments.clientId, user.id))
      .where(eq(appointments.professionalId, sessionUser.userId));

    return NextResponse.json(professionalAppointments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
