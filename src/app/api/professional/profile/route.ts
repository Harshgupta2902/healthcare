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

    const { data: profile, error: profileError } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
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

    const {
      specialization,
      licenseNumber,
      bio,
      yearsOfExperience,
      consultationFee,
      phone,
      profilePhotoUrl
    } = body;

    if (!specialization || !licenseNumber) {
      return NextResponse.json({
        error: 'Specialization and license number are required',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const { data: existingProfile, error: profileError } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      const { data: updated, error: updateError } = await supabase
        .from('professional_profiles')
        .update({
          specialization,
          licenseNumber,
          bio: bio ?? existingProfile.bio,
          years_of_experience: yearsOfExperience ?? existingProfile.years_of_experience,
          consultation_fee: consultationFee ?? existingProfile.consultation_fee,
          // phone: phone ?? existingProfile.phone, // profile table handles individual fields
          updated_at: currentTimestamp
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json(updated, { status: 200 });
    } else {
      const { data: newProfile, error: insertError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: user.id,
          specialization,
          license_number: licenseNumber,
          bio: bio ?? null,
          years_of_experience: yearsOfExperience ?? null,
          consultation_fee: consultationFee ?? null,
          is_verified: false,
          created_at: currentTimestamp,
          updated_at: currentTimestamp
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return NextResponse.json(newProfile, { status: 200 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

