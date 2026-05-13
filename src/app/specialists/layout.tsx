import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Medical specialists",
  description:
    "Medical specialists on HealthHere: explore verified experts across specialties, search by city, and find the right clinician for your needs.",
  pathname: "/specialists",
  keywords: ["medical specialists", "verified experts", "find a doctor", "HealthHere"],
});

export default function SpecialistsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
