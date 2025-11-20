import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalHistory, session } from '@/db/schema';
import { eq, desc, and, gt } from 'drizzle-orm';

async function getUserFromSession(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const sessionRecord = await db.select()
      .from(session)
      .where(
        and(
          eq(session.token, token),
          gt(session.expiresAt, new Date())
        )
      )
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    return sessionRecord[0].userId;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromSession(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const statusFilter = searchParams.get('status');

    let query = db.select()
      .from(medicalHistory)
      .where(eq(medicalHistory.userId, userId))
      .orderBy(desc(medicalHistory.diagnosisDate))
      .limit(limit)
      .offset(offset);

    if (statusFilter) {
      query = db.select()
        .from(medicalHistory)
        .where(
          and(
            eq(medicalHistory.userId, userId),
            eq(medicalHistory.status, statusFilter)
          )
        )
        .orderBy(desc(medicalHistory.diagnosisDate))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;

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
    const userId = await getUserFromSession(request);
    
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
          code: 'USER_ID_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    const { conditionName, diagnosisDate, status, notes } = body;

    if (!conditionName || typeof conditionName !== 'string' || conditionName.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Condition name is required and must not be empty',
          code: 'MISSING_CONDITION_NAME' 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newEntry = await db.insert(medicalHistory)
      .values({
        userId,
        conditionName: conditionName.trim(),
        diagnosisDate: diagnosisDate || null,
        status: status || 'active',
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}