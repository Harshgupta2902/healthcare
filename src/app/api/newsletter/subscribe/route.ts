import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        {
          error: 'This email is already subscribed',
          code: 'DUPLICATE_EMAIL'
        },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: sanitizedEmail,
        subscribed_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriber: newSubscriber
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