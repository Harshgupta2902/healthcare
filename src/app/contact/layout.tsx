import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact us",
  description:
    "Contact the HealthHere team for platform support, partnership questions, or help finding the right care pathway.",
  pathname: "/contact",
  keywords: ["contact HealthHere", "healthcare support", "customer service"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
