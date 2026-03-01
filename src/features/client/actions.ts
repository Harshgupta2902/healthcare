'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const medicalProfileSchema = z.object({
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    bloodType: z.string().optional().nullable(),
    height: z.number().optional().nullable(),
    weight: z.number().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyContactRelationship: z.string().optional().nullable(),
    profilePhotoUrl: z.string().optional().nullable(),
})

const conditionSchema = z.object({
    conditionName: z.string().min(1),
    diagnosisDate: z.string().optional().nullable(),
    status: z.string().default('active'),
    notes: z.string().optional().nullable(),
})

const medicationSchema = z.object({
    medicationName: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional().nullable(),
    prescribingDoctor: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

const documentSchema = z.object({
    documentName: z.string().min(1),
    documentType: z.string().min(1),
    fileUrl: z.string().url(),
    fileSize: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
})

const insuranceSchema = z.object({
    providerName: z.string().min(1),
    policyNumber: z.string().min(1),
    groupNumber: z.string().optional().nullable(),
    policyHolderName: z.string().min(1),
    relationshipToHolder: z.string().optional().nullable(),
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
        })
        .eq('user_id', user.id)

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

export async function addMedicalDocument(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const validatedData = documentSchema.parse(data)

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
    return { success: true }
}

export async function deleteMedicalDocument(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

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
