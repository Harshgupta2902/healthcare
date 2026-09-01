"use client";

import Link from "next/link";
import { Globe2, MessagesSquare, Phone, Mail, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

interface FooterProps {
  className?: string;
}

const columnTitleClass = "text-xs font-bold uppercase tracking-wider text-[#000000]";
const linkClass = "text-sm text-[#6f7f94] transition-colors hover:text-[#2871d4]";

const platformLinks = [
  { label: "Services", href: "/services" },
  { label: "Consultants", href: "/consultants" },
  { label: "Specialists", href: "/specialists" },
  { label: "Support", href: "/support" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer({ className }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/application/enter")) {
    return null;
  }

  const hasMobileStickyCta = pathname?.startsWith("/consultants/");

  return (
    <footer
      className={`w-full border-t border-[#e1e8f2] bg-[#f9fbff] ${className ?? ""}`}
    >
      <div
        className={`mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8 lg:px-16 ${
          hasMobileStickyCta ? "pb-24 lg:pb-8" : ""
        }`}
      >
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 space-y-4 md:col-span-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2871d4]">
                <MessagesSquare className="size-5" aria-hidden />
              </div>
              <span className="font-heading text-2xl font-bold text-[#102b51]">Protealth</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#6f7f94]">
              Clinical authority meets human-centric care. Leading the digital health revolution with
              empathy and precision.
            </p>
            <div className="flex gap-3">
              <Link
                href="/about"
                aria-label="Protealth on the web"
                className="flex size-10 items-center justify-center rounded-full bg-white text-[#6f7f94] ring-1 ring-[#e1e8f2] transition-all hover:bg-[#eef5ff] hover:text-[#2871d4]"
              >
                <Globe2 className="size-5" aria-hidden />
              </Link>
              <Link
                href="/contact"
                aria-label="Contact Protealth"
                className="flex size-10 items-center justify-center rounded-full bg-white text-[#6f7f94] ring-1 ring-[#e1e8f2] transition-all hover:bg-[#eef5ff] hover:text-[#2871d4]"
              >
                <MessagesSquare className="size-5" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4 md:col-span-2">
            <h4 className={columnTitleClass}>Platform</h4>
            <div className="flex flex-col gap-3">
              {platformLinks.map((l) => (
                <Link key={l.label} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4 md:col-span-2">
            <h4 className={columnTitleClass}>Company</h4>
            <div className="flex flex-col gap-3">
              {companyLinks.map((l) => (
                <Link key={l.label} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 space-y-4 md:col-span-4">
            <h4 className={columnTitleClass}>Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+919981322736"
                className="flex items-center gap-3 text-sm text-[#6f7f94] transition-colors hover:text-[#2871d4]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5ff] text-[#2871d4]">
                  <Phone className="size-4" aria-hidden />
                </span>
                +91 99813 22736
              </a>
              <a
                href="mailto:care@protealth.com"
                className="flex items-center gap-3 text-sm text-[#6f7f94] transition-colors hover:text-[#2871d4]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5ff] text-[#2871d4]">
                  <Mail className="size-4" aria-hidden />
                </span>
                care@protealth.com
              </a>
              <div className="flex items-start gap-3 text-sm text-[#6f7f94]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5ff] text-[#2871d4]">
                  <MapPin className="size-4" aria-hidden />
                </span>
                <span>Available for online consultations across India.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e1e8f2] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-[#8390a0]">
            © {new Date().getFullYear()} Protealth. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-[#8390a0] transition-colors hover:text-[#2871d4]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
