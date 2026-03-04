'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const profileSchema = z.object({
    specialization: z.string().min(1, "Specialization is required").regex(/^[a-zA-Z\s]*$/, "Specialization must contain only letters"),
    licenseNumber: z.string().min(1, "License number is required").regex(/^[a-zA-Z0-9]*$/, "License number must be alphanumeric"),
    bio: z.string().optional().nullable(),
    yearsOfExperience: z.number().optional().nullable(),
    consultationFee: z.number().optional().nullable(),
    phone: z.string().regex(/^\d*$/, "Phone must contain only numbers").optional().nullable(),
    profilePhotoUrl: z.string().optional().nullable(),
})

const qualificationSchema = z.object({
    degree: z.string().min(1, "Degree is required").regex(/^[a-zA-Z\s\.]*$/, "Degree contains invalid characters"),
    institution: z.string().min(1, "Institution is required").regex(/^[a-zA-Z\s\.]*$/, "Institution contains invalid characters"),
    year: z.number().optional().nullable(),
    documentUrl: z.string().optional().nullable(),
})

const availabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    isAvailable: z.boolean().default(true),
})

export async function updateProfessionalProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = profileSchema.parse(data)

    const { error } = await supabase
        .from('professional_profiles')
        .upsert({
            user_id: user.id,
            specialization: validatedData.specialization,
            license_number: validatedData.licenseNumber,
            bio: validatedData.bio,
            years_of_experience: validatedData.yearsOfExperience,
            consultation_fee: validatedData.consultationFee,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    // Sync with users table
    await supabase.from('users').update({
        phone: validatedData.phone,
        image: validatedData.profilePhotoUrl
    }).eq('id', user.id)

    return { success: true }
}

export async function addQualification(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = qualificationSchema.parse(data)

    const { error } = await supabase
        .from('professional_qualifications')
        .insert({
            professional_id: user.id,
            degree: validatedData.degree,
            institution: validatedData.institution,
            year: validatedData.year,
            document_url: validatedData.documentUrl,
        })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteQualification(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('professional_qualifications')
        .delete()
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function updateAvailability(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = availabilitySchema.parse(data)

    const { error } = await supabase
        .from('professional_availability')
        .upsert({
            professional_id: user.id,
            day_of_week: validatedData.dayOfWeek,
            start_time: validatedData.startTime,
            end_time: validatedData.endTime,
            is_available: validatedData.isAvailable,
            updated_at: new Date().toISOString(),
        })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteAvailability(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('professional_availability')
        .delete()
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function updateConsultationRequestStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('consultation_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function getProfessionalDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const [
        { data: coreProfile },
        { data: profProfile },
        { data: qualifications },
        { data: availability },
        { data: appointments },
        { data: requests },
        { data: payments }
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('professional_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('professional_qualifications').select('*').eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('professional_availability').select('*').eq('professional_id', user.id).order('day_of_week', { ascending: true }),
        supabase.from('appointments').select(`*, client:users!appointments_client_id_fkey(name, email)`).eq('professional_id', user.id).order('start_time', { ascending: true }),
        supabase.from('consultation_requests').select(`*, client:users!consultation_requests_client_id_fkey(name, email)`).eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payments').select(`*, client:users!payments_client_id_fkey(name)`).eq('professional_id', user.id).order('created_at', { ascending: false })
    ])

    return {
        user,
        profile: {
            id: profProfile?.id || "",
            userId: user.id,
            specialization: profProfile?.specialization || "",
            licenseNumber: profProfile?.license_number || "",
            bio: profProfile?.bio || null,
            yearsOfExperience: profProfile?.years_of_experience || null,
            consultationFee: profProfile?.consultation_fee || null,
            isVerified: profProfile?.is_verified || false,
            phone: coreProfile?.phone || null,
            profilePhotoUrl: coreProfile?.image || null,
            createdAt: profProfile?.created_at || "",
            updatedAt: profProfile?.updated_at || ""
        },
        qualifications: qualifications?.map(q => ({
            id: q.id,
            professionalId: q.professional_id,
            degree: q.degree,
            institution: q.institution,
            year: q.year,
            documentUrl: q.document_url,
            createdAt: q.created_at
        })) || [],
        availability: availability?.map(a => ({
            id: a.id,
            professionalId: a.professional_id,
            dayOfWeek: a.day_of_week,
            startTime: a.start_time,
            endTime: a.end_time,
            isAvailable: a.is_available
        })) || [],
        appointments: appointments?.map((apt: any) => ({
            id: apt.id,
            clientId: apt.client_id,
            professionalId: apt.professional_id,
            appointmentType: apt.appointment_type,
            status: apt.status,
            startTime: apt.start_time,
            endTime: apt.end_time,
            notes: apt.notes,
            meetingUrl: apt.meeting_url,
            clientName: apt.client?.name,
            clientEmail: apt.client?.email,
            createdAt: apt.created_at
        })) || [],
        consultationRequests: requests?.map((req: any) => ({
            id: req.id,
            clientId: req.client_id,
            professionalId: req.professional_id,
            requestType: req.request_type,
            status: req.status,
            message: req.message,
            preferredDate: req.preferred_date,
            preferredTime: req.preferred_time,
            clientName: req.client?.name,
            clientEmail: req.client?.email,
            createdAt: req.created_at
        })) || [],
        payments: payments?.map((pay: any) => ({
            id: pay.id,
            clientId: pay.client_id,
            professionalId: pay.professional_id,
            amount: pay.amount,
            status: pay.status,
            paymentMethod: pay.payment_method,
            transactionId: pay.transaction_id,
            createdAt: pay.created_at,
            clientName: pay.client?.name
        })) || []
    }
}

export async function searchProfessionals(specialty?: string, city?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('professional_profiles')
        .select(`
            user_id,
            specialization,
            bio,
            years_of_experience,
            consultation_fee,
            is_verified,
            users!inner (
                name,
                image
            ),
            client_medical_profiles (
                city
            )
        `);

    if (specialty) {
        query = query.ilike('specialization', `%${specialty}%`);
    }

    if (city) {
        query = query.ilike('client_medical_profiles.city', `%${city}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data || []).map((p: any) => ({
        id: p.user_id,
        name: p.users?.name,
        specialization: p.specialization,
        bio: p.bio,
        yearsOfExperience: p.years_of_experience,
        consultationFee: p.consultation_fee,
        isVerified: p.is_verified,
        city: p.client_medical_profiles?.city,
        profilePhotoUrl: p.users?.image || null,
    }));
}
