import type { SupabaseClient } from "@supabase/supabase-js";

export type GuestAppointmentProfessionalMeta = {
    name: string | null;
    email: string | null;
    specialization: string | null;
    qualificationsSummary: string | null;
};

/**
 * Loads user display fields + specialization + degree list for guest appointment cards / PDFs.
 */
export async function fetchGuestAppointmentProfessionalMeta(
    supabase: SupabaseClient,
    professionalIds: string[]
): Promise<Record<string, GuestAppointmentProfessionalMeta>> {
    const out: Record<string, GuestAppointmentProfessionalMeta> = {};
    if (professionalIds.length === 0) return out;

    const [{ data: users }, { data: profiles }, { data: quals }] = await Promise.all([
        supabase.from("users").select("id, name, email").in("id", professionalIds),
        supabase.from("professional_profiles").select("user_id, specialization").in("user_id", professionalIds),
        supabase.from("professional_qualifications").select("professional_id, degree").in("professional_id", professionalIds),
    ]);

    const degreesByProf: Record<string, string[]> = {};
    for (const q of quals || []) {
        const id = q.professional_id as string;
        const deg = (q.degree as string | null)?.trim();
        if (!deg) continue;
        if (!degreesByProf[id]) degreesByProf[id] = [];
        degreesByProf[id].push(deg);
    }

    const specByUser: Record<string, string | null> = {};
    for (const p of profiles || []) {
        specByUser[p.user_id as string] = (p.specialization as string | null) || null;
    }

    for (const u of users || []) {
        const id = u.id as string;
        const rawDegrees = degreesByProf[id] || [];
        const uniqueDegrees = [...new Set(rawDegrees)];
        out[id] = {
            name: (u.name as string | null) ?? null,
            email: (u.email as string | null) ?? null,
            specialization: specByUser[id] ?? null,
            qualificationsSummary: uniqueDegrees.length > 0 ? uniqueDegrees.join(" · ") : null,
        };
    }

    return out;
}
