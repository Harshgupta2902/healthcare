'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { zodFirstError } from '@/lib/server-action-result'
import { recordAdminNotification } from '@/lib/admin-notifications'
import { cookies, headers } from 'next/headers'
import sharp from 'sharp'
import {
    assertLoginRateLimits,
    assertRegisterOtpRateLimits,
    assertSignupRateLimits,
    deviceHashZodField,
    getClientIpFromHeaders,
} from '@/lib/device-rate-limit'
import { getRegistrationSettings } from '@/lib/app-settings'
import {
  REGISTRATION_OTP_EXPIRY_MINUTES,
  REGISTRATION_OTP_LENGTH,
} from '@/lib/registration-constants'
import { sendRegistrationOtpEmail } from '@/lib/mailer'
import {
    generateRegistrationOtp,
    hashRegistrationOtp,
    isRegistrationOtpFormatValid,
    normalizeRegistrationEmail,
} from '@/lib/registration-otp'

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),
})

export async function updateProfile(formData: unknown) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false as const, error: 'You must be signed in to update your profile.' }
    }

    const parsed = profileSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false as const, error: zodFirstError(parsed.error) }
    }

    const validatedData = parsed.data

    const { error: dbError } = await supabase
        .from('users')
        .update({
            name: validatedData.name,
            phone: validatedData.phone,
            image: validatedData.image,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (dbError) {
        return { success: false as const, error: dbError.message }
    }

    await supabase.auth.updateUser({
        data: { name: validatedData.name }
    })

    await syncUserSession();

    await recordAdminNotification(supabase, {
        actorUserId: user.id,
        type: 'user.profile_updated',
        title: 'User profile updated',
        body: 'Name, phone, or profile image URL was saved.',
        metadata: { hasImage: Boolean(validatedData.image) },
    })

    return { success: true as const }
}

export async function syncUserSession() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // Get current user role from DB to avoid overwriting manual changes (like admin role)
    const { data: existingUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const finalRole = user.user_metadata?.role || existingUser?.role || 'client'

    // Ensure they are in the 'public.users' table
    // Using upsert handles both first-time (register) and future (login/refresh) syncs
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            name: user.user_metadata?.name || user.email,
            email: user.email,
            role: finalRole,
            image: user.user_metadata?.image || user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString()
        })

    if (upsertError) {
        console.error("Failed to sync user to public.users table:", upsertError.message)
    }

    // Store essential user data in an unencrypted cookie for convenient access
    // This addresses the "store user data in cookies" request
    const cookieStore = await cookies();
    const userData = {
        id: user.id,
        name: user.user_metadata?.name || '',
        email: user.email || '',
        role: finalRole
    };

    cookieStore.set('user_data', JSON.stringify(userData), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return userData;
}

const signInSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
    deviceHash: deviceHashZodField,
})

export type SignInInput = z.infer<typeof signInSchema>

export async function signIn(input: SignInInput) {
    const parsed = signInSchema.safeParse(input)
    if (!parsed.success) {
        return { error: zodFirstError(parsed.error), code: 'validation' as const }
    }

    const { email, password, deviceHash } = parsed.data
    const headerStore = await headers()
    const clientIp = getClientIpFromHeaders(headerStore)
    const rateLimit = await assertLoginRateLimits({
        ip: clientIp,
        deviceHash,
        email,
    })
    if (!rateLimit.ok) {
        return { error: rateLimit.error, code: rateLimit.reason }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid email or password.', code: 'auth' as const }
    }

    const syncedData = await syncUserSession()

    return { success: true, user: data.user, role: syncedData?.role }
}

const signUpSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['client', 'professional']),
    nameTitle: z.string().optional().nullable(),
    deviceHash: z
        .string()
        .regex(/^[a-f0-9]{64}$/i, 'Unable to verify your device. Please refresh and try again.'),
})

export type SignUpInput = z.infer<typeof signUpSchema>

const verifyOtpSignUpSchema = signUpSchema.extend({
    otp: z.string().trim().min(1, 'Verification code is required'),
})

export type VerifyOtpSignUpInput = z.infer<typeof verifyOtpSignUpSchema>

type SignUpResult =
    | {
          success: true
          user: import('@supabase/supabase-js').User | null
          session: import('@supabase/supabase-js').Session | null
          needsConfirmation: boolean
      }
    | { error: string; code?: string }

async function executeSignUp(parsed: z.infer<typeof signUpSchema>): Promise<SignUpResult> {
    const { email, password, name, role, nameTitle, deviceHash } = parsed

    const headerStore = await headers()
    const clientIp = getClientIpFromHeaders(headerStore)
    const rateLimit = await assertSignupRateLimits({ ip: clientIp, deviceHash, email })
    if (!rateLimit.ok) {
        return { error: rateLimit.error, code: rateLimit.reason }
    }

    const supabase = await createClient()
    const titleForMeta =
        role === 'professional' && nameTitle?.trim() ? nameTitle.trim() : undefined
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role,
                ...(titleForMeta ? { name_title: titleForMeta } : {}),
            },
        },
    })

    if (error) {
        console.error('ServerAction: signUp error:', error.message)
        return { error: error.message }
    }

    if (data.session) {
        await syncUserSession()
    }

    return {
        success: true,
        user: data.user,
        session: data.session,
        needsConfirmation: !data.session && data.user ? true : false,
    }
}

export async function signUp(input: SignUpInput) {
    const parsed = signUpSchema.safeParse(input)
    if (!parsed.success) {
        return { error: zodFirstError(parsed.error), code: 'validation' as const }
    }

    const settings = await getRegistrationSettings()
    if (settings.email_otp_enabled) {
        return {
            error: 'Email verification is required. Please request a verification code first.',
            code: 'otp_required' as const,
        }
    }

    return executeSignUp(parsed.data)
}

export async function requestRegistrationOtp(input: SignUpInput) {
    const parsed = signUpSchema.safeParse(input)
    if (!parsed.success) {
        return { error: zodFirstError(parsed.error), code: 'validation' as const }
    }

    const settings = await getRegistrationSettings()
    if (!settings.email_otp_enabled) {
        return {
            error: 'Email verification is not required. You can create your account directly.',
            code: 'otp_disabled' as const,
        }
    }

    const { email, name, role, nameTitle, deviceHash } = parsed.data
    const normalizedEmail = normalizeRegistrationEmail(email)

    const headerStore = await headers()
    const clientIp = getClientIpFromHeaders(headerStore)
    const otpRateLimit = await assertRegisterOtpRateLimits({
        ip: clientIp,
        deviceHash,
        email: normalizedEmail,
    })
    if (!otpRateLimit.ok) {
        return { error: otpRateLimit.error, code: otpRateLimit.reason }
    }

    const otpCode = generateRegistrationOtp(REGISTRATION_OTP_LENGTH)
    const otpHash = hashRegistrationOtp(normalizedEmail, otpCode)
    const expiresAt = new Date(Date.now() + REGISTRATION_OTP_EXPIRY_MINUTES * 60 * 1000)

    const supabase = await createClient()
    const { error: rpcError } = await supabase.rpc('create_registration_email_otp', {
        p_email: normalizedEmail,
        p_otp_hash: otpHash,
        p_payload: {
            name,
            role,
            ...(nameTitle?.trim() ? { name_title: nameTitle.trim() } : {}),
        },
        p_expires_at: expiresAt.toISOString(),
        p_max_attempts: settings.otp_max_attempts,
    })

    if (rpcError) {
        console.error('[requestRegistrationOtp] RPC error:', rpcError)
        return { error: 'Could not send verification code. Please try again.' }
    }

    try {
        await sendRegistrationOtpEmail({
            email: normalizedEmail,
            recipientName: name,
            otpCode,
            expiryMinutes: REGISTRATION_OTP_EXPIRY_MINUTES,
        })
    } catch (mailErr) {
        console.error('[requestRegistrationOtp] mail error:', mailErr)
        return {
            error: 'Could not send verification email. Check your email address or try again later.',
        }
    }

    return {
        success: true as const,
        expiresInMinutes: REGISTRATION_OTP_EXPIRY_MINUTES,
        otpLength: REGISTRATION_OTP_LENGTH,
        resendCooldownSeconds: settings.resend_cooldown_seconds,
    }
}

export async function verifyOtpAndSignUp(input: VerifyOtpSignUpInput) {
    const parsed = verifyOtpSignUpSchema.safeParse(input)
    if (!parsed.success) {
        return { error: zodFirstError(parsed.error), code: 'validation' as const }
    }

    const settings = await getRegistrationSettings()
    if (!settings.email_otp_enabled) {
        const { otp: _otp, ...signUpInput } = parsed.data
        return signUp(signUpInput)
    }

    const { email, otp } = parsed.data
    const normalizedEmail = normalizeRegistrationEmail(email)

    if (!isRegistrationOtpFormatValid(otp, REGISTRATION_OTP_LENGTH)) {
        return {
            error: `Enter the ${REGISTRATION_OTP_LENGTH}-character verification code from your email.`,
            code: 'validation' as const,
        }
    }

    const otpHash = hashRegistrationOtp(normalizedEmail, otp)
    const supabase = await createClient()
    const { data: verifyData, error: verifyError } = await supabase.rpc(
        'verify_registration_email_otp',
        {
            p_email: normalizedEmail,
            p_otp_hash: otpHash,
        },
    )

    if (verifyError) {
        console.error('[verifyOtpAndSignUp] verify RPC error:', verifyError)
        return { error: 'Could not verify code. Please try again.' }
    }

    const verifyResult = (verifyData ?? null) as { ok?: boolean; reason?: string } | null
    if (!verifyResult?.ok) {
        const reason = verifyResult?.reason
        if (reason === 'expired') {
            return { error: 'This verification code has expired. Please request a new one.', code: 'expired' }
        }
        if (reason === 'locked') {
            return {
                error: 'Too many incorrect attempts. Please request a new verification code.',
                code: 'locked',
            }
        }
        return { error: 'Invalid verification code. Please check and try again.', code: 'invalid_otp' }
    }

    const signUpResult = await executeSignUp(parsed.data)
    if ('error' in signUpResult) {
        return signUpResult
    }

    await supabase.rpc('consume_registration_email_otp', { p_email: normalizedEmail })

    return signUpResult
}

export async function signOut() {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()

        const cookieStore = await cookies()
        cookieStore.delete('user_data')

        return { success: true as const }
    } catch (error) {
        console.error('Error during signOut action:', error)
        return { success: false as const, error: 'Sign out failed' }
    }
}
export async function uploadProfileImage(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: "Unauthorized" }
        }

        // 1. Get current image to delete later if update succeeds
        const { data: userData } = await supabase
            .from('users')
            .select('image')
            .eq('id', user.id)
            .single()

        const oldImageUrl = userData?.image

        const file = formData.get('file') as File
        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" }
        }

        // Verify file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: "File too large (max 10MB)" }
        }

        const fileName = `${user.id}/${Date.now()}.webp`
        const filePath = `${fileName}`

        // Convert File to Buffer for Sharp
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 2. Optimize image using Sharp
        let optimizedBuffer: Buffer;
        try {
            optimizedBuffer = await sharp(buffer)
                .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            console.log(`Image optimized: ${(buffer.length / 1024).toFixed(2)}KB -> ${(optimizedBuffer.length / 1024).toFixed(2)}KB`);
        } catch (sharpError) {
            console.error("Optimization failed, using original:", sharpError);
            optimizedBuffer = buffer; // Fallback to original
        }

        // 3. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(filePath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
            })

        if (uploadError) {
            console.error("Storage upload failed:", uploadError);
            return { success: false, error: uploadError.message }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath)

        // 4. Update in Database
        const { error: dbError } = await supabase
            .from('users')
            .update({
                image: publicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (dbError) {
            console.error("Database update failed:", dbError);
            return { success: false, error: dbError.message }
        }

        // 5. Delete old photo if it exists and is different from new one
        if (oldImageUrl && oldImageUrl !== publicUrl) {
            try {
                // Extract path from public URL: .../public/profiles/PATH
                const pathParts = oldImageUrl.split('/profiles/')
                if (pathParts.length > 1) {
                    const oldPath = pathParts[1]
                    await supabase.storage
                        .from('profiles')
                        .remove([oldPath])
                }
            } catch (deleteError) {
            }
        }

        // Update Auth Metadata for session consistency
        await supabase.auth.updateUser({
            data: { image: publicUrl }
        })

        await syncUserSession();

        await recordAdminNotification(supabase, {
            actorUserId: user.id,
            type: 'user.profile_image_updated',
            title: 'Profile photo updated',
            body: 'A user uploaded or changed their profile image.',
            metadata: {},
        })

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error("Profile upload exception:", error)
        return { success: false, error: error.message || "An unexpected error occurred" }
    }
}
