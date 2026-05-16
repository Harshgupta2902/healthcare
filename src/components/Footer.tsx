"use client";

import Link from "next/link";
import { Share2, Globe2, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";

interface FooterProps {
  className?: string;
}

const labelClass =
  "font-sans text-sm font-semibold uppercase tracking-wider text-lp-on-surface mb-2 block";
const linkClass =
  "text-sm text-lp-on-surface-variant transition-colors hover:text-lp-brand";

export default function Footer({ className }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/application/enter")) {
    return null;
  }

  if (pathname === "/register" || pathname?.startsWith("/register/")) {
    return null;
  }

  const hasMobileStickyCta = pathname?.startsWith("/consultants/");

  return (
    <footer
      className={`w-full border-t border-lp-outline-variant/50 bg-lp-surface-container-lowest ${className ?? ""}`}
    >
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 pb-12 pt-16 sm:px-8 md:grid-cols-4 lg:px-16 ${hasMobileStickyCta ? "pb-22 lg:pb-12" : ""}`}
      >
        <div className="flex flex-col gap-4">
          <span className="font-heading text-xl font-bold text-lp-brand sm:text-2xl">HealthHere</span>
          <p className="text-sm leading-relaxed text-lp-on-surface-variant">
            © {new Date().getFullYear()} HealthHere. All rights reserved. Clinical precision in every care touchpoint.
            Empowering providers and patients through high-tech, human-centric design.
          </p>
          <div className="flex gap-4 text-lp-brand">
            <Link href="/contact" className="transition-opacity hover:opacity-80" aria-label="Contact us">
              <Share2 className="size-5" aria-hidden />
            </Link>
            <Link href="/about" className="transition-opacity hover:opacity-80" aria-label="About HealthHere">
              <Globe2 className="size-5" aria-hidden />
            </Link>
            <Link href="/services" className="transition-opacity hover:opacity-80" aria-label="Medical services">
              <Stethoscope className="size-5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Platform</h5>
          <Link href="/services" className={linkClass}>
            Services
          </Link>
          <Link href="/consultants" className={linkClass}>
            Consultants
          </Link>
          <Link href="/how-it-works" className={linkClass}>
            How it works
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Company</h5>
          <Link href="/support" className={linkClass}>
            Support
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact Us
          </Link>
          <Link href="/sitemap.xml" className={linkClass}>
            Sitemap
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Legal</h5>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
          <Link href="/privacy" className={linkClass}>
            Cookie Policy
          </Link>
        </div>
      </div>

      <div className="w-full border-t border-lp-outline-variant/20 py-4">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-16">
          <p className="text-sm font-semibold tracking-wide text-lp-on-surface-variant">
            Designed with clinical precision for the future of healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
}
