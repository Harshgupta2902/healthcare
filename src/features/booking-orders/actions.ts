"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  assertGuestBookingRateLimits,
  getClientIpFromHeaders,
} from "@/lib/device-rate-limit";
import { zodFirstError } from "@/lib/server-action-result";
import { fetchGuestAppointmentProfessionalMeta } from "@/lib/guest-appointment-professional-meta";
import { formatProfessionalDisplayName } from "@/lib/professional-name-title";
import { fetchBookingSettings } from "@/features/booking-slots/actions";
import { verifySlotHoldForBooking } from "@/features/booking-slots/actions";
import { meetingEndTimeFromStart } from "@/lib/booking/slots";
import { PAYMENT_PROVIDER, getPublicRazorpayKeyId } from "./lib/constants";
import { generateOrderNumber } from "./lib/order-number";
import { buildCheckoutHref } from "./lib/order-ref";
import { getPaymentProvider } from "./lib/payment-providers";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from "./lib/payment-providers/razorpay-server";
import {
  createBookingOrderSchema,
  finalizeOrderSchema,
  mockPaymentOutcomeSchema,
  orderIdSchema,
  orderRefSchema,
  razorpayVerifyPaymentSchema,
} from "./schemas";
import type {
  BookingOrderFailureReason,
  BookingOrderRow,
  BookingSnapshot,
  CheckoutOrderView,
  ClientOrderHistoryItem,
} from "./types";

async function requireAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  return { ok: true as const, supabase, user };
}

async function expireStaleOrders(supabase: Awaited<ReturnType<typeof createClient>>) {
  await supabase.rpc("expire_stale_booking_orders");
}

async function patchOrderStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  expected: string,
  next: string,
  extras?: {
    failureReason?: BookingOrderFailureReason | null;
    guestAppointmentId?: string | null;
    providerOrderId?: string | null;
    providerPaymentId?: string | null;
    paidAt?: string | null;
    confirmedAt?: string | null;
  },
) {
  const { data, error } = await supabase.rpc("patch_booking_order_status", {
    p_order_id: orderId,
    p_expected_status: expected,
    p_new_status: next,
    p_failure_reason: extras?.failureReason ?? null,
    p_guest_appointment_id: extras?.guestAppointmentId ?? null,
    p_provider_order_id: extras?.providerOrderId ?? null,
    p_provider_payment_id: extras?.providerPaymentId ?? null,
    p_paid_at: extras?.paidAt ?? null,
    p_confirmed_at: extras?.confirmedAt ?? null,
  });

  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function loadOrderForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("booking_orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as BookingOrderRow | null;
}

async function resolveConsultantLabel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  professionalId: string,
) {
  const meta = await fetchGuestAppointmentProfessionalMeta(supabase, [professionalId]);
  const prof = meta[professionalId];
  if (!prof?.name) return { name: "Your specialist", specialization: null as string | null };

  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("name_title, specialization")
    .eq("user_id", professionalId)
    .maybeSingle();

  const formatted = formatProfessionalDisplayName(prof.name, profile?.name_title ?? null);
  return {
    name: formatted || prof.name,
    specialization: (profile?.specialization as string | null) ?? null,
  };
}

async function insertGuestAppointmentFromSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  professionalId: string,
  snapshot: BookingSnapshot,
  extras?: {
    slotReservationId?: string | null;
    meetingDurationMinutes?: number;
    meetingEndTime?: string;
  },
) {
  const payload = {
    first_name: snapshot.firstName,
    last_name: snapshot.lastName,
    age: snapshot.age,
    phone: snapshot.phone,
    email: snapshot.email,
    category: snapshot.category,
    state: snapshot.state,
    city: snapshot.city,
    appointment_date: snapshot.date,
    appointment_time: snapshot.time,
    meeting_duration_minutes: extras?.meetingDurationMinutes ?? null,
    meeting_end_time: extras?.meetingEndTime ?? null,
    slot_reservation_id: extras?.slotReservationId ?? null,
    message: snapshot.message?.trim() ? snapshot.message.trim() : null,
    created_by: userId,
    professional_id: professionalId,
  };

  const { data, error } = await supabase
    .from("guest_appointments")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

function mapOrderToCheckoutView(
  row: BookingOrderRow,
  consultantName: string,
  consultantSpecialization: string | null,
): CheckoutOrderView {
  const razorpayKeyId =
    PAYMENT_PROVIDER === "razorpay" ? getPublicRazorpayKeyId() : null;

  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    failureReason: row.failure_reason,
    amountPaise: row.amount_paise,
    currency: row.currency,
    expiresAt: row.expires_at,
    snapshot: row.booking_snapshot,
    consultantName,
    consultantSpecialization,
    guestAppointmentId: row.guest_appointment_id,
    paymentProvider: PAYMENT_PROVIDER,
    razorpayKeyId,
  };
}

type PendingOrderValidation =
  | { ok: true; row: BookingOrderRow }
  | { ok: false; error: string };

async function validatePendingCheckoutOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  userId: string,
): Promise<PendingOrderValidation> {
  await expireStaleOrders(supabase);

  const row = await loadOrderForUser(supabase, orderId, userId);
  if (!row) return { ok: false, error: "Order not found." };

  if (row.status === "failed") {
    return {
      ok: false,
      error:
        row.failure_reason === "expired"
          ? "This order has expired. Please book again."
          : "This order is no longer active.",
    };
  }

  if (row.status !== "pending") {
    return { ok: false, error: "This order is not awaiting payment." };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await patchOrderStatus(supabase, row.id, "pending", "failed", {
      failureReason: "expired",
    });
    return { ok: false, error: "This order has expired. Please book again." };
  }

  return { ok: true, row };
}

async function fulfillBookingOrderAfterPayment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  row: BookingOrderRow,
  transactionId: string | null,
) {
  const zeroFee = row.amount_paise <= 0;

  if (!zeroFee) {
    const paidOk = await patchOrderStatus(supabase, row.id, "pending", "processing", {
      providerPaymentId: transactionId,
      paidAt: new Date().toISOString(),
    });
    if (!paidOk) return { error: "Could not update order after payment." };
  } else {
    const paidOk = await patchOrderStatus(supabase, row.id, "pending", "processing", {
      paidAt: new Date().toISOString(),
    });
    if (!paidOk) return { error: "Could not start booking." };
  }

  try {
    const bookingSettings = await fetchBookingSettings(supabase);
    const meetingEndTime = meetingEndTimeFromStart(
      row.booking_snapshot.time,
      bookingSettings.meeting_duration_minutes,
    );

    const appointmentId = await insertGuestAppointmentFromSnapshot(
      supabase,
      userId,
      row.professional_id,
      row.booking_snapshot,
      {
        slotReservationId: row.slot_reservation_id,
        meetingDurationMinutes: bookingSettings.meeting_duration_minutes,
        meetingEndTime,
      },
    );

    if (row.slot_reservation_id) {
      const { data: confirmed } = await supabase.rpc("confirm_slot_reservation", {
        p_hold_id: row.slot_reservation_id,
        p_guest_appointment_id: appointmentId,
      });
      if (!confirmed) {
        throw new Error("Could not confirm your slot reservation.");
      }
    }

    const linked = await patchOrderStatus(supabase, row.id, "processing", "processing", {
      guestAppointmentId: appointmentId,
      providerPaymentId: zeroFee ? null : transactionId,
    });

    if (!linked) {
      return { error: "Could not link appointment to order." };
    }

    return {
      success: true as const,
      orderId: row.id,
      guestAppointmentId: appointmentId,
      transactionId: zeroFee ? null : transactionId,
    };
  } catch (e) {
    await patchOrderStatus(supabase, row.id, "processing", "failed", {
      failureReason: "fulfillment_error",
    });
    return {
      error: e instanceof Error ? e.message : "Could not create your appointment.",
    };
  }
}

export async function createBookingOrder(form: unknown) {
  const validated = createBookingOrderSchema.safeParse(form);
  if (!validated.success) {
    return { error: zodFirstError(validated.error) };
  }

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rateLimit = await assertGuestBookingRateLimits({
    ip: clientIp,
    deviceHash: validated.data.deviceHash,
    email: validated.data.email,
  });
  if (!rateLimit.ok) {
    return { error: rateLimit.error, code: rateLimit.reason };
  }

  const { data: feeRow, error: feeError } = await auth.supabase
    .from("professional_profiles")
    .select("consultation_fee")
    .eq("user_id", validated.data.professionalId)
    .maybeSingle();

  if (feeError) {
    return { error: "Could not load consultation fee." };
  }

  const amountPaise = Math.max(0, (feeRow?.consultation_fee as number | null) ?? 0);

  const holdCheck = await verifySlotHoldForBooking(
    auth.supabase,
    auth.user.id,
    validated.data.holdId,
    validated.data.professionalId,
    validated.data.date,
    validated.data.time,
  );
  if (!holdCheck.ok) return { error: holdCheck.error };

  const expiresAt = holdCheck.hold.expiresAt;

  const snapshot: BookingSnapshot = {
    firstName: validated.data.firstName,
    lastName: validated.data.lastName,
    age: validated.data.age,
    phone: validated.data.phone,
    email: validated.data.email,
    category: validated.data.category,
    state: validated.data.state,
    city: validated.data.city,
    date: validated.data.date,
    time: validated.data.time,
    message: validated.data.message ?? "",
    deviceHash: validated.data.deviceHash,
  };

  const { data, error } = await auth.supabase
    .from("booking_orders")
    .insert({
      order_number: generateOrderNumber(),
      user_id: auth.user.id,
      professional_id: validated.data.professionalId,
      amount_paise: amountPaise,
      currency: "INR",
      status: "pending",
      booking_snapshot: snapshot,
      payment_provider: PAYMENT_PROVIDER,
      expires_at: expiresAt,
      slot_reservation_id: validated.data.holdId,
    })
    .select("id, order_number")
    .single();

  if (error) {
    console.error("[createBookingOrder]", error);
    return { error: error.message };
  }

  await auth.supabase
    .from("professional_slot_reservations")
    .update({ booking_order_id: data.id as string, updated_at: new Date().toISOString() })
    .eq("id", validated.data.holdId)
    .eq("status", "held");

  return {
    success: true as const,
    orderId: data.id as string,
    orderNumber: data.order_number as string,
    checkoutHref: buildCheckoutHref(data.id as string),
    amountPaise,
    paymentProvider: PAYMENT_PROVIDER,
    razorpayKeyId: PAYMENT_PROVIDER === "razorpay" ? getPublicRazorpayKeyId() : null,
  };
}

export async function getCheckoutOrder(input: unknown) {
  const parsed = orderRefSchema.safeParse(input);
  if (!parsed.success) {
    return { error: zodFirstError(parsed.error) };
  }

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const { decodeOrderRef } = await import("./lib/order-ref");
  const orderId = decodeOrderRef(parsed.data.orderRef);
  if (!orderId) return { error: "Invalid order reference." };

  await expireStaleOrders(auth.supabase);

  const row = await loadOrderForUser(auth.supabase, orderId, auth.user.id);
  if (!row) return { error: "Order not found." };

  const consultant = await resolveConsultantLabel(auth.supabase, row.professional_id);

  return {
    success: true as const,
    order: mapOrderToCheckoutView(row, consultant.name, consultant.specialization),
  };
}

export async function cancelBookingOrder(input: unknown) {
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  await expireStaleOrders(auth.supabase);

  const ok = await patchOrderStatus(
    auth.supabase,
    parsed.data.orderId,
    "pending",
    "failed",
    { failureReason: "cancelled" },
  );

  if (!ok) return { error: "This order can no longer be cancelled." };

  const row = await loadOrderForUser(auth.supabase, parsed.data.orderId, auth.user.id);
  if (row?.slot_reservation_id) {
    await auth.supabase.rpc("release_slot_reservation", {
      p_hold_id: row.slot_reservation_id,
    });
  }

  return { success: true as const };
}

export async function processMockPayment(input: unknown) {
  const parsed = mockPaymentOutcomeSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const validation = await validatePendingCheckoutOrder(
    auth.supabase,
    parsed.data.orderId,
    auth.user.id,
  );
  if (!validation.ok) return { error: validation.error };

  const row = validation.row;

  if (parsed.data.outcome === "declined") {
    await patchOrderStatus(auth.supabase, row.id, "pending", "failed", {
      failureReason: "payment_declined",
    });
    return { success: true as const, declined: true as const };
  }

  const provider = getPaymentProvider();
  const capture = await provider.captureMockPayment(row, "success");
  if (!capture.ok) {
    await patchOrderStatus(auth.supabase, row.id, "pending", "failed", {
      failureReason: capture.reason === "declined" ? "payment_declined" : "payment_error",
    });
    return { error: capture.message ?? "Payment could not be completed." };
  }

  return fulfillBookingOrderAfterPayment(
    auth.supabase,
    auth.user.id,
    row,
    row.amount_paise <= 0 ? null : capture.transactionId,
  );
}

export async function createRazorpayCheckoutOrder(input: unknown) {
  if (PAYMENT_PROVIDER !== "razorpay") {
    return { error: "Razorpay is not enabled for checkout." };
  }

  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const validation = await validatePendingCheckoutOrder(
    auth.supabase,
    parsed.data.orderId,
    auth.user.id,
  );
  if (!validation.ok) return { error: validation.error };

  const row = validation.row;
  if (row.amount_paise <= 0) {
    return { error: "This order does not require payment." };
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: row.amount_paise,
      currency: row.currency,
      receipt: row.order_number,
    });

    const stored = await patchOrderStatus(auth.supabase, row.id, "pending", "pending", {
      providerOrderId: razorpayOrder.orderId,
    });
    if (!stored) return { error: "Could not prepare payment for this order." };

    return {
      success: true as const,
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  } catch (e) {
    console.error("[createRazorpayCheckoutOrder]", e);
    return {
      error: e instanceof Error ? e.message : "Could not create payment order.",
    };
  }
}

export async function verifyRazorpayPayment(input: unknown) {
  if (PAYMENT_PROVIDER !== "razorpay") {
    return { error: "Razorpay is not enabled for checkout." };
  }

  const parsed = razorpayVerifyPaymentSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const validation = await validatePendingCheckoutOrder(
    auth.supabase,
    parsed.data.orderId,
    auth.user.id,
  );
  if (!validation.ok) return { error: validation.error };

  const row = validation.row;

  if (
    row.provider_order_id &&
    row.provider_order_id !== parsed.data.razorpayOrderId
  ) {
    return { error: "Payment order mismatch. Please try again." };
  }

  const signatureValid = verifyRazorpayPaymentSignature({
    razorpayOrderId: parsed.data.razorpayOrderId,
    razorpayPaymentId: parsed.data.razorpayPaymentId,
    razorpaySignature: parsed.data.razorpaySignature,
  });

  if (!signatureValid) {
    await patchOrderStatus(auth.supabase, row.id, "pending", "failed", {
      failureReason: "payment_error",
    });
    return { error: "Payment verification failed. Please try again." };
  }

  return fulfillBookingOrderAfterPayment(
    auth.supabase,
    auth.user.id,
    row,
    parsed.data.razorpayPaymentId,
  );
}

/** Run after meeting pipeline succeeds. */
export async function finalizeBookingOrder(input: unknown) {
  const parsed = finalizeOrderSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const { data, error } = await auth.supabase.rpc("finalize_booking_order", {
    p_order_id: parsed.data.orderId,
    p_guest_appointment_id: parsed.data.guestAppointmentId,
    p_transaction_id: parsed.data.transactionId ?? null,
    p_payment_method: PAYMENT_PROVIDER,
  });

  if (error) {
    console.error("[finalizeBookingOrder]", error);
    return { error: error.message };
  }

  if (!data) return { error: "Order could not be finalized." };
  return { success: true as const };
}

export async function markBookingOrderFulfillmentFailed(input: unknown) {
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return { error: zodFirstError(parsed.error) };

  const auth = await requireAuthUser();
  if (!auth.ok) return { error: auth.error };

  const ok = await patchOrderStatus(
    auth.supabase,
    parsed.data.orderId,
    "processing",
    "failed",
    { failureReason: "fulfillment_error" },
  );

  if (!ok) return { error: "Order could not be updated." };
  return { success: true as const };
}

export async function getClientOrderHistory() {
  const auth = await requireAuthUser();
  if (!auth.ok) return { success: false as const, error: auth.error };

  await expireStaleOrders(auth.supabase);

  const { data, error } = await auth.supabase
    .from("booking_orders")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };

  const rows = (data ?? []) as BookingOrderRow[];
  const professionalIds = Array.from(new Set(rows.map((r) => r.professional_id)));
  const meta = await fetchGuestAppointmentProfessionalMeta(auth.supabase, professionalIds);

  const profileTitles = await Promise.all(
    professionalIds.map(async (id) => {
      const { data: profile } = await auth.supabase
        .from("professional_profiles")
        .select("name_title")
        .eq("user_id", id)
        .maybeSingle();
      return { id, nameTitle: profile?.name_title ?? null };
    }),
  );
  const titleById = Object.fromEntries(profileTitles.map((p) => [p.id, p.nameTitle]));

  const orders: ClientOrderHistoryItem[] = rows.map((row) => {
    const prof = meta[row.professional_id];
    const consultantName = prof?.name
      ? formatProfessionalDisplayName(prof.name, titleById[row.professional_id] ?? null) || prof.name
      : "Consultation";

    return {
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      failureReason: row.failure_reason,
      amountPaise: row.amount_paise,
      consultantName,
      appointmentDate: row.booking_snapshot.date,
      appointmentTime: row.booking_snapshot.time,
      createdAt: row.created_at,
      guestAppointmentId: row.guest_appointment_id,
    };
  });

  return { success: true as const, orders };
}

export async function getProfessionalPayments() {
  const auth = await requireAuthUser();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const { data, error } = await auth.supabase
    .from("payments")
    .select(`*, client:users!payments_client_id_fkey(name)`)
    .eq("professional_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: error.message };

  return {
    success: true as const,
    payments:
      data?.map((pay: Record<string, unknown>) => ({
        id: pay.id as string,
        clientId: pay.client_id as string,
        professionalId: pay.professional_id as string,
        amount: pay.amount as number,
        status: pay.status as string,
        paymentMethod: pay.payment_method as string,
        transactionId: (pay.transaction_id as string | null) ?? null,
        createdAt: pay.created_at as string,
        clientName: (pay.client as { name?: string } | null)?.name,
      })) ?? [],
  };
}
