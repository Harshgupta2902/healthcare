import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { insurance, session } from '@/db/schema';
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

    const results = await db.select()
      .from(insurance)
      .where(eq(insurance.userId, userId))
      .orderBy(desc(insurance.createdAt));

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

    const { 
      providerName, 
      policyNumber, 
      groupNumber, 
      policyHolderName, 
      relationshipToHolder, 
      expirationDate, 
      notes 
    } = body;

    if (!providerName || !policyNumber || !policyHolderName) {
      return NextResponse.json(
        { 
          error: 'Provider name, policy number, and policy holder name are required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newEntry = await db.insert(insurance)
      .values({
        userId,
        providerName: providerName.trim(),
        policyNumber: policyNumber.trim(),
        groupNumber: groupNumber?.trim() || null,
        policyHolderName: policyHolderName.trim(),
        relationshipToHolder: relationshipToHolder?.trim() || null,
        expirationDate: expirationDate || null,
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
