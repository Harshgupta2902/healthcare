import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalDocuments, session } from '@/db/schema';
import { eq, desc, and, gt } from 'drizzle-orm';

async function getUserFromSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const sessions = await db.select()
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

    return { id: sessions[0].userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const documentType = searchParams.get('documentType');

    let query = db.select()
      .from(medicalDocuments)
      .where(eq(medicalDocuments.userId, user.id))
      .orderBy(desc(medicalDocuments.uploadDate));

    if (documentType) {
      query = db.select()
        .from(medicalDocuments)
        .where(
          and(
            eq(medicalDocuments.userId, user.id),
            eq(medicalDocuments.documentType, documentType)
          )
        )
        .orderBy(desc(medicalDocuments.uploadDate));
    }

    const documents = await query.limit(limit).offset(offset);

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { documentName, documentType, fileUrl, fileSize, uploadDate, notes } = body;

    if (!documentName || documentName.trim() === '') {
      return NextResponse.json({ 
        error: "Document name is required",
        code: "MISSING_DOCUMENT_NAME" 
      }, { status: 400 });
    }

    if (!documentType || documentType.trim() === '') {
      return NextResponse.json({ 
        error: "Document type is required",
        code: "MISSING_DOCUMENT_TYPE" 
      }, { status: 400 });
    }

    if (!fileUrl || fileUrl.trim() === '') {
      return NextResponse.json({ 
        error: "File URL is required",
        code: "MISSING_FILE_URL" 
      }, { status: 400 });
    }

    if (!uploadDate || uploadDate.trim() === '') {
      return NextResponse.json({ 
        error: "Upload date is required",
        code: "MISSING_UPLOAD_DATE" 
      }, { status: 400 });
    }

    const validDocumentTypes = ['report', 'prescription', 'scan', 'xray', 'other'];
    if (!validDocumentTypes.includes(documentType.toLowerCase())) {
      return NextResponse.json({ 
        error: "Document type must be one of: report, prescription, scan, xray, other",
        code: "INVALID_DOCUMENT_TYPE" 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const newDocument = await db.insert(medicalDocuments)
      .values({
        userId: user.id,
        documentName: documentName.trim(),
        documentType: documentType.toLowerCase().trim(),
        fileUrl: fileUrl.trim(),
        fileSize: fileSize || null,
        uploadDate: uploadDate.trim(),
        notes: notes?.trim() || null,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}