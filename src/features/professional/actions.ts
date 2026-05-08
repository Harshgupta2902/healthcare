'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { zodFirstError } from '@/lib/server-action-result'
import { syncUserSession } from '@/features/profile/actions'
import { formatProfessionalDisplayName, PROFESSIONAL_NAME_TITLES_ZOD } from '@/lib/professional-name-title'
import {
    combineInternationalPhone,
    DEFAULT_PHONE_COUNTRY_CODE,
    getPhoneCountryOptionForValidation,
    isKnownPhoneCountryDial,
    normalizePhoneCountryCode,
} from '@/lib/phone-country-options'
import { getUniversitiesNames, searchUniversityNames } from '@/lib/universities-gist'
import { recordProfessionalActivity, weekdayLong } from '@/lib/admin-notifications'
import type { FieldChange } from '@/lib/admin-notifications'

const profileSchema = z
    .object({
        specialization: z.string().min(1, "Specialization is required").regex(/^[a-zA-Z\s]*$/, "Specialization must contain only letters"),
        licenseNumber: z.string().min(1, "License number is required").max(200, "License number is too long"),
        bio: z.string().optional().nullable(),
        nameTitle: z.enum(PROFESSIONAL_NAME_TITLES_ZOD).optional().nullable(),
        yearsOfExperience: z.number().optional().nullable(),
        consultationFee: z.number().optional().nullable(),
        phoneCountryCode: z.string().optional().nullable(),
        phoneCountryIso: z.string().length(2).optional().nullable(),
        phone: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        profilePhotoUrl: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
        const national = (data.phone ?? '').replace(/\D/g, '')
        const code = normalizePhoneCountryCode(data.phoneCountryCode ?? undefined)
        if (national.length > 0 && !code) {
            ctx.addIssue({
                code: 'custom',
                message: 'Select a country code for your phone number.',
                path: ['phoneCountryCode'],
            })
        }
        if (national.length > 0 && code && !isKnownPhoneCountryDial(code)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Invalid country calling code.',
                path: ['phoneCountryCode'],
            })
        } else if (national.length > 0 && code && isKnownPhoneCountryDial(code)) {
            const opt = getPhoneCountryOptionForValidation(code, data.phoneCountryIso ?? undefined)
            if (opt && (national.length < opt.minLength || national.length > opt.maxLength)) {
                const lenMsg =
                    opt.minLength === opt.maxLength
                        ? `Phone number must be ${opt.minLength} digits for ${opt.name}.`
                        : `Phone number must be ${opt.minLength}–${opt.maxLength} digits for ${opt.name}.`
                ctx.addIssue({
                    code: 'custom',
                    message: lenMsg,
                    path: ['phone'],
                })
            }
        }
    })

const qualificationSchema = z.object({
    degree: z.string().min(1, "Degree is required").max(500),
    institution: z.string().min(1, "Institution is required").max(500),
    year: z.number().int().min(1900).max(2100).optional().nullable(),
    documentUrl: z.string().url("Invalid document URL"),
})

export type SanitizedQualificationRow = {
    id: string
    professionalId: string
    degree: string
    institution: string
    year: number | null
    /** True when a file was uploaded (URL is hidden until approved). */
    hasVerificationDocument: boolean
    documentUrl: string | null
    documentApproved: boolean | null
    createdAt: string
}

function mapQualificationForProfessionalSelf(q: {
    id: string
    professional_id: string
    degree: string
    institution: string
    year: number | null
    document_url: string | null
    document_approved: boolean | null
    created_at: string
}): SanitizedQualificationRow {
    return {
        id: q.id,
        professionalId: q.professional_id,
        degree: q.degree,
        institution: q.institution,
        year: q.year,
        hasVerificationDocument: Boolean(q.document_url),
        documentUrl: q.document_approved === true ? q.document_url : null,
        documentApproved: q.document_approved ?? null,
        createdAt: q.created_at,
    }
}

const availabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    isAvailable: z.boolean().default(true),
})

export async function updateProfessionalProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in to update your profile.' }

    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const validatedData = parsed.data

    const { data: priorCore } = await supabase
        .from('users')
        .select('name, phone, phone_country_code, image, role')
        .eq('id', user.id)
        .single()

    const { data: priorProf } = await supabase
        .from('professional_profiles')
        .select('specialization, license_number, bio, name_title, years_of_experience, consultation_fee, city')
        .eq('user_id', user.id)
        .maybeSingle()

    const { error } = await supabase
        .from('professional_profiles')
        .upsert({
            user_id: user.id,
            specialization: validatedData.specialization,
            license_number: validatedData.licenseNumber,
            bio: validatedData.bio,
            name_title: validatedData.nameTitle ?? null,
            years_of_experience: validatedData.yearsOfExperience,
            consultation_fee: validatedData.consultationFee,
            city: validatedData.city,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) return { success: false as const, error: error.message }

    const nationalDigits = (validatedData.phone ?? '').replace(/\D/g, '') || null
    let dial = normalizePhoneCountryCode(validatedData.phoneCountryCode ?? undefined)
    if (nationalDigits && !dial) dial = DEFAULT_PHONE_COUNTRY_CODE

    await supabase.from('users').update({
        phone: nationalDigits,
        phone_country_code: dial,
        image: validatedData.profilePhotoUrl,
        updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    const { data: row } = await supabase.from('users').select('name, image').eq('id', user.id).single()
    await supabase.auth.updateUser({
        data: {
            name: row?.name ?? undefined,
            image: row?.image ?? undefined,
            name_title: validatedData.nameTitle ?? undefined,
        },
    })
    await syncUserSession()

    const eqStr = (a: unknown, b: unknown) => String(a ?? '').trim() === String(b ?? '').trim()
    const eqNum = (a: unknown, b: unknown) => (a ?? null) === (b ?? null)

    const oldPhone = [priorCore?.phone_country_code, priorCore?.phone].filter(Boolean).join(' ').trim() || '—'
    const newPhone = [dial, nationalDigits].filter(Boolean).join(' ').trim() || '—'

    const profileChanges: FieldChange[] = []
    if (!eqStr(priorProf?.specialization, validatedData.specialization)) {
        profileChanges.push({ label: 'specialization', from: priorProf?.specialization, to: validatedData.specialization })
    }
    if (!eqStr(priorProf?.license_number, validatedData.licenseNumber)) {
        profileChanges.push({ label: 'license number', from: priorProf?.license_number, to: validatedData.licenseNumber })
    }
    if (!eqStr(priorProf?.bio ?? '', validatedData.bio ?? '')) {
        profileChanges.push({ label: 'bio', from: priorProf?.bio, to: validatedData.bio })
    }
    if (!eqStr(priorProf?.name_title, validatedData.nameTitle ?? null)) {
        profileChanges.push({ label: 'name title (salutation)', from: priorProf?.name_title, to: validatedData.nameTitle })
    }
    if (!eqNum(priorProf?.years_of_experience, validatedData.yearsOfExperience)) {
        profileChanges.push({ label: 'years of experience', from: priorProf?.years_of_experience, to: validatedData.yearsOfExperience })
    }
    if (!eqNum(priorProf?.consultation_fee, validatedData.consultationFee)) {
        profileChanges.push({ label: 'consultation fee', from: priorProf?.consultation_fee, to: validatedData.consultationFee })
    }
    if (!eqStr(priorProf?.city, validatedData.city)) {
        profileChanges.push({ label: 'city', from: priorProf?.city, to: validatedData.city })
    }
    if (oldPhone !== newPhone) {
        profileChanges.push({ label: 'phone', from: oldPhone, to: newPhone })
    }
    const newImage = validatedData.profilePhotoUrl ?? null
    if (!eqStr(priorCore?.image, newImage)) {
        profileChanges.push({ label: 'profile photo URL', from: priorCore?.image ? 'set' : '—', to: newImage ? 'updated' : 'cleared' })
    }

    const actorNameForFallback = (priorCore?.name || 'User').trim() || 'User'
    await recordProfessionalActivity(supabase, {
        actorUserId: user.id,
        type: 'professional.profile_updated',
        title: priorCore?.role === 'professional' ? 'Professional: profile updated' : 'User: profile updated',
        changes: profileChanges,
        body:
            profileChanges.length > 0
                ? undefined
                : `${actorNameForFallback} saved their professional profile (no field differences detected).`,
        metadata: { section: 'profile' },
    })

    return { success: true as const }
}

export type AddQualificationResult =
    | { success: true; documentUrl: string }
    | { success: false; error: string }

const searchUniversitiesInputSchema = z.object({
    query: z.string().min(2).max(200),
})

export type SearchUniversitiesResult =
    | { success: true; results: string[] }
    | { success: false; error: string; results: [] }

/**
 * Search issuing institutions against the public universities gist (cached on the server).
 * Clients can still submit any institution string if nothing matches.
 */
export async function searchUniversities(input: unknown): Promise<SearchUniversitiesResult> {
    const parsed = searchUniversitiesInputSchema.safeParse(input)
    if (!parsed.success) {
        return { success: false, error: 'Enter at least 2 characters to search.', results: [] }
    }
    try {
        const names = await getUniversitiesNames()
        const results = searchUniversityNames(names, parsed.data.query)
        return { success: true, results }
    } catch (e) {
        console.error('[searchUniversities] error', e)
        return {
            success: false,
            error: 'Could not load the institution directory. You can still type the name manually.',
            results: [],
        }
    }
}

/**
 * Adds a qualification using Supabase Storage (works on serverless).
 * Returns `{ success, error }` instead of throwing so production clients get real messages
 * (Next.js omits thrown Server Action messages in production builds).
 */
export async function addQualification(formData: FormData): Promise<AddQualificationResult> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to add a credential.' }
        }

        const file = formData.get('file') as File
        const degree = (formData.get('degree') as string)?.trim()
        const institution = (formData.get('institution') as string)?.trim()
        const yearRaw = (formData.get('year') as string)?.trim()

        if (!file || file.size === 0 || !degree || !institution) {
            return { success: false, error: 'Please fill all required fields and attach a verification document.' }
        }

        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: 'File is too large (maximum 10 MB).' }
        }

        let year: number | null = null
        if (yearRaw) {
            const y = parseInt(yearRaw, 10)
            if (!Number.isFinite(y) || y < 1900 || y > 2100) {
                return { success: false, error: 'Please enter a valid year between 1900 and 2100.' }
            }
            year = y
        }

        const isImage = file.type.startsWith('image/')
        let uploadBody: Buffer | ArrayBuffer = await file.arrayBuffer()
        let contentType = file.type || 'application/octet-stream'
        let ext = path.extname(file.name) || (isImage ? '.jpg' : '.bin')

        if (isImage) {
            try {
                const buffer = Buffer.from(uploadBody as ArrayBuffer)
                uploadBody = await sharp(buffer)
                    .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 85 })
                    .toBuffer()
                contentType = 'image/webp'
                ext = '.webp'
            } catch {
                uploadBody = await file.arrayBuffer()
            }
        }

        const storageFileName = `${crypto.randomBytes(16).toString('hex')}${ext}`
        const storagePath = `${user.id}/${storageFileName}`

        const { error: uploadError } = await supabase.storage
            .from('qualifications')
            .upload(storagePath, uploadBody, {
                contentType,
                upsert: false,
            })

        if (uploadError) {
            console.error('Qualification storage upload failed:', uploadError)
            return { success: false, error: uploadError.message }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('qualifications')
            .getPublicUrl(storagePath)

        const parsed = qualificationSchema.safeParse({
            degree,
            institution,
            year,
            documentUrl: publicUrl,
        })

        if (!parsed.success) {
            await supabase.storage.from('qualifications').remove([storagePath])
            const msg = parsed.error.flatten().fieldErrors.degree?.[0]
                ?? parsed.error.flatten().fieldErrors.institution?.[0]
                ?? parsed.error.flatten().fieldErrors.year?.[0]
                ?? parsed.error.flatten().fieldErrors.documentUrl?.[0]
                ?? 'Invalid qualification data.'
            return { success: false, error: msg }
        }

        const { error: insertError } = await supabase
            .from('professional_qualifications')
            .insert({
                professional_id: user.id,
                degree: parsed.data.degree,
                institution: parsed.data.institution,
                year: parsed.data.year ?? null,
                document_url: parsed.data.documentUrl,
                document_approved: null,
            })

        if (insertError) {
            console.error('Qualification insert failed:', insertError)
            await supabase.storage.from('qualifications').remove([storagePath])
            return { success: false, error: insertError.message }
        }

        const { data: actorRow } = await supabase.from('users').select('name').eq('id', user.id).single()
        const actorName = (actorRow?.name || 'Professional').trim() || 'Professional'
        await recordProfessionalActivity(supabase, {
            actorUserId: user.id,
            type: 'professional.qualification_uploaded',
            title: 'Credentials: new qualification',
            body: `${actorName} added a credential: ${parsed.data.degree} — ${parsed.data.institution}${parsed.data.year != null ? ` (${parsed.data.year})` : ''}.`,
            metadata: {
                section: 'credentials',
                degree: parsed.data.degree,
                institution: parsed.data.institution,
                year: parsed.data.year,
            },
        })

        return { success: true, documentUrl: publicUrl }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Something went wrong while saving your credential.'
        console.error('addQualification:', e)
        return { success: false, error: message }
    }
}

export type DeleteQualificationResult =
    | { success: true }
    | { success: false; error: string }

/** Returns qualifications without exposing document URLs until admin approval. */
export async function getMyQualificationsSanitized(): Promise<
    | { success: true; qualifications: SanitizedQualificationRow[] }
    | { success: false; error: string }
> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'You must be signed in.' }
    }

    const { data, error } = await supabase
        .from('professional_qualifications')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }
    return {
        success: true,
        qualifications: (data || []).map(mapQualificationForProfessionalSelf),
    }
}

export async function deleteQualification(id: string): Promise<DeleteQualificationResult> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'You must be signed in.' }
        }

        const { data: actorNameRow } = await supabase.from('users').select('name').eq('id', user.id).single()
        const actorDisplayName = (actorNameRow?.name || 'Professional').trim() || 'Professional'

        const { data: qual } = await supabase
            .from('professional_qualifications')
            .select('document_url, degree, institution, year')
            .eq('id', id)
            .eq('professional_id', user.id)
            .single()

        if (qual?.document_url) {
            const url = qual.document_url
            if (url.includes('/qualifications/')) {
                const storagePath = url.split('/qualifications/')[1]
                const { error: removeErr } = await supabase.storage
                    .from('qualifications')
                    .remove([storagePath])
                if (removeErr) {
                    console.error('Failed to remove qualification file from storage:', removeErr)
                }
            } else if (url.startsWith('/uploads/')) {
                try {
                    await fs.unlink(path.join(process.cwd(), 'public', url))
                } catch (err) {
                    console.error('Failed to delete legacy local file:', err)
                }
            }
        }

        const { error } = await supabase
            .from('professional_qualifications')
            .delete()
            .eq('id', id)
            .eq('professional_id', user.id)

        if (error) {
            return { success: false, error: error.message }
        }

        await recordProfessionalActivity(supabase, {
            actorUserId: user.id,
            type: 'professional.qualification_removed',
            title: 'Credentials: qualification removed',
            body: qual?.degree
                ? `${actorDisplayName} removed credential: ${qual.degree} — ${qual.institution}.`
                : `${actorDisplayName} removed a credential record.`,
            metadata: { section: 'credentials', degree: qual?.degree, institution: qual?.institution },
        })

        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to delete qualification.'
        return { success: false, error: message }
    }
}

export async function updateAvailability(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const parsed = availabilitySchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const validatedData = parsed.data

    const { data: existing } = await supabase
        .from('professional_availability')
        .select('id, day_of_week, start_time, end_time, is_available')
        .eq('professional_id', user.id)
        .eq('day_of_week', validatedData.dayOfWeek)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

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

    if (error) return { success: false as const, error: error.message }

    const dayLabel = `Calendar · ${weekdayLong(validatedData.dayOfWeek)}`
    const slotLabel = `${validatedData.startTime}–${validatedData.endTime}${validatedData.isAvailable ? '' : ' (marked unavailable)'}`

    if (!existing) {
        await recordProfessionalActivity(supabase, {
            actorUserId: user.id,
            type: 'professional.calendar_slot_added',
            title: 'Calendar: new weekly slot',
            changes: [{ label: dayLabel, from: '—', to: slotLabel }],
            metadata: { section: 'calendar', day_of_week: validatedData.dayOfWeek },
        })
    } else {
        const calChanges: FieldChange[] = []
        if (String(existing.start_time) !== String(validatedData.startTime)) {
            calChanges.push({ label: `${dayLabel} · start time`, from: existing.start_time, to: validatedData.startTime })
        }
        if (String(existing.end_time) !== String(validatedData.endTime)) {
            calChanges.push({ label: `${dayLabel} · end time`, from: existing.end_time, to: validatedData.endTime })
        }
        if (Boolean(existing.is_available) !== Boolean(validatedData.isAvailable)) {
            calChanges.push({
                label: `${dayLabel} · availability`,
                from: existing.is_available ? 'available' : 'unavailable',
                to: validatedData.isAvailable ? 'available' : 'unavailable',
            })
        }
        if (calChanges.length > 0) {
            await recordProfessionalActivity(supabase, {
                actorUserId: user.id,
                type: 'professional.calendar_slot_updated',
                title: 'Calendar: weekly slot updated',
                changes: calChanges,
                metadata: { section: 'calendar', day_of_week: validatedData.dayOfWeek },
            })
        }
    }

    return { success: true as const }
}

export async function deleteAvailability(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { data: actorNameRow } = await supabase.from('users').select('name').eq('id', user.id).single()
    const actorDisplayName = (actorNameRow?.name || 'Professional').trim() || 'Professional'

    const { data: slot } = await supabase
        .from('professional_availability')
        .select('day_of_week, start_time, end_time')
        .eq('id', id)
        .eq('professional_id', user.id)
        .maybeSingle()

    const { error } = await supabase
        .from('professional_availability')
        .delete()
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) return { success: false as const, error: error.message }

    if (slot) {
        await recordProfessionalActivity(supabase, {
            actorUserId: user.id,
            type: 'professional.calendar_slot_removed',
            title: 'Calendar: weekly slot removed',
            body: `${actorDisplayName} removed ${weekdayLong(slot.day_of_week)} ${slot.start_time}–${slot.end_time}.`,
            metadata: { section: 'calendar', day_of_week: slot.day_of_week },
        })
    }

    return { success: true as const }
}

export async function updateAppointmentStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { data: ap, error: fetchErr } = await supabase
        .from('appointments')
        .select('status, start_time, client:users!appointments_client_id_fkey(name)')
        .eq('id', id)
        .eq('professional_id', user.id)
        .single()

    if (fetchErr || !ap) {
        return { success: false as const, error: fetchErr?.message || 'Appointment not found.' }
    }

    if (ap.status === status) {
        return { success: true as const }
    }

    const clientName = (ap.client as { name?: string } | null)?.name ?? 'Client'

    const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) return { success: false as const, error: error.message }

    await recordProfessionalActivity(supabase, {
        actorUserId: user.id,
        type: 'professional.appointment_status_updated',
        title: 'Clients: appointment status updated',
        changes: [
            {
                label: `appointment with ${clientName} (${new Date(ap.start_time as string).toISOString().slice(0, 16).replace('T', ' ')})`,
                from: ap.status,
                to: status,
            },
        ],
        metadata: { section: 'clients', appointment_id: id },
    })

    return { success: true as const }
}

export async function updateConsultationRequestStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { data: req, error: fetchErr } = await supabase
        .from('consultation_requests')
        .select('status, client:users!consultation_requests_client_id_fkey(name)')
        .eq('id', id)
        .eq('professional_id', user.id)
        .single()

    if (fetchErr || !req) {
        return { success: false as const, error: fetchErr?.message || 'Consultation request not found.' }
    }

    if (req.status === status) {
        return { success: true as const }
    }

    const clientName = (req.client as { name?: string } | null)?.name ?? 'Client'

    const { error } = await supabase
        .from('consultation_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', user.id)

    if (error) return { success: false as const, error: error.message }

    await recordProfessionalActivity(supabase, {
        actorUserId: user.id,
        type: 'professional.consultation_request_updated',
        title: 'Consultations: request status updated',
        changes: [
            {
                label: `consultation request from ${clientName}`,
                from: req.status,
                to: status,
            },
        ],
        metadata: { section: 'consultations', consultation_request_id: id },
    })

    return { success: true as const }
}

export type ProfessionalGuestBooking = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    category: string
    state: string
    city: string
    appointmentDate: string
    appointmentTime: string
    message: string | null
    createdAt: string
    age: number
}

export async function getProfessionalDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in to view the dashboard.' }

    const [
        { data: coreProfile },
        { data: profProfile },
        { data: qualifications },
        { data: availability },
        { data: appointments },
        { data: requests },
        { data: payments },
        { data: guestRows },
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('professional_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('professional_qualifications').select('*').eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('professional_availability').select('*').eq('professional_id', user.id).order('day_of_week', { ascending: true }),
        supabase.from('appointments').select(`*, client:users!appointments_client_id_fkey(name, email)`).eq('professional_id', user.id).order('start_time', { ascending: true }),
        supabase.from('consultation_requests').select(`*, client:users!consultation_requests_client_id_fkey(name, email)`).eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payments').select(`*, client:users!payments_client_id_fkey(name)`).eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('guest_appointments').select('*').eq('professional_id', user.id).order('created_at', { ascending: false }),
    ])

    const profDial =
        normalizePhoneCountryCode(
            (coreProfile as { phone_country_code?: string | null })?.phone_country_code
        ) ?? DEFAULT_PHONE_COUNTRY_CODE

    return {
        success: true as const,
        user,
        profile: {
            id: profProfile?.id || "",
            userId: user.id,
            specialization: profProfile?.specialization || "",
            licenseNumber: profProfile?.license_number || "",
            bio: profProfile?.bio || null,
            nameTitle:
                profProfile?.name_title ??
                (user.user_metadata?.name_title as string | undefined) ??
                null,
            yearsOfExperience: profProfile?.years_of_experience || null,
            consultationFee: profProfile?.consultation_fee || null,
            city: profProfile?.city || null,
            isVerified: profProfile?.is_verified || false,
            phone: coreProfile?.phone || null,
            phoneCountryCode: profDial,
            profilePhotoUrl: coreProfile?.image || null,
            createdAt: profProfile?.created_at || "",
            updatedAt: profProfile?.updated_at || ""
        },
        qualifications: qualifications?.map((q: any) => mapQualificationForProfessionalSelf(q)) || [],
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
        })) || [],
        guestAppointments:
            guestRows?.map(
                (g: {
                    id: string
                    first_name: string
                    last_name: string
                    email: string
                    phone: string
                    category: string
                    state: string
                    city: string
                    appointment_date: string
                    appointment_time: string
                    message: string | null
                    created_at: string
                    age: number
                }) => ({
                    id: g.id,
                    firstName: g.first_name,
                    lastName: g.last_name,
                    email: g.email,
                    phone: g.phone,
                    category: g.category,
                    state: g.state,
                    city: g.city,
                    appointmentDate: g.appointment_date,
                    appointmentTime: g.appointment_time,
                    message: g.message,
                    createdAt: g.created_at,
                    age: g.age,
                })
            ) || ([] as ProfessionalGuestBooking[]),
    }
}

export async function searchProfessionals(specialty?: string, city?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('professional_profiles')
        .select(`
            user_id,
            name_title,
            specialization,
            bio,
            years_of_experience,
            consultation_fee,
            is_verified,
            city,
            users!inner (
                name,
                image
            )
        `);

    if (specialty) {
        query = query.ilike('specialization', `%${specialty}%`);
    }

    if (city) {
        query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query;

    if (error) {
        return { success: false as const, error: error.message, data: [] }
    }

    return {
        success: true as const,
        data: (data || []).map((p: any) => ({
            id: p.user_id,
            name: p.users?.name,
            nameTitle: p.name_title ?? null,
            displayName: formatProfessionalDisplayName(p.users?.name, p.name_title),
            specialization: p.specialization,
            bio: p.bio,
            yearsOfExperience: p.years_of_experience,
            consultationFee: p.consultation_fee,
            isVerified: p.is_verified,
            city: p.city,
            profilePhotoUrl: p.users?.image || null,
        })),
    }
}

export async function getProfessionalById(id: string) {
    const supabase = await createClient()

    const [
        { data: profProfile, error: profError },
        { data: userCore, error: userError },
        { data: qualifications, error: qualError },
        { data: availability, error: availError }
    ] = await Promise.all([
        supabase.from('professional_profiles').select('*').eq('user_id', id).single(),
        supabase.from('users').select('name, email, image, phone, phone_country_code').eq('id', id).single(),
        supabase.from('professional_qualifications').select('*').eq('professional_id', id).order('year', { ascending: false }),
        supabase.from('professional_availability').select('*').eq('professional_id', id).order('day_of_week', { ascending: true })
    ]);

    if (profError || userError) {
        console.error("Error fetching professional details:", profError || userError);
        return null;
    }

    const nameTitle = profProfile.name_title ?? null

    return {
        id: profProfile.user_id,
        name: userCore.name,
        nameTitle,
        displayName: formatProfessionalDisplayName(userCore.name, nameTitle),
        email: userCore.email,
        phone: combineInternationalPhone(
            (userCore as { phone_country_code?: string | null }).phone_country_code,
            userCore.phone
        ),
        profilePhotoUrl: userCore.image,
        specialization: profProfile.specialization,
        licenseNumber: profProfile.license_number,
        bio: profProfile.bio,
        yearsOfExperience: profProfile.years_of_experience,
        consultationFee: profProfile.consultation_fee,
        city: profProfile.city,
        isVerified: profProfile.is_verified,
        qualifications: (qualifications || []).map((q: any) => ({
            ...q,
            document_url: q.document_approved === true ? q.document_url : null,
        })),
        availability: availability || []
    };
}

