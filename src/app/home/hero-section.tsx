import Link from "next/link";
import { BadgeCheck } from "lucide-react";

const TRUST_STATS = [
  { value: "10k+", label: "Active Users" },
  { value: "4.9/5", label: "User Rating" },
  { value: "24/7", label: "Expert Support" },
  { value: "HIPAA", label: "Secure" },
] as const;

export function HeroSection() {
  return (
    <section className="relative w-full bg-lp-surface px-5 py-24 sm:px-8 md:py-32 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-lp-brand/20 bg-lp-brand-bright/10 px-4 py-1.5 text-lp-brand">
            <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
            <span className="font-sans text-sm font-semibold uppercase tracking-wide">Trusted by 10k+ patients</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-foreground">
              Healthcare that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                Actually Works
              </span>
            </h1>

          <p className="max-w-2xl font-sans text-lg leading-7 text-lp-on-surface-variant">
            Ditch the waiting room. Access world-class medical experts, personalized treatment plans, and secure care
            from anywhere in the world.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Link
              href="/book-consultation"
              className="inline-flex items-center justify-center rounded-xl bg-lp-brand px-8 py-4 font-heading text-xl font-semibold text-lp-on-brand shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started For Free
            </Link>
            <Link
              href="/consultants"
              className="inline-flex items-center justify-center rounded-xl bg-lp-surface-container px-8 py-4 font-heading text-xl font-semibold text-lp-brand transition-all hover:bg-lp-surface-container-high"
            >
              Find Specialist
            </Link>
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-8 border-t border-lp-outline-variant/30 pt-16 md:grid-cols-4">
          {TRUST_STATS.map((stat) => (
            <div className="flex flex-col items-center" key={stat.label}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="font-sans text-md text-lp-on-surface-variant">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
