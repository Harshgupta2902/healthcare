'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const profileSchema = z.object({
    specialization: z.string().min(1),
    licenseNumber: z.string().min(1),
    bio: z.string().optional().nullable(),
    yearsOfExperience: z.number().optional().nullable(),
    consultationFee: z.number().optional().nullable(),
    phone: z.string().optional().nullable(),
    profilePhotoUrl: z.string().optional().nullable(),
})

const qualificationSchema = z.object({
    degree: z.string().min(1),
    institution: z.string().min(1),
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
