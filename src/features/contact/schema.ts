import { z } from "zod";

export const contactSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
