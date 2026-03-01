'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),
})

export async function updateProfile(formData: unknown) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    const validatedData = profileSchema.parse(formData)

    // Update in Database via Supabase Client
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
        throw new Error(dbError.message)
    }

    // Sync with Supabase Auth metadata for consistency
    await supabase.auth.updateUser({
        data: { name: validatedData.name }
    })

    // Also sync the user session to cookies for convenience
    await syncUserSession();

    return { success: true }
}

export async function syncUserSession() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // Ensure they are in the 'public.users' table
    // Using upsert handles both first-time (register) and future (login/refresh) syncs
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            name: user.user_metadata?.name || user.email,
            email: user.email,
            role: user.user_metadata?.role || 'client',
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
        role: user.user_metadata?.role || 'client'
    };

    cookieStore.set('user_data', JSON.stringify(userData), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return userData;
}

export async function signIn(email: string, password: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return { error: error.message }
    }

    // Sync database and cookies
    await syncUserSession()

    return { success: true, user: data.user }
}

export async function signUp(email: string, password: string, name: string, role: string) {
    console.log("ServerAction: signUp called with", { email, name, role });
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role
            }
        }
    })

    if (error) {
        console.error("ServerAction: signUp error:", error.message);
        return { error: error.message }
    }

    console.log("ServerAction: signUp success:", { userId: data.user?.id, session: !!data.session });

    // If session is present (auto-login), sync immediately
    if (data.session) {
        console.log("ServerAction: Auto-login detected, syncing session...");
        await syncUserSession()
    }

    return {
        success: true,
        user: data.user,
        session: data.session,
        needsConfirmation: !data.session && data.user ? true : false
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Clear user data cookie
    const cookieStore = await cookies();
    cookieStore.delete('user_data');

    redirect('/')
}
