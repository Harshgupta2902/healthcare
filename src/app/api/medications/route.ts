import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications, session } from '@/db/schema';
import { eq, desc, and, gt } from 'drizzle-orm';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessions = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.token, token),
          gt(session.expiresAt, new Date())
        )
      )
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    return sessions[0].userId;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const isActiveParam = searchParams.get('isActive');

    let query = db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.startDate));

    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      query = db
        .select()
        .from(medications)
        .where(
          and(
            eq(medications.userId, userId),
            eq(medications.isActive, isActive)
          )
        )
        .orderBy(desc(medications.startDate));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const {
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      prescribingDoctor,
      notes,
      isActive,
    } = body;

    if (!medicationName) {
      return NextResponse.json(
        {
          error: 'Medication name is required',
          code: 'MISSING_MEDICATION_NAME',
        },
        { status: 400 }
      );
    }

    if (!dosage) {
      return NextResponse.json(
        { error: 'Dosage is required', code: 'MISSING_DOSAGE' },
        { status: 400 }
      );
    }

    if (!frequency) {
      return NextResponse.json(
        { error: 'Frequency is required', code: 'MISSING_FREQUENCY' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newMedication = await db
      .insert(medications)
      .values({
        userId,
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        startDate: startDate.trim(),
        endDate: endDate ? endDate.trim() : null,
        prescribingDoctor: prescribingDoctor ? prescribingDoctor.trim() : null,
        notes: notes ? notes.trim() : null,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newMedication[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}