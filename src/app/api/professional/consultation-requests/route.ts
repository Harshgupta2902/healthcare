import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Assuming consultation_requests table exists and has client_id, professional_id
  // We join with profiles to get client information
  const { data, error } = await supabase
    .from('consultation_requests')
    .select(`
      *,
      client:users!consultation_requests_client_id_fkey (
        name,
        email:id
      )
    `)
    .eq('professional_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the response to match the expected format
  const formattedRequests = data.map(req => ({
    ...req,
    clientName: req.client?.name,
    clientEmail: req.client?.email, // Note: email is in profiles? Or auth? Profiles might not have email.
  }));

  return NextResponse.json(formattedRequests);
}
