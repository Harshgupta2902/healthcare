import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email is provided
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'EMAIL_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, sanitizedEmail))
      .limit(1);

    if (existingSubscriber.length > 0) {
      return NextResponse.json(
        { 
          error: 'This email is already subscribed',
          code: 'DUPLICATE_EMAIL'
        },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const newSubscriber = await db
      .insert(newsletterSubscribers)
      .values({
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
        status: 'active'
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriber: newSubscriber[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}