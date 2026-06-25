export type EligiblePrescriptionItem = {
  id: string;
  category: string;
  appointmentDate: string;
  appointmentTime: string;
  prescriptionUpdatedAt: string | null;
  professionalName: string | null;
};

export type SharedPrescriptionItem = {
  id: string;
  sourceGuestAppointmentId: string;
  category: string;
  appointmentDate: string;
  appointmentTime: string;
  prescriptionUpdatedAt: string | null;
  professionalName: string | null;
  prescriptionHtml: string;
  consentedAt: string;
};

export const MAX_SHARED_PRESCRIPTIONS = 5;
