"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fetchGuestAppointmentProfessionalMeta } from "@/lib/guest-appointment-professional-meta";

const assistantContextSchema = z.object({}).optional();

type AssistantAppointment = {
    id: string;
    kind: "client_request" | "professional_guest" | "professional_consultation";
    title: string;
    status?: string | null;
    category?: string | null;
    appointmentDate?: string | null;
    appointmentTime?: string | null;
    createdAt?: string | null;
    location?: string | null;
    personName?: string | null;
    professionalName?: string | null;
    hasPrescription: boolean;
    prescriptionUpdatedAt?: string | null;
    prescriptionHighlights: string[];
};

function stripHtmlToText(html: string | null | undefined) {
    if (!html) return "";
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();
}

function buildPrescriptionHighlights(html: string | null | undefined) {
    const text = stripHtmlToText(html);
    if (!text) return [];

    return text
        .split(/\n|(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 2)
        .slice(0, 6)
        .map((line) => (line.length > 140 ? `${line.slice(0, 137)}...` : line));
}

function sortByAppointmentTimeDesc(a: AssistantAppointment, b: AssistantAppointment) {
    const aKey = `${a.appointmentDate || ""}T${a.appointmentTime || "00:00"}`;
    const bKey = `${b.appointmentDate || ""}T${b.appointmentTime || "00:00"}`;
    return bKey.localeCompare(aKey);
}

export async function getAssistantContext(input?: unknown) {
    const parsed = assistantContextSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: "Invalid assistant request." };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: true as const,
            isAuthenticated: false,
            role: "guest" as const,
            displayName: null,
            appointments: [] as AssistantAppointment[],
        };
    }

    const { data: userRow } = await supabase
        .from("users")
        .select("name, email, role")
        .eq("id", user.id)
        .single();

    const role = (userRow?.role || user.user_metadata?.role || "client") as "client" | "professional" | "admin";
    const displayName = userRow?.name || user.user_metadata?.name || user.email || "there";

    if (role === "professional") {
        const [{ data: guestRows }, { data: appointmentRows }] = await Promise.all([
            supabase
                .from("guest_appointments")
                .select("id, first_name, last_name, category, state, city, appointment_date, appointment_time, message, created_at, prescription_html, prescription_updated_at")
                .eq("professional_id", user.id)
                .order("appointment_date", { ascending: false })
                .order("appointment_time", { ascending: false })
                .limit(8),
            supabase
                .from("appointments")
                .select("id, appointment_type, status, start_time, end_time, notes, created_at, client:users!appointments_client_id_fkey(name, email)")
                .eq("professional_id", user.id)
                .order("start_time", { ascending: false })
                .limit(8),
        ]);

        const guestAppointments: AssistantAppointment[] = (guestRows || []).map((row: any) => ({
            id: row.id,
            kind: "professional_guest",
            title: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Guest booking",
            category: row.category || null,
            appointmentDate: row.appointment_date || null,
            appointmentTime: row.appointment_time || null,
            createdAt: row.created_at || null,
            location: [row.city, row.state].filter(Boolean).join(", ") || null,
            personName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Guest",
            hasPrescription: Boolean(row.prescription_html),
            prescriptionUpdatedAt: row.prescription_updated_at || null,
            prescriptionHighlights: buildPrescriptionHighlights(row.prescription_html),
        }));

        const professionalAppointments: AssistantAppointment[] = (appointmentRows || []).map((row: any) => ({
            id: row.id,
            kind: "professional_consultation",
            title: row.appointment_type || "Consultation",
            status: row.status || null,
            category: row.appointment_type || null,
            appointmentDate: row.start_time || null,
            appointmentTime: null,
            createdAt: row.created_at || null,
            personName: row.client?.name || row.client?.email || "Client",
            hasPrescription: false,
            prescriptionHighlights: [],
        }));

        return {
            success: true as const,
            isAuthenticated: true,
            role,
            displayName,
            appointments: [...guestAppointments, ...professionalAppointments].sort(sortByAppointmentTimeDesc).slice(0, 10),
        };
    }

    const { data: guestAppointments } = await supabase
        .from("guest_appointments")
        .select("id, professional_id, category, state, city, appointment_date, appointment_time, message, created_at, prescription_html, prescription_updated_at")
        .eq("created_by", user.id)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(10);

    const professionalIds = Array.from(
        new Set(
            (guestAppointments || [])
                .map((row: any) => row.professional_id)
                .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
        )
    );
    const professionalMeta = await fetchGuestAppointmentProfessionalMeta(supabase, professionalIds);

    const appointments: AssistantAppointment[] = (guestAppointments || []).map((row: any) => {
        const meta = row.professional_id ? professionalMeta[row.professional_id] : undefined;
        return {
            id: row.id,
            kind: "client_request",
            title: meta?.name || "Consultation request",
            category: row.category || meta?.specialization || null,
            appointmentDate: row.appointment_date || null,
            appointmentTime: row.appointment_time || null,
            createdAt: row.created_at || null,
            location: [row.city, row.state].filter(Boolean).join(", ") || null,
            professionalName: meta?.name || null,
            hasPrescription: Boolean(row.prescription_html),
            prescriptionUpdatedAt: row.prescription_updated_at || null,
            prescriptionHighlights: buildPrescriptionHighlights(row.prescription_html),
        };
    });

    return {
        success: true as const,
        isAuthenticated: true,
        role,
        displayName,
        appointments,
    };
}
