export type BookingFormPrefill = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number;
  city?: string;
  state?: string;
};

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: parts[0]! };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function ageFromDateOfBirth(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth.includes("T") ? dateOfBirth : `${dateOfBirth}T12:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  if (age < 0 || age > 120) return null;
  return age;
}

/** Booking form expects 10-digit national mobile (India). */
export function normalizeBookingPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return null;
}
