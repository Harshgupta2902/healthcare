import { z } from "zod";
import { deviceHashZodField } from "@/lib/device-rate-limit";

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

export const createBookingOrderSchema = bookingSnapshotSchema.extend({
  professionalId: z.string().uuid("Please select a consultant before booking."),
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

export const finalizeOrderSchema = z.object({
  orderId: z.string().uuid(),
  guestAppointmentId: z.string().uuid(),
  transactionId: z.string().optional().nullable(),
});
