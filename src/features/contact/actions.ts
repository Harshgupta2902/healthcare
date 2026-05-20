"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
    assertContactRateLimits,
    deviceHashZodField,
    getClientIpFromHeaders,
} from "@/lib/device-rate-limit";
import { contactSchema, type ContactFormValues } from "./schema";

const contactSubmitSchema = contactSchema.extend({
    deviceHash: deviceHashZodField,
});

export type ContactSubmitInput = z.infer<typeof contactSubmitSchema>;

export async function submitContactForm(formData: ContactSubmitInput) {
    const validatedFields = contactSubmitSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, subject, message, deviceHash } = validatedFields.data;

    const headerStore = await headers();
    const clientIp = getClientIpFromHeaders(headerStore);
    const rateLimit = await assertContactRateLimits({
        ip: clientIp,
        deviceHash,
        email,
    });
    if (!rateLimit.ok) {
        return {
            error: rateLimit.error,
            code: rateLimit.reason,
        };
    }

    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from("contact_messages")
            .insert([
                {
                    email,
                    subject,
                    message,
                },
            ]);

        if (error) {
            console.error("Supabase error:", error);
            return { error: "Failed to send message. Please try again later." };
        }

        return { success: true };
    } catch (error) {
        console.error("Catch error:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
}
