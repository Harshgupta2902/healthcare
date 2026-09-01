import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { ServicesHero } from "./services-hero";
import { ServicesGrid } from "./services-grid";
import { ServicesWhy } from "./services-why";

export const metadata: Metadata = buildPageMetadata({
  title: "Healthcare without limits",
  description:
    "Experience the next generation of digital healthcare on Protealth: simplified medical access, board-certified professionals, and wellbeing-focused services—healthcare without limits.",
  pathname: "/services",
  keywords: ["healthcare without limits", "digital healthcare", "Protealth services", "medical platform"],
});

export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col w-full min-h-0 bg-white">
      <ServicesHero />
      <ServicesGrid />
      <ServicesWhy />
    </div>
  );
}
