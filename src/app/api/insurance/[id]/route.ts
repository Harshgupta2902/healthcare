import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { insurance, session } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromSession(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const deletedCount = await db.delete(insurance)
      .where(
        and(
          eq(insurance.id, id),
          eq(insurance.userId, userId)
        )
      );

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
