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
    <section className="relative w-full bg-lp-surface px-5 py-18 sm:px-8 md:py-28 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            Healthcare that <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Actually Works
            </span>
          </h1>

          <p className="max-w-2xl font-sans text-base leading-7 text-lp-on-surface-variant sm:text-lg">
            Ditch the waiting room. Access world-class medical experts, personalized treatment plans, and secure care
            from anywhere in the world.
          </p>

          <div className="flex max-[992px]:flex-row max-[992px]:flex-nowrap max-[992px]:gap-3 flex-wrap justify-center gap-4 pt-8">
            <Link
              href="/book-consultation"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-lp-brand px-4 py-3 font-heading text-sm font-semibold text-lp-on-brand shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl min-[993px]:px-8 min-[993px]:py-4 min-[993px]:text-xl"
            >
              Get Started For Free
            </Link>
            <Link
              href="/consultants"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-lp-surface-container px-4 py-3 font-heading text-sm font-semibold text-lp-brand transition-all hover:bg-lp-surface-container-high min-[993px]:px-8 min-[993px]:py-4 min-[993px]:text-xl"
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
