import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { PrivacyPageContent } from "./PrivacyPageContent";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Your privacy matters: how Protealth handles information when you use our website, services, forms, dashboards, and communications—and how we protect healthcare-related data.",
  pathname: "/privacy",
  keywords: ["Protealth privacy", "your privacy matters", "health data protection"],
});

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
