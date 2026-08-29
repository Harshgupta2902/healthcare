import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "How Protealth works",
  description:
    "How Protealth works: a step-by-step look at discovering specialists, booking consultations, and getting ongoing support on the platform.",
  pathname: "/how-it-works",
  keywords: ["how Protealth works", "platform guide", "book a specialist"],
});

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
