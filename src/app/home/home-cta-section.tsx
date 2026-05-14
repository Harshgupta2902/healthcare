import Link from "next/link";

export function HomeCtaSection() {
  return (
    <section className="w-full bg-lp-surface">
      <div className="px-5 sm:px-8 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="bg-lp-cta-bg text-lp-on-brand rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lp-brand/20 blur-[100px] rounded-full" aria-hidden />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-lp-brand/10 blur-[100px] rounded-full" aria-hidden />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-lp-on-brand mb-8">Ready to take control?</h2>
            <p className="text-lg text-lp-on-brand/70 mb-10">
              Join thousands of patients who have transformed their healthcare experience with HealthHere.
            </p>
            <Link
              href="/book-consultation"
              className="inline-flex items-center justify-center px-10 py-5 bg-lp-brand text-lp-on-brand text-xl font-semibold rounded-xl hover:scale-105 transition-all shadow-xl"
            >
              Book Your Free Call
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
