'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

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
    if (!user) throw new Error('Unauthorized')

    const validatedData = medicalProfileSchema.parse(data)

    const { error } = await supabase
        .from('client_medical_profiles')
        .upsert({
            user_id: user.id,
            date_of_birth: validatedData.dateOfBirth,
            gender: validatedData.gender,
            blood_type: validatedData.bloodType,
            height: validatedData.height?.toString(),
            weight: validatedData.weight?.toString(),
            address: validatedData.address,
            city: validatedData.city,
            state: validatedData.state,
            postal_code: validatedData.postalCode,
            emergency_contact_name: validatedData.emergencyContactName,
            emergency_contact_phone: validatedData.emergencyContactPhone,
            emergency_contact_relationship: validatedData.emergencyContactRelationship,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) throw new Error(error.message)

    // Also update phone in users if provided
    if (validatedData.phone) {
        await supabase.from('users').update({ phone: validatedData.phone }).eq('id', user.id)
    }

    return { success: true }
}

export async function addMedicalCondition(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = conditionSchema.parse(data)

    const { error } = await supabase
        .from('medical_history')
        .insert({
            user_id: user.id,
            condition_name: validatedData.conditionName,
            diagnosis_date: validatedData.diagnosisDate,
            status: validatedData.status,
            notes: validatedData.notes,
        })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteMedicalCondition(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('medical_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function addMedication(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = medicationSchema.parse(data)

    const { error } = await supabase
        .from('medications')
        .insert({
            user_id: user.id,
            medication_name: validatedData.medicationName,
            dosage: validatedData.dosage,
            frequency: validatedData.frequency,
            start_date: validatedData.startDate,
            end_date: validatedData.endDate,
            prescribing_doctor: validatedData.prescribingDoctor,
            notes: validatedData.notes,
            is_active: validatedData.isActive,
        })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteMedication(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function addMedicalDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string;
    const documentType = formData.get('documentType') as string;
    const notes = formData.get('notes') as string;

    if (!file || !documentName) {
        throw new Error("File and document name are required");
    }

    // Prepare filename and path
    const fileExtension = path.extname(file.name);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const publicUploadPath = '/uploads';
    const uploadDir = path.join(process.cwd(), 'public', publicUploadPath);
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
        // ignore if exists
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const fileUrl = `${publicUploadPath}/${fileName}`;

    const validatedData = documentSchema.parse({
        documentName,
        documentType,
        fileUrl,
        fileSize: file.size,
        notes,
    })

    const { error } = await supabase
        .from('medical_documents')
        .insert({
            user_id: user.id,
            document_name: validatedData.documentName,
            document_type: validatedData.documentType,
            file_url: validatedData.fileUrl,
            file_size: validatedData.fileSize,
            notes: validatedData.notes,
        })

    if (error) throw new Error(error.message)
    return { success: true, fileUrl }
}

export async function deleteMedicalDocument(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get the file path before deleting record
    const { data: doc } = await supabase
        .from('medical_documents')
        .select('file_url')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (doc?.file_url) {
        try {
            const filePath = path.join(process.cwd(), 'public', doc.file_url)
            await fs.unlink(filePath)
        } catch (err) {
            console.error("Failed to delete physical file:", err)
        }
    }

    const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function addInsurance(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = insuranceSchema.parse(data)

    const { error } = await supabase
        .from('insurance')
        .insert({
            user_id: user.id,
            provider_name: validatedData.providerName,
            policy_number: validatedData.policyNumber,
            group_number: validatedData.groupNumber,
            policy_holder_name: validatedData.policyHolderName,
            relationship_to_holder: validatedData.relationshipToHolder,
            expiration_date: validatedData.expirationDate,
            notes: validatedData.notes,
        })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteInsurance(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('insurance')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function getClientDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

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
        throw new Error("Invalid email format")
    }

    const sanitizedEmail = email.trim().toLowerCase()

    // Check existing
    const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', sanitizedEmail)
        .single()

    if (existing) {
        throw new Error("Already subscribed")
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
            email: sanitizedEmail,
            subscribed_at: new Date().toISOString(),
            status: 'active'
        })

    if (error) throw new Error(error.message)
    return { success: true }
}
