import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Get in touch with us",
  description:
    "Get in touch with us: questions, concerns, or partnership requests for the HealthHere team—we respond as soon as we can.",
  pathname: "/contact",
  keywords: ["contact HealthHere", "get in touch", "customer support"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
