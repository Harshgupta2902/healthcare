import type { Metadata } from "next";
import { buildHomeMetadata } from "@/lib/seo/page-metadata";
import { HeroSection } from "./home/hero-section";
import { SpecialtiesSection } from "./home/specialties-section";
import { ServicesBentoSection } from "./home/services-bento-section";
import { HomeCtaSection } from "./home/home-cta-section";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";

export const metadata: Metadata = buildHomeMetadata();

export default function Page() {
  return (
    <div className="flex flex-1 flex-col w-full min-h-0 overflow-hidden bg-lp-surface text-base font-sans text-lp-on-surface selection:bg-lp-brand/15 selection:text-lp-on-surface">
      <HeroSection />
      <SpecialtiesSection />
      <ServicesBentoSection />
      <HomeCtaSection />
      <NewsletterSubscribe inputId="home-newsletter-email" />
    </div>
  );
}
