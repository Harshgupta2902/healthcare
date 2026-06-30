import { z } from "zod";
import { deviceHashZodField } from "@/lib/device-rate-limit";
import { MAX_SHARED_PRESCRIPTIONS } from "@/features/prescription-sharing/types";
export const bookingSnapshotSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.coerce.number().int().min(0).max(120),
  phone: z.string().min(10).max(10),
  email: z.string().email(),
  category: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  message: z.string().optional().default(""),
  deviceHash: deviceHashZodField,
});

export const createBookingOrderSchema = bookingSnapshotSchema
  .extend({
    professionalId: z.string().uuid("Please select a consultant before booking."),
    holdId: z.string().uuid("Please select and reserve a time slot before booking."),
    sharePrescriptionsConsent: z.boolean().optional().default(false),
    sharedPrescriptionIds: z
      .array(z.string().uuid())
      .max(MAX_SHARED_PRESCRIPTIONS)
      .optional()
      .default([]),
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

export const orderIdSchema = z.object({
  orderId: z.string().uuid("Invalid order reference."),
});

export const orderRefSchema = z.object({
  orderRef: z.string().min(1, "Missing order reference."),
});

export const mockPaymentOutcomeSchema = z.object({
  orderId: z.string().uuid(),
  outcome: z.enum(["success", "declined"]),
});

export const razorpayVerifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const finalizeOrderSchema = z.object({
  orderId: z.string().uuid(),
  guestAppointmentId: z.string().uuid(),
  transactionId: z.string().optional().nullable(),
});
