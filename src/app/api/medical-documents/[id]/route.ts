import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalDocuments, session } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate session token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify session and get userId
    const userSession = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.token, token),
          gt(session.expiresAt, new Date())
        )
      )
      .limit(1);

    if (userSession.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const userId = userSession[0].userId;

    // Validate ID parameter
    const { id } = params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const documentId = parseInt(id);

    // Check if document exists and belongs to user
    const existingDocument = await db
      .select()
      .from(medicalDocuments)
      .where(eq(medicalDocuments.id, documentId))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json(
        { error: 'Medical document not found', code: 'DOCUMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingDocument[0].userId !== userId) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access to this document', 
          code: 'FORBIDDEN_ACCESS' 
        },
        { status: 403 }
      );
    }

    // Delete the document
    const deleted = await db
      .delete(medicalDocuments)
      .where(
        and(
          eq(medicalDocuments.id, documentId),
          eq(medicalDocuments.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete document', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Medical document deleted successfully',
        documentName: deleted[0].documentName,
        deletedDocument: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE medical document error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}