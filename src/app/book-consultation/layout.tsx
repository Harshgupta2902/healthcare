import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Make an appointment",
  description:
    "Make an appointment on HealthHere: choose your health focus and specialty, then complete a guided booking flow for a consultation with verified medical professionals.",
  pathname: "/book-consultation",
  keywords: ["make an appointment", "book consultation", "HealthHere booking", "telehealth appointment"],
});

export default function BookConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
