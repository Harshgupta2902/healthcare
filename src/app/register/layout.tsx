import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Create account",
  description:
    "Create your HealthHere account to book consultations, message verified professionals, and keep your health information organized.",
  pathname: "/register",
  keywords: ["HealthHere register", "patient signup", "healthcare account"],
  robots: ROBOTS_NOINDEX,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
