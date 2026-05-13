import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Help & support",
  description:
    "Get help using HealthHere: account access, appointments, privacy, and how to reach our support team.",
  pathname: "/support",
  keywords: ["HealthHere help", "support", "FAQ", "healthcare platform help"],
});

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
