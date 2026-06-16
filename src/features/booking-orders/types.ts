export type BookingOrderStatus = "pending" | "processing" | "confirmed" | "failed";

export type BookingOrderFailureReason =
  | "expired"
  | "payment_declined"
  | "payment_error"
  | "fulfillment_error"
  | "cancelled";

export type BookingSnapshot = {
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  email: string;
  category: string;
  state: string;
  city: string;
  date: string;
  time: string;
  message: string;
  deviceHash: string;
};

export type BookingOrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  professional_id: string;
  amount_paise: number;
  currency: string;
  status: BookingOrderStatus;
  failure_reason: BookingOrderFailureReason | null;
  booking_snapshot: BookingSnapshot;
  guest_appointment_id: string | null;
  payment_provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  expires_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CheckoutOrderView = {
  id: string;
  orderNumber: string;
  status: BookingOrderStatus;
  failureReason: BookingOrderFailureReason | null;
  amountPaise: number;
  currency: string;
  expiresAt: string;
  snapshot: BookingSnapshot;
  consultantName: string;
  consultantSpecialization: string | null;
  guestAppointmentId: string | null;
};

export type ClientOrderHistoryItem = {
  id: string;
  orderNumber: string;
  status: BookingOrderStatus;
  failureReason: BookingOrderFailureReason | null;
  amountPaise: number;
  consultantName: string;
  appointmentDate: string;
  appointmentTime: string;
  createdAt: string;
  guestAppointmentId: string | null;
};

export type ProfessionalPaymentItem = {
  id: string;
  clientId: string;
  professionalId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
  clientName?: string;
};
