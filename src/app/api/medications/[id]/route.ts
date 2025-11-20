import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications, session } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
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

    return sessionRecord[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await authenticateRequest(request);
    
    if (!userSession) {
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

    const medicationId = parseInt(id);

    const existingMedication = await db.select()
      .from(medications)
      .where(eq(medications.id, medicationId))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingMedication[0].userId !== userSession.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this medication', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
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
      isActive
    } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (medicationName !== undefined) updateData.medicationName = medicationName;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (prescribingDoctor !== undefined) updateData.prescribingDoctor = prescribingDoctor;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedMedication = await db.update(medications)
      .set(updateData)
      .where(
        and(
          eq(medications.id, medicationId),
          eq(medications.userId, userSession.userId)
        )
      )
      .returning();

    if (updatedMedication.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update medication', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMedication[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await authenticateRequest(request);
    
    if (!userSession) {
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

    const medicationId = parseInt(id);

    const existingMedication = await db.select()
      .from(medications)
      .where(eq(medications.id, medicationId))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingMedication[0].userId !== userSession.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this medication', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const deletedMedication = await db.delete(medications)
      .where(
        and(
          eq(medications.id, medicationId),
          eq(medications.userId, userSession.userId)
        )
      )
      .returning();

    if (deletedMedication.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete medication', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Medication deleted successfully',
        deletedMedication: deletedMedication[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}