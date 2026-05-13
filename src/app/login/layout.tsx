import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in",
  description:
    "Securely sign in to your HealthHere account to manage appointments, messages, and your care profile.",
  pathname: "/login",
  keywords: ["HealthHere login", "patient account", "healthcare sign in"],
  robots: ROBOTS_NOINDEX,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
