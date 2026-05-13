import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Create account",
  description:
    "Create account on HealthHere as a patient or verified healthcare provider—join the network and start booking or delivering care.",
  pathname: "/register",
  keywords: ["HealthHere register", "create account", "join the network"],
  robots: ROBOTS_NOINDEX,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
