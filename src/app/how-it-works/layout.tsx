import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "How it works",
  description:
    "Learn how HealthHere connects you with verified professionals—from discovery and booking to follow-up and ongoing support.",
  pathname: "/how-it-works",
  keywords: ["how HealthHere works", "online healthcare steps", "book a specialist"],
});

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
