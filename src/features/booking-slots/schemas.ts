import { z } from "zod";

export const professionalDateSchema = z.object({
  professionalId: z.string().uuid("Invalid consultant."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
});

export const reserveSlotSchema = z.object({
  professionalId: z.string().uuid("Invalid consultant."),
  slotStartAt: z.string().min(1, "Invalid slot time."),
});

export const holdIdSchema = z.object({
  holdId: z.string().uuid("Invalid slot hold."),
});

export const activeHoldSchema = z.object({
  professionalId: z.string().uuid("Invalid consultant."),
});
