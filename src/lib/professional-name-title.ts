/** Salutation options for healthcare providers (stored in professional_profiles.name_title). */
export const PROFESSIONAL_NAME_TITLES = [
  "Dr.",
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss",
  "Prof.",
  "Mx.",
] as const

export type ProfessionalNameTitle = (typeof PROFESSIONAL_NAME_TITLES)[number]

/** Satisfies Zod `z.enum([...])` (non-empty tuple). */
export const PROFESSIONAL_NAME_TITLES_ZOD: [ProfessionalNameTitle, ...ProfessionalNameTitle[]] = [
  ...PROFESSIONAL_NAME_TITLES,
]

export function formatProfessionalDisplayName(
  name: string | null | undefined,
  nameTitle: string | null | undefined
): string {
  const n = (name ?? "").trim()
  if (!n) return ""
  const t = (nameTitle ?? "").trim()
  if (!t) return n
  return `${t} ${n}`.trim()
}
