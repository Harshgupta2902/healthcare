"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Share2, Globe2, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/features/client/actions";

interface FooterProps {
  className?: string;
}

const labelClass =
  "font-heading text-sm font-bold uppercase tracking-wider text-lp-on-surface mb-2 block";
const linkClass =
  "text-sm text-lp-on-surface-variant transition-colors hover:text-lp-brand";

export default function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  if (pathname?.startsWith("/application/enter")) {
    return null;
  }

  if (pathname === "/register" || pathname?.startsWith("/register/")) {
    return null;
  }

  const hasMobileStickyCta = pathname?.startsWith("/consultants/");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribeNewsletter(email.trim());

      if (result.success) {
        setIsSuccess(true);
        setEmail("");
        if (result.action === "resubscribed") {
          toast.success("Welcome back! You're subscribed again.");
        } else {
          toast.success("Thanks for subscribing! Check your email for confirmation.");
        }
      } else {
        setError(result.error);
        toast.error(result.error);
      }

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      className={`w-full border-t border-lp-outline-variant/50 bg-lp-surface-container-lowest ${className ?? ""}`}
    >
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-5 pb-12 pt-16 sm:px-8 md:grid-cols-4 lg:px-16 ${hasMobileStickyCta ? "pb-22 lg:pb-12" : ""}`}
      >
        <div className="flex flex-col gap-4">
          <span className="font-heading text-xl font-bold text-lp-brand sm:text-2xl">HealthHere</span>
          <p className="text-sm leading-relaxed text-lp-on-surface-variant">
            Clinical precision in every care touchpoint. Empowering providers and patients through high-tech,
            human-centric design.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Quick Links</h5>
          <Link href="/services" className={linkClass}>
            Services
          </Link>
          <Link href="/consultants" className={linkClass}>
            Consultants
          </Link>
          <Link href="/how-it-works" className={linkClass}>
            How it works
          </Link>
          <Link href="/sitemap.xml" className={linkClass}>
            Sitemap
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Resources</h5>
          <Link href="/support" className={linkClass}>
            Support Center
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact Us
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className={labelClass}>Stay Updated</h5>
          <p className="mb-1 text-sm text-lp-on-surface-variant">Get clinical insights and updates.</p>
          {isSuccess ? (
            <div className="rounded-lg border border-lp-outline-variant/40 bg-lp-surface-container px-3 py-2">
              <p className="text-sm font-medium text-lp-on-surface">Successfully subscribed.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={`rounded-lg border-lp-outline-variant bg-lp-surface text-sm focus-visible:ring-2 focus-visible:ring-lp-brand ${error ? "border-destructive" : ""}`}
                aria-describedby={error ? "footer-email-error" : undefined}
                aria-label="Email address for newsletter"
              />
              {error ? (
                <p id="footer-email-error" className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-lp-cta-bg px-6 py-2 text-sm font-semibold tracking-wide text-lp-on-brand hover:opacity-90"
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="w-full border-t border-lp-outline-variant/20 py-4">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-16">
          <p className="text-sm font-semibold tracking-wide text-lp-on-surface-variant">
            Designed with clinical precision for the future of healthcare.
          </p>
          <p className="mt-2 text-xs text-lp-on-surface-variant/80">© {new Date().getFullYear()} HealthHere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
