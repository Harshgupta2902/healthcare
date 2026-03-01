import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { data: availability, error: selectError } = await supabase
      .from('professional_availability')
      .select('*')
      .eq('professional_id', user.id);

    if (selectError) throw selectError;

    return NextResponse.json(availability, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isAvailable } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({
        error: 'Day of week, start time, and end time are required',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const { data: newAvailability, error: insertError } = await supabase
      .from('professional_availability')
      .insert({
        professional_id: user.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable ?? true,
        created_at: currentTimestamp,
        updated_at: currentTimestamp
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(newAvailability, { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

