import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Book a consultation",
  description:
    "Request a consultation with verified medical professionals on HealthHere. Share your concern, choose a specialty, and we will help coordinate next steps.",
  pathname: "/book-consultation",
  keywords: ["book doctor online", "medical consultation", "HealthHere booking", "telehealth appointment"],
});

export default function BookConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
