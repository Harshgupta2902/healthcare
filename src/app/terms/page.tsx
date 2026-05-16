import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { TermsPageContent } from "./TermsPageContent";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms for using HealthHere: rules and responsibilities for the website, patient features, professional tools, and admin services—including emergency care and medical information disclaimers.",
  pathname: "/terms",
  keywords: ["HealthHere terms", "terms of service", "platform rules"],
});

export default function TermsPage() {
  return <TermsPageContent />;
}
