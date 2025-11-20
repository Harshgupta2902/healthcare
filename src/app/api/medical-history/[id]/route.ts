import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalHistory, session } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

async function getUserFromSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessions = await db.select()
      .from(session)
      .where(and(
        eq(session.token, token),
        gt(session.expiresAt, new Date())
      ))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    return { userId: sessions[0].userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();

    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const existingRecord = await db.select()
      .from(medicalHistory)
      .where(eq(medicalHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Medical history entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingRecord[0].userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this record', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { conditionName, diagnosisDate, status, notes } = requestBody;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (conditionName !== undefined) {
      if (typeof conditionName !== 'string' || conditionName.trim() === '') {
        return NextResponse.json(
          { error: 'Condition name must be a non-empty string', code: 'INVALID_CONDITION_NAME' },
          { status: 400 }
        );
      }
      updates.conditionName = conditionName.trim();
    }

    if (diagnosisDate !== undefined) {
      updates.diagnosisDate = diagnosisDate;
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || status.trim() === '') {
        return NextResponse.json(
          { error: 'Status must be a non-empty string', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status.trim();
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    const updated = await db.update(medicalHistory)
      .set(updates)
      .where(and(
        eq(medicalHistory.id, parseInt(id)),
        eq(medicalHistory.userId, user.userId)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update medical history entry', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRecord = await db.select()
      .from(medicalHistory)
      .where(eq(medicalHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Medical history entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingRecord[0].userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this record', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const deleted = await db.delete(medicalHistory)
      .where(and(
        eq(medicalHistory.id, parseInt(id)),
        eq(medicalHistory.userId, user.userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete medical history entry', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Medical history entry deleted successfully',
        deletedRecord: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}