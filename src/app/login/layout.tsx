import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Welcome back",
  description:
    "Welcome back: enter your credentials to access your HealthHere dashboard, appointments, and secure care tools.",
  pathname: "/login",
  keywords: ["HealthHere login", "welcome back", "secure access"],
  robots: ROBOTS_NOINDEX,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
