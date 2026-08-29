import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Appointment Requested",
  description:
    "Your consultation request was received. Protealth will confirm your appointment and notify you by email and WhatsApp.",
  pathname: "/book-consultation/success",
  keywords: ["appointment confirmation", "booking success", "Protealth consultation"],
});

export default function BookConsultationSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
