import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Medical specialists",
  description:
    "Explore medical specialties on HealthHere and find verified professionals aligned with your health needs.",
  pathname: "/specialists",
  keywords: ["medical specialists", "healthcare specialties", "find a doctor", "HealthHere"],
});

export default function SpecialistsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
