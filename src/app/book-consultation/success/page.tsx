import { notFound } from "next/navigation";
import { decodeBookingConfirmationRef } from "@/lib/booking-confirmation-ref";
import { getGuestAppointmentConfirmation } from "../actions";
import { BookConsultationSuccessView } from "./BookConsultationSuccessView";

type PageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function BookConsultationSuccessPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  const appointmentId = decodeBookingConfirmationRef(ref);
  if (!appointmentId) {
    notFound();
  }

  const result = await getGuestAppointmentConfirmation(appointmentId);
  if ("error" in result) {
    notFound();
  }

  return <BookConsultationSuccessView confirmation={result.data} />;
}
