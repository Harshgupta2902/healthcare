import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Schedule Your Consultation",
  description:
    "Schedule a consultation on Protealth: share your details, location, and preferred time to connect with verified healthcare specialists.",
  pathname: "/book-consultation",
  keywords: ["make an appointment", "book consultation", "Protealth booking", "telehealth appointment"],
});

export default function BookConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
