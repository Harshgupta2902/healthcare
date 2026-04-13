'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import sharp from 'sharp'
import crypto from 'crypto'
import { zodFirstError } from '@/lib/server-action-result'

const medicalProfileSchema = z.object({
    phone: z.string().regex(/^\d*$/, "Phone must contain only numbers").optional().nullable(),
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

    if (parsed.data.phone) {
        await supabase.from('users').update({ phone: parsed.data.phone }).eq('id', user.id)
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
        { data: insurance }
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('client_medical_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('medical_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('medical_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('insurance').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    return {
        success: true as const,
        user,
        profile: {
            id: user.id,
            userId: user.id,
            phone: coreProfile?.phone || null,
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
        })) || []
    }
}


export async function subscribeNewsletter(email: string) {
    const supabase = await createClient()
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return { success: false as const, error: 'Please enter a valid email address.' }
    }

    const sanitizedEmail = email.trim().toLowerCase()

    const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', sanitizedEmail)
        .single()

    if (existing) {
        return { success: false as const, error: 'This email is already subscribed.' }
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
            email: sanitizedEmail,
            subscribed_at: new Date().toISOString(),
            status: 'active'
        })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
}
