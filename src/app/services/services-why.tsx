"use client";

import Link from "next/link";

const reasons = [
  {
    title: "Affordable Care",
    desc: "Transparent pricing with no hidden fees. We accept most major insurance plans and offer flexible payment options.",
  },
  {
    title: "Quality Assured",
    desc: "All our healthcare professionals are board-certified and undergo rigorous verification to ensure the highest standards of care.",
  },
  {
    title: "Seamless Experience",
    desc: "From booking to follow-up, our platform is designed for simplicity. Get care without the complexity of traditional healthcare.",
  },
];

export function ServicesWhy() {
  return (
    <section className="services-why py-12 md:py-16 bg-[#f5f8fd]">
      <div className="container mx-auto max-w-[1120px] px-4">
        {/* CTA band */}
        <div className="cta-box relative overflow-hidden rounded-2xl px-8 md:px-12 py-10 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 mb-12">
          <style jsx>{`
            .cta-box {
              background: linear-gradient(105deg, #123b7d, #2873dc);
            }
            .cta-box::after {
              content: "";
              position: absolute;
              width: 270px;
              height: 270px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 50%;
              right: -120px;
              top: -130px;
            }
          `}</style>

          <div className="relative z-10 pr-0 lg:pr-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Experience the future of healthcare
            </h2>
            <p className="text-sm text-white/90 max-w-lg">
              Start your consultation today and experience care redefined. Quality healthcare is just
              a few clicks away.
            </p>
          </div>

          <div className="relative z-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/15 pt-6 lg:pt-0 lg:pl-12">
            <h3 className="text-lg text-white font-bold mb-2">Ready to take control?</h3>
            <p className="text-sm text-white/90 mb-5">
              Join 10,000+ patients who trust us with their wellbeing.
            </p>
            <Link
              href="/book-consultation"
              className="w-max px-6 py-3 bg-white text-[#2265b8] rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Why choose us */}
        <div className="section-title text-left mb-8">
          <h2 className="text-2xl md:text-3xl text-[#122e52] mb-2 tracking-tight font-bold">
            Why settle for ordinary?
          </h2>
          <p className="text-sm text-[#77869a] max-w-[560px]">
            We&apos;re committed to making quality healthcare accessible, affordable, and convenient
            for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-[#e1e8f2] bg-white p-7 transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_12px_30px_rgba(31,102,190,0.08)]"
            >
              <h3 className="text-lg font-bold text-[#1f385a] mb-3 group-hover:text-[#2871d4] transition-colors">
                {reason.title}
              </h3>
              <p className="text-sm text-[#718198] leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
