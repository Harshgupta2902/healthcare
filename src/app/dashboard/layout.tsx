import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your dashboard",
  description:
    "Your private HealthHere dashboard for appointments, care updates, and account settings.",
  pathname: "/dashboard",
  keywords: ["HealthHere dashboard", "patient portal"],
  robots: ROBOTS_NOINDEX,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
