'use server'

import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import sharp from 'sharp'
import crypto from 'crypto'
import { zodFirstError } from '@/lib/server-action-result'
import { syncUserSession } from '@/features/profile/actions'
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    getPhoneCountryOptionForValidation,
    isKnownPhoneCountryDial,
    normalizePhoneCountryCode,
} from '@/lib/phone-country-options'
import { fetchGuestAppointmentProfessionalMeta } from '@/lib/guest-appointment-professional-meta'
import { getClientOrderHistory } from '@/features/booking-orders/actions'
import type { ClientOrderHistoryItem } from '@/features/booking-orders/types'
import { sendNewsletterEmail } from '@/lib/mailer'
import { verifyUnsubscribeToken } from '@/lib/newsletter-token'
import {
    assertNewsletterRateLimits,
    getClientIpFromHeaders,
} from '@/lib/device-rate-limit'
import { headers } from 'next/headers'

const medicalProfileSchema = z
    .object({
        phoneCountryCode: z.string().optional().nullable(),
        /** Matches selected row when dial is shared (e.g. +1); used only for national length rules. */
        phoneCountryIso: z.string().length(2).optional().nullable(),
        phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable().refine((date) => {
        if (!date) return true;
        const dob = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dob < today;
    }, "Date of birth must be in the past"),
    gender: z.string().optional().nullable(),
    bloodType: z.string().optional().nullable(),
    height: z.number().optional().nullable(),
    weight: z.number().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().regex(/^[a-zA-Z\s]*$/, "City must contain only letters").optional().nullable(),
    state: z.string().regex(/^[a-zA-Z\s]*$/, "State must contain only letters").optional().nullable(),
    postalCode: z.string().regex(/^\d*$/, "Postal code must contain only numbers").optional().nullable(),
    emergencyContactName: z.string().regex(/^[a-zA-Z\s]*$/, "Name must contain only letters").optional().nullable(),
    emergencyContactPhone: z.string().regex(/^\d*$/, "Phone must contain only numbers").optional().nullable(),
    emergencyContactRelationship: z.string().regex(/^[a-zA-Z\s]*$/, "Relationship must contain only letters").optional().nullable(),
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

const conditionSchema = z.object({
    conditionName: z.string().min(1, "Condition name is required").regex(/^[a-zA-Z\s]*$/, "Condition name must contain only letters"),
    diagnosisDate: z.string().optional().nullable().refine((date) => {
        if (!date) return true;
        const diagDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return diagDate <= today;
    }, "Diagnosis date cannot be in the future"),
    status: z.string().default('active'),
    notes: z.string().optional().nullable(),
})

const medicationSchema = z.object({
    medicationName: z.string().min(1, "Medication name is required").regex(/^[a-zA-Z0-9\s]*$/, "Medication name must be alphanumeric"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    startDate: z.string().min(1, "Start date is required").refine((date) => {
        if (!date) return true;
        const sDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return sDate <= today;
    }, "Start date cannot be in the future"),
    endDate: z.string().optional().nullable(),
    prescribingDoctor: z.string().regex(/^[a-zA-Z\s\.]*$/, "Doctor name contains invalid characters").optional().nullable(),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

const documentSchema = z.object({
    documentName: z.string().min(1, "Document name is required").regex(/^[a-zA-Z0-9\s\.\-]*$/, "Invalid characters in name"),
    documentType: z.string().min(1, "Document type is required"),
    fileUrl: z.string().min(1, "File URL is required"),
    fileSize: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
})

const insuranceSchema = z.object({
    providerName: z.string().min(1, "Provider name is required").regex(/^[a-zA-Z\s\&]*$/, "Special characters not allowed"),
    policyNumber: z.string().min(1, "Policy number is required").regex(/^[a-zA-Z0-9]*$/, "Alphanumeric only"),
    groupNumber: z.string().optional().nullable(),
    policyHolderName: z.string().min(1, "Holder name is required").regex(/^[a-zA-Z\s]*$/, "Name must contain only letters"),
    relationshipToHolder: z.string().optional().nullable().transform(val => val || ""),
    expirationDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export async function updateMedicalProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in to update your profile.' }

    const parsed = medicalProfileSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const { error } = await supabase
        .from('client_medical_profiles')
        .upsert({
            user_id: user.id,
            date_of_birth: parsed.data.dateOfBirth,
            gender: parsed.data.gender,
            blood_type: parsed.data.bloodType,
            height: parsed.data.height?.toString(),
            weight: parsed.data.weight?.toString(),
            address: parsed.data.address,
            city: parsed.data.city,
            state: parsed.data.state,
            postal_code: parsed.data.postalCode,
            emergency_contact_name: parsed.data.emergencyContactName,
            emergency_contact_phone: parsed.data.emergencyContactPhone,
            emergency_contact_relationship: parsed.data.emergencyContactRelationship,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) return { success: false as const, error: error.message }

    const userPatch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    }
    let didUpdateUsers = false
    const nationalDigits = (parsed.data.phone ?? '').replace(/\D/g, '') || null
    let dial = normalizePhoneCountryCode(parsed.data.phoneCountryCode ?? undefined)
    if (nationalDigits && !dial) dial = DEFAULT_PHONE_COUNTRY_CODE
    userPatch.phone = nationalDigits
    userPatch.phone_country_code = nationalDigits ? dial : null
    didUpdateUsers = true
    if (parsed.data.profilePhotoUrl) {
        userPatch.image = parsed.data.profilePhotoUrl
        didUpdateUsers = true
    }
    if (didUpdateUsers) {
        const { error: userErr } = await supabase.from('users').update(userPatch).eq('id', user.id)
        if (userErr) return { success: false as const, error: userErr.message }

        const { data: row } = await supabase
            .from('users')
            .select('name, image')
            .eq('id', user.id)
            .single()

        await supabase.auth.updateUser({
            data: {
                name: row?.name ?? undefined,
                image: row?.image ?? undefined,
            },
        })
        await syncUserSession()
    }

    return { success: true as const }
}

export async function addMedicalCondition(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const parsed = conditionSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const { error } = await supabase
        .from('medical_history')
        .insert({
            user_id: user.id,
            condition_name: parsed.data.conditionName,
            diagnosis_date: parsed.data.diagnosisDate,
            status: parsed.data.status,
            notes: parsed.data.notes,
        })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function deleteMedicalCondition(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { error } = await supabase
        .from('medical_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function addMedication(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const parsed = medicationSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const { error } = await supabase
        .from('medications')
        .insert({
            user_id: user.id,
            medication_name: parsed.data.medicationName,
            dosage: parsed.data.dosage,
            frequency: parsed.data.frequency,
            start_date: parsed.data.startDate,
            end_date: parsed.data.endDate,
            prescribing_doctor: parsed.data.prescribingDoctor,
            notes: parsed.data.notes,
            is_active: parsed.data.isActive,
        })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function deleteMedication(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export type AddMedicalDocumentResult =
    | { success: true; fileUrl: string }
    | { success: false; error: string }

export async function addMedicalDocument(formData: FormData): Promise<AddMedicalDocumentResult> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'You must be signed in.' }

        const file = formData.get('file') as File;
        const documentName = formData.get('documentName') as string;
        const documentType = formData.get('documentType') as string;
        const notes = formData.get('notes') as string;

        if (!file || !documentName) {
            return { success: false, error: 'File and document name are required.' }
        }

        const isImage = file.type.startsWith('image/');
        const fileExt = isImage ? 'webp' : file.name.split('.').pop();
        const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        let uploadBuffer: Buffer | ArrayBuffer = await file.arrayBuffer();
        let contentType = file.type;

        if (isImage) {
            try {
                const buffer = Buffer.from(uploadBuffer as ArrayBuffer);
                uploadBuffer = await sharp(buffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();
                contentType = 'image/webp';
            } catch (err) {
                console.error("Optimization failed for document:", err);
                uploadBuffer = await file.arrayBuffer();
            }
        }

        const { error: uploadError } = await supabase.storage
            .from('medical-documents')
            .upload(filePath, uploadBuffer, {
                contentType,
                upsert: true
            });

        if (uploadError) return { success: false, error: uploadError.message };

        const { data: { publicUrl } } = supabase.storage
            .from('medical-documents')
            .getPublicUrl(filePath);

        const parsed = documentSchema.safeParse({
            documentName,
            documentType,
            fileUrl: publicUrl,
            fileSize: uploadBuffer instanceof Buffer ? uploadBuffer.length : file.size,
            notes,
        })
        if (!parsed.success) return { success: false, error: zodFirstError(parsed.error) }

        const { error } = await supabase
            .from('medical_documents')
            .insert({
                user_id: user.id,
                document_name: parsed.data.documentName,
                document_type: parsed.data.documentType,
                file_url: parsed.data.fileUrl,
                file_size: parsed.data.fileSize,
                notes: parsed.data.notes,
            })

        if (error) return { success: false, error: error.message }
        return { success: true, fileUrl: publicUrl }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to upload document.'
        return { success: false, error: msg }
    }
}

export async function deleteMedicalDocument(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { data: doc } = await supabase
        .from('medical_documents')
        .select('file_url')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (doc?.file_url) {
        try {
            const pathParts = doc.file_url.split('/medical-documents/')
            if (pathParts.length > 1) {
                const storagePath = pathParts[1]
                await supabase.storage
                    .from('medical-documents')
                    .remove([storagePath])
            }
        } catch (err) {
            console.error("Failed to delete from storage:", err)
        }
    }

    const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function addInsurance(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const parsed = insuranceSchema.safeParse(data)
    if (!parsed.success) return { success: false as const, error: zodFirstError(parsed.error) }

    const { error } = await supabase
        .from('insurance')
        .insert({
            user_id: user.id,
            provider_name: parsed.data.providerName,
            policy_number: parsed.data.policyNumber,
            group_number: parsed.data.groupNumber,
            policy_holder_name: parsed.data.policyHolderName,
            relationship_to_holder: parsed.data.relationshipToHolder,
            expiration_date: parsed.data.expirationDate,
            notes: parsed.data.notes,
        })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function deleteInsurance(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in.' }

    const { error } = await supabase
        .from('insurance')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}

export async function getClientDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: 'You must be signed in to view the dashboard.' }

    const [
        { data: coreProfile },
        { data: medProfile },
        { data: history },
        { data: medications },
        { data: documents },
        { data: insurance },
        { data: guestAppointments },
        orderHistoryResult,
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('client_medical_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('medical_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('medical_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('insurance').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase
            .from('guest_appointments')
            .select('*')
            .eq('created_by', user.id)
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true }),
        getClientOrderHistory(),
    ])

    const professionalIds = Array.from(
        new Set(
            (guestAppointments || [])
                .map((g: any) => g.professional_id)
                .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
        )
    )

    const professionalMeta = await fetchGuestAppointmentProfessionalMeta(supabase, professionalIds)

    const clientDial =
        normalizePhoneCountryCode(
            (coreProfile as { phone_country_code?: string | null })?.phone_country_code
        ) ?? DEFAULT_PHONE_COUNTRY_CODE

    return {
        success: true as const,
        user,
        profile: {
            id: user.id,
            userId: user.id,
            phone: coreProfile?.phone || null,
            phoneCountryCode: clientDial,
            profilePhotoUrl: coreProfile?.image || null,
            dateOfBirth: medProfile?.date_of_birth || null,
            gender: medProfile?.gender || null,
            bloodType: medProfile?.blood_type || null,
            height: medProfile?.height ? parseFloat(medProfile.height) : null,
            weight: medProfile?.weight ? parseFloat(medProfile.weight) : null,
            address: medProfile?.address || null,
            city: medProfile?.city || null,
            state: medProfile?.state || null,
            postalCode: medProfile?.postal_code || null,
            emergencyContactName: medProfile?.emergency_contact_name || null,
            emergencyContactPhone: medProfile?.emergency_contact_phone || null,
            emergencyContactRelationship: medProfile?.emergency_contact_relationship || null,
            createdAt: coreProfile?.created_at || "",
            updatedAt: coreProfile?.updated_at || ""
        },
        medicalHistory: history?.map(item => ({
            id: item.id,
            userId: item.user_id,
            conditionName: item.condition_name,
            diagnosisDate: item.diagnosis_date,
            status: item.status,
            notes: item.notes,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        })) || [],
        medications: medications?.map(item => ({
            id: item.id,
            userId: item.user_id,
            medicationName: item.medication_name,
            dosage: item.dosage,
            frequency: item.frequency,
            startDate: item.start_date,
            endDate: item.end_date,
            prescribingDoctor: item.prescribing_doctor,
            notes: item.notes,
            isActive: item.is_active,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        })) || [],
        documents: documents?.map(item => ({
            id: item.id,
            userId: item.user_id,
            documentName: item.document_name,
            documentType: item.document_type,
            fileUrl: item.file_url,
            fileSize: item.file_size,
            uploadDate: item.upload_date,
            notes: item.notes,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        })) || [],
        insurance: insurance?.map(item => ({
            id: item.id,
            userId: item.user_id,
            providerName: item.provider_name,
            policyNumber: item.policy_number,
            groupNumber: item.group_number,
            policyHolderName: item.policy_holder_name,
            relationshipToHolder: item.relationship_to_holder,
            expirationDate: item.expiration_date,
            notes: item.notes,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        })) || [],
        appointments: guestAppointments?.map((apt: any) => {
            const meta = apt.professional_id ? professionalMeta[apt.professional_id] : undefined
            return {
                id: apt.id,
                professionalId: apt.professional_id || null,
                firstName: apt.first_name,
                lastName: apt.last_name,
                age: apt.age,
                phone: apt.phone,
                email: apt.email,
                category: apt.category,
                state: apt.state,
                city: apt.city,
                appointmentDate: apt.appointment_date,
                appointmentTime: apt.appointment_time,
                message: apt.message,
                calendarInviteUrl: apt.calendar_invite_url || null,
                prescriptionHtml: apt.prescription_html || null,
                prescriptionUpdatedAt: apt.prescription_updated_at || null,
                professionalName: meta?.name ?? null,
                professionalEmail: meta?.email ?? null,
                professionalSpecialization: meta?.specialization ?? null,
                professionalQualificationsSummary: meta?.qualificationsSummary ?? null,
                createdAt: apt.created_at,
            }
        }) || [],
        orders: orderHistoryResult.success ? orderHistoryResult.orders : ([] as ClientOrderHistoryItem[]),
    }
}


const subscribeNewsletterSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email address is required')
        .max(320)
        .email('Please enter a valid email address.'),
    deviceHash: z
        .string()
        .regex(/^[a-f0-9]{64}$/i, 'Unable to verify your device. Please refresh and try again.'),
})

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>

export async function subscribeNewsletter(input: SubscribeNewsletterInput | string) {
    const parsed = subscribeNewsletterSchema.safeParse(
        typeof input === 'string' ? { email: input } : input,
    )
    if (!parsed.success) {
        return { success: false as const, error: zodFirstError(parsed.error) }
    }

    const { email, deviceHash } = parsed.data
    const sanitizedEmail = email.trim().toLowerCase()

    const headerStore = await headers()
    const clientIp = getClientIpFromHeaders(headerStore)

    const rateLimit = await assertNewsletterRateLimits({
        ip: clientIp,
        deviceHash,
        email: sanitizedEmail,
    })
    if (!rateLimit.ok) {
        return {
            success: false as const,
            error: rateLimit.error,
            code: rateLimit.reason,
        }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('subscribe_newsletter', {
        p_email: sanitizedEmail,
    })

    if (error) {
        console.error('[subscribeNewsletter] RPC error:', error)
        return { success: false as const, error: error.message }
    }

    const result = (data ?? null) as
        | 'subscribed'
        | 'resubscribed'
        | 'already_active'
        | null

    if (result === 'already_active') {
        return { success: false as const, error: 'This email is already subscribed.' }
    }

    // Welcome email only for FIRST-time subscribers. Returning users
    // (status flipped from 'unsubscribed' -> 'resubscribed') do not get re-emailed.
    if (result === 'subscribed') {
        after(async () => {
            try {
                await sendNewsletterEmail(sanitizedEmail)
            } catch (mailErr) {
                console.error('[subscribeNewsletter] Failed to send welcome email:', mailErr)
            }
        })
    }

    return {
        success: true as const,
        action: (result === 'resubscribed' ? 'resubscribed' : 'subscribed') as
            | 'subscribed'
            | 'resubscribed',
    }
}

/**
 * Set the newsletter status for a verified email via the SECURITY DEFINER RPC.
 * Returns the number of affected rows (0 means email isn't in the list).
 */
async function setNewsletterStatus(email: string, status: 'active' | 'unsubscribed') {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('set_newsletter_status', {
        p_email: email,
        p_status: status,
    })
    if (error) {
        console.error('[setNewsletterStatus] RPC error:', error)
        return { ok: false as const, error: error.message }
    }
    const affected = typeof data === 'number' ? data : Number(data ?? 0)
    return { ok: true as const, affected }
}

/**
 * Unsubscribe via signed token from the email link.
 * Stateless verification — token is HMAC-signed by us, so we trust the email after verifyUnsubscribeToken().
 */
export async function unsubscribeNewsletter(token: string) {
    const verified = verifyUnsubscribeToken(token)
    if (!verified.ok) {
        return { success: false as const, error: verified.error }
    }

    const result = await setNewsletterStatus(verified.email, 'unsubscribed')
    if (!result.ok) return { success: false as const, error: result.error }
    if (result.affected === 0) {
        return {
            success: false as const,
            error: 'This email is not on our subscriber list.',
        }
    }
    return { success: true as const, email: verified.email }
}

/**
 * Read the current newsletter status for the email encoded in a signed token.
 * Returns one of: 'active' | 'unsubscribed' | 'not_found' | 'invalid_token'.
 */
export async function getNewsletterStatusByToken(token: string) {
    const verified = verifyUnsubscribeToken(token)
    if (!verified.ok) {
        return { ok: false as const, status: 'invalid_token' as const, error: verified.error }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_newsletter_status', {
        p_email: verified.email,
    })

    if (error) {
        console.error('[getNewsletterStatusByToken] RPC error:', error)
        return { ok: false as const, status: 'invalid_token' as const, error: error.message }
    }

    const raw = (data ?? null) as string | null
    // 'resubscribed' is treated the same as 'active' from the unsubscribe page's perspective —
    // the user is currently subscribed and may opt out again.
    const normalized: 'active' | 'unsubscribed' | 'not_found' =
        raw === 'active' || raw === 'resubscribed'
            ? 'active'
            : raw === 'unsubscribed'
                ? 'unsubscribed'
                : 'not_found'

    return { ok: true as const, status: normalized, email: verified.email }
}
