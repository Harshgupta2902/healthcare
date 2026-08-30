import type { Metadata } from "next";
import { buildHomeMetadata } from "@/lib/seo/page-metadata";
import { HeroSection } from "./home/hero-section";
import { SpecialistsSection } from "./home/specialists-section";
import { ConsultationSection } from "./home/consultation-section";
import { CtaSection } from "./home/cta-section";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";

export const metadata: Metadata = buildHomeMetadata();

export default function Page() {
  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden bg-white">
      <HeroSection />
      <SpecialistsSection />
      <ConsultationSection />
      <CtaSection />
      <NewsletterSubscribe inputId="home-newsletter-email" />
    </div>
  );
}
