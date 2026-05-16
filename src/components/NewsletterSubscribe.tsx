"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LpButton } from "@/components/ui/lp-button";
import { LpTextField } from "@/components/ui/lp-text-field";
import { subscribeNewsletter } from "@/features/client/actions";

export interface NewsletterSubscribeProps {
  className?: string;
  /** Prefix for the email input `id` (avoids duplicates when multiple instances exist). */
  inputId?: string;
  title?: string;
  description?: string;
  /** Full-width band with background (default). Use `embedded` for a minimal wrapper only. */
  variant?: "band" | "embedded";
}

const DEFAULT_TITLE = "Stay Updated";
const DEFAULT_DESCRIPTION = "Get the latest clinical insights and platform updates.";

export function NewsletterSubscribe({
  className,
  inputId = "newsletter-email",
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  variant = "band",
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

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

  const content = (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row lg:px-16">
      <div className="text-center md:text-left">
        <h2 className="font-heading text-2xl font-semibold text-lp-on-surface">{title}</h2>
        <p className="mt-1 font-sans text-base text-lp-on-surface-variant">{description}</p>
      </div>

      {isSuccess ? (
        <div className="w-full rounded-lg border border-lp-outline-variant/40 bg-lp-surface-container-lowest px-4 py-3 md:max-w-md">
          <p className="text-center text-sm font-medium text-lp-on-surface md:text-left">
            Successfully subscribed. Check your inbox for confirmation.
          </p>
        </div>
      ) : (
        <div className="w-full md:max-w-xl">
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="min-w-0 flex-1 [&_.space-y-2]:space-y-0 sm:max-w-80">
              <LpTextField
                id={inputId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                error={error}
                rounding="lg"
                surface="white"
                aria-label="Email address for newsletter"
              />
            </div>
            <LpButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="shrink-0 px-6 py-3 normal-case tracking-normal"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </LpButton>
          </form>
        </div>
      )}
    </div>
  );

  if (variant === "embedded") {
    return <section className={cn(className)}>{content}</section>;
  }

  return (
    <section
      className={cn(
        "w-full border-y border-lp-outline-variant/30 bg-lp-surface-container-high py-8",
        className,
      )}
    >
      {content}
    </section>
  );
}
