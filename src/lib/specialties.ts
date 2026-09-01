import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  BrainCircuit,
  Baby,
  Brain,
  Bone,
  Heart,
  Ear,
  Eye,
  ScanLine,
  Leaf,
  FlaskConical,
  Flower2,
  Ribbon,
  Scissors,
  Activity,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export const  SPECIALTIES = [
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

/** Per-specialty icon so tiles don't all share one glyph. */
export const SPECIALTY_ICONS: Record<Specialty, LucideIcon> = {
  "General Physician": Stethoscope,
  Cardiologist: HeartPulse,
  Dermatologist: Sparkles,
  Neurologist: BrainCircuit,
  Pediatrician: Baby,
  Psychiatrist: Brain,
  Orthopedic: Bone,
  Gynecologist: Heart,
  "ENT Specialist": Ear,
  Ophthalmologist: Eye,
  Psychologist: Brain,
  "Clinical psychologist": Brain,
  "Clinical psychologist (Associate)": Brain,
  "Rehabilitation psychologist": Activity,
  "Rehabilitation counsellor": UserRound,
  Radiologist: ScanLine,
  Ayurveda: Leaf,
  Homeopathy: FlaskConical,
  Naturopathy: Flower2,
  Oncologist: Ribbon,
  "General surgeon": Scissors,
};

/** Icon for a specialty value, with a safe fallback. */
export function specialtyIcon(value: string): LucideIcon {
  return SPECIALTY_ICONS[value as Specialty] ?? Stethoscope;
}
