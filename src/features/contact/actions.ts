"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactFormValues } from "./schema";

export async function submitContactForm(formData: ContactFormValues) {
    // Validate data with Zod
    const validatedFields = contactSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, subject, message } = validatedFields.data;
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
