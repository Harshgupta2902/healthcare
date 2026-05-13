import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "How can we support you today?",
  description:
    "How can we support you today? Search guides and FAQs for appointments, account security, billing, prescriptions, and using the HealthHere help center.",
  pathname: "/support",
  keywords: ["HealthHere support", "help center", "FAQ", "how can we support you"],
});

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
