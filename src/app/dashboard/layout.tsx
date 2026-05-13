import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your dashboard",
  description:
    "Your dashboard on HealthHere: manage appointments, prescriptions, medical profile, insurance, and account settings in one place.",
  pathname: "/dashboard",
  keywords: ["HealthHere dashboard", "patient portal", "your dashboard"],
  robots: ROBOTS_NOINDEX,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
