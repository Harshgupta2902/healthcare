"use client";

import Link from "next/link";
import { Globe2, MessagesSquare } from "lucide-react";
import { usePathname } from "next/navigation";

interface FooterProps {
  className?: string;
}

const headingClass = "font-heading text-2xl font-bold text-lp-cta-bg";
const columnTitleClass = "font-sans text-sm font-semibold uppercase tracking-wide text-lp-cta-bg";
const linkClass = "text-sm text-lp-on-surface-variant transition-colors hover:text-lp-brand";

export default function Footer({ className }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/application/enter")) {
    return null;
  }

  const hasMobileStickyCta = pathname?.startsWith("/consultants/");

  return (
    <footer
      className={`w-full border-t border-lp-outline-variant/50 bg-lp-surface-container-lowest pt-16 pb-8 ${className ?? ""}`}
    >
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 sm:px-8 md:grid-cols-12 md:gap-6 lg:px-16 ${hasMobileStickyCta ? "pb-10 lg:pb-0" : ""}`}
      >
        <div className="space-y-6 md:col-span-4">
          <div className={headingClass}>HealthHere</div>
          <p className="max-w-xs text-sm leading-relaxed text-lp-on-surface-variant">
            © {new Date().getFullYear()} HealthHere. Clinical authority meets human-centric care. Leading the digital
            health revolution with empathy and precision.
          </p>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h4 className={columnTitleClass}>Platform</h4>
          <div className="flex flex-col gap-3">
            <Link href="/services" className={linkClass}>
              Services
            </Link>
            <Link href="/consultants" className={linkClass}>
              Consultants
            </Link>
            <Link href="/support" className={linkClass}>
              Support
            </Link>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h4 className={columnTitleClass}>Company</h4>
          <div className="flex flex-col gap-3">
            <Link href="/about" className={linkClass}>
              Careers
            </Link>
            <Link href="/contact" className={linkClass}>
              Contact
            </Link>
            <Link href="/contact" className={linkClass}>
              Press
            </Link>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h4 className={columnTitleClass}>Legal</h4>
          <div className="flex flex-col gap-3">
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={linkClass}>
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h4 className={columnTitleClass}>Social</h4>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="flex size-10 items-center justify-center rounded-full bg-lp-surface-container text-lp-on-surface-variant transition-all hover:bg-lp-brand/10 hover:text-lp-brand"
              aria-label="HealthHere on the web"
            >
              <Globe2 className="size-5" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="flex size-10 items-center justify-center rounded-full bg-lp-surface-container text-lp-on-surface-variant transition-all hover:bg-lp-brand/10 hover:text-lp-brand"
              aria-label="Contact HealthHere"
            >
              <MessagesSquare className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
