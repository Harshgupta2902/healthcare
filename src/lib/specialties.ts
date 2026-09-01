export const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychologist",
  "Clinical psychologist",
  "Clinical psychologist (Associate)",
  "Rehabilitation psychologist",
  "Rehabilitation counsellor",
  "Radiologist",
  "Ayurveda",
  "Homeopathy",
  "Naturopathy",
  "Oncologist",
  "General surgeon",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

/** Sentinel value used by filters to mean "no specialty filter". */
export const ALL_SPECIALTIES = "all" as const;

/**
 * Human-friendly label for a specialty value. Currently identity, but kept as a
 * helper so callers never format specialty strings ad-hoc.
 */
export function specialtyLabel(value: string): string {
  if (value === ALL_SPECIALTIES) return "All Specialties";
  return value;
}

/** Builds the consultants directory URL filtered by a specialty. */
export function consultantsHrefForSpecialty(value: string): string {
  if (value === ALL_SPECIALTIES) return "/consultants";
  return `/consultants?specialty=${encodeURIComponent(value)}`;
}
