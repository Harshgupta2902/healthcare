import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeCtaSection() {
  return (
    <section className="w-full bg-lp-surface px-5 py-16 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[3rem] border border-lp-outline-variant/10 bg-gradient-to-br from-lp-primary-container via-lp-primary-container to-lp-brand-bright p-12 text-center shadow-2xl md:p-24">
          <div className="pointer-events-none absolute top-0 right-0 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-lp-brand/15 blur-[120px]" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-0 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-lp-brand/10 blur-[120px]" aria-hidden />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
            <h2 className="mb-8 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[48px] md:leading-[56px]">
              Ready to take control?
            </h2>
            <p className="mb-12 max-w-2xl font-sans text-lg leading-relaxed text-white/80">
              Join thousands of patients who have transformed their healthcare experience with HealthHere.
            </p>
            <Link
              href="/book-consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-xl bg-lp-brand px-12 py-5 font-heading text-xl font-semibold text-lp-on-brand shadow-xl transition-all hover:scale-105 hover:shadow-lp-brand/20"
            >
              <span>Book Your Free Call</span>
              <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
