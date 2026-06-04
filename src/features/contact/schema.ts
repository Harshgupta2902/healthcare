import { z } from "zod";
import { CONTACT_SUBJECT_OPTIONS } from "./constants";

export const contactSchema = z.object({
    name: z.string().min(2, "Please enter your name"),
    email: z.string().email("Please enter a valid email address"),
    subject: z.enum(CONTACT_SUBJECT_OPTIONS, {
        errorMap: () => ({ message: "Please select a subject" }),
    }),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
