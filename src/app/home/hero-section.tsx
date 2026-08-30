"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserRoundCheck, ShieldCheck, Clock3 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-12 hero min-h-[445px] bg-gradient-to-b from-white to-[#f9fbff] overflow-hidden">
      <style jsx>{`
        .hero {
          background: radial-gradient(circle at 82% 42%, rgba(62, 125, 226, 0.09), transparent 28%),
                      linear-gradient(180deg, #fff 0%, #f9fbff 100%);
        }
      `}</style>
      
      <div className="container mx-auto max-w-[1120px] px-4">
        <div className="hero-inner min-h-[445px] grid grid-cols-1 lg:grid-cols-[47%_53%] items-center">
          {/* LEFT - Content */}
          <div className="hero-content pl-[2px] relative z-[2] py-10 lg:py-0">
            <h1 className="text-5xl md:text-6xl leading-tight tracking-tight text-[#102b51] mb-4">
              Healthcare that<br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">Actually Works</span>
            </h1>

            {/* Description */}
            <p className="max-w-[520px] text-base leading-relaxed text-[#6f7f94] mb-6">
              Ditch the waiting room. Access world-class medical experts, personalized treatment plans, 
              and secure care from anywhere in the world.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-8">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 bg-[#1769d8] text-white rounded-lg px-6 py-3 text-sm font-semibold shadow-lg shadow-[#1769d8]/20 hover:bg-[#1556b8] transition-colors"
              >
                Get Started For Free →
              </Link>
              <Link
                href="/specialists"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#bcd0e8] rounded-lg text-[#2566b9] text-sm font-semibold bg-white hover:bg-gray-50 transition-colors"
              >
                Find Specialist
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-[30px] h-[30px] rounded-full border border-[#cbdcf1] flex items-center justify-center text-[#2670d3] bg-white">
                  <UserRoundCheck className="w-[15px] h-[15px]" strokeWidth={1.7} />
                </div>
                <div>
                  <strong className="block text-[#203b60] text-sm">Verified Specialists</strong>
                  <small className="text-xs text-[#8390a0]">Experienced & certified doctors</small>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[30px] h-[30px] rounded-full border border-[#cbdcf1] flex items-center justify-center text-[#2670d3] bg-white">
                  <ShieldCheck className="w-[15px] h-[15px]" strokeWidth={1.7} />
                </div>
                <div>
                  <strong className="block text-[#203b60] text-sm">Private & Secure</strong>
                  <small className="text-xs text-[#8390a0]">HIPAA compliant platform</small>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[30px] h-[30px] rounded-full border border-[#cbdcf1] flex items-center justify-center text-[#2670d3] bg-white">
                  <Clock3 className="w-[15px] h-[15px]" strokeWidth={1.7} />
                </div>
                <div>
                  <strong className="block text-[#203b60] text-sm">Quick & Easy</strong>
                  <small className="text-xs text-[#8390a0]">Book in minutes, consult from anywhere</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Doctor Visual */}
          <div className="hero-visual h-[445px] relative hidden lg:block">
            {/* Background Circle */}
            <div className="absolute w-[395px] h-[395px] rounded-full bg-[#edf4ff] right-[-20px] top-[43px]"></div>
            
            {/* Ring */}
            <div className="absolute w-[350px] h-[350px] border-2 border-[#d1e1fa] rounded-full right-[35px] top-[80px]"></div>
            
            {/* Doctor Image */}
            <img
              className="absolute w-[330px] h-[410px] right-[48px] top-[20px] object-cover object-[center_top] rounded-t-[160px]"
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85"
              alt="Doctor"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
