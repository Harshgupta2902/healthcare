import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !sessionUser) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { data: appointments, error: queryError } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        professional_id,
        appointment_type,
        status,
        start_time,
        end_time,
        notes,
        meeting_url,
        created_at,
        updated_at,
        client:users (
          name,
          email
        )
      `)
      .eq('professional_id', sessionUser.id);

    if (queryError) throw queryError;

    const mappedAppointments = (appointments || []).map((app: any) => ({
      id: app.id,
      clientId: app.client_id,
      professionalId: app.professional_id,
      appointmentType: app.appointment_type,
      status: app.status,
      startTime: app.start_time,
      endTime: app.end_time,
      notes: app.notes,
      meetingUrl: app.meeting_url,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      clientName: app.client?.name,
      clientEmail: app.client?.email
    }));

    return NextResponse.json(mappedAppointments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

