import { z } from "zod";
import { MAX_SHARED_PRESCRIPTIONS } from "./types";

export const eligiblePrescriptionsQuerySchema = z.object({
  email: z.string().email().optional(),
});

export const attachSharedPrescriptionsSchema = z.object({
  guestAppointmentId: z.string().uuid(),
  sharedPrescriptionIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one prescription to share.")
    .max(MAX_SHARED_PRESCRIPTIONS, `You can share up to ${MAX_SHARED_PRESCRIPTIONS} prescriptions.`),
});

export const guestAppointmentIdSchema = z.object({
  guestAppointmentId: z.string().uuid(),
});

export const bookingPrescriptionShareFieldsSchema = z
  .object({
    sharePrescriptionsConsent: z.boolean().optional().default(false),
    sharedPrescriptionIds: z.array(z.string().uuid()).max(MAX_SHARED_PRESCRIPTIONS).optional().default([]),
  })
  .superRefine((val, ctx) => {
    if (val.sharePrescriptionsConsent && val.sharedPrescriptionIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one prescription to share.",
        path: ["sharedPrescriptionIds"],
      });
    }
    if (!val.sharePrescriptionsConsent && val.sharedPrescriptionIds.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please confirm consent before sharing prescriptions.",
        path: ["sharePrescriptionsConsent"],
      });
    }
  });
