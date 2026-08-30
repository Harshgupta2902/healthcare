"use client";

import Link from "next/link";

const stats = [
  { value: "10K+", label: "Happy Patients" },
  { value: "150+", label: "Expert Doctors" },
  { value: "50+", label: "Specialties" },
  { value: "98%", label: "Satisfaction Rate" },
];

export function CtaSection() {
  return (
    <section className="final-cta py-12" id="booking">
      <div className="container mx-auto max-w-[1120px] px-4">
        <div className="cta-box relative overflow-hidden rounded-2xl px-8 md:px-12 py-10 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
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

          {/* LEFT */}
          <div className="cta-left pr-0 lg:pr-12 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Your Health, Our Priority</h2>
            <p className="text-sm text-white max-w-lg">
              Join thousands of patients who trust MediCare+ for reliable, accessible and compassionate healthcare.
            </p>

            {/* Stats */}
            <div className="cta-stats flex gap-8 mt-6 flex-wrap">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <strong className="block text-xl font-bold">{stat.value}</strong>
                  <span className="text-xs opacity-75">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="cta-right border-t lg:border-t-0 lg:border-l border-white/15 pt-6 lg:pt-0 lg:pl-12 flex flex-col justify-center relative z-10">
            <h3 className="text-lg text-white font-bold mb-2">Book Your Consultation Today</h3>
            <p className="text-sm text-white mb-5">Take the first step towards better health.</p>
            <Link
              href="/book-consultation"
              className="w-max px-6 py-3 bg-white text-[#2265b8] rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Book Now ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
