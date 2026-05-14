import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Users, Star, Headphones, Shield } from "lucide-react";
import { HOME_HERO_IMAGE } from "./constants";

export function HeroSection() {
  return (
    <section className="relative w-full bg-lp-surface">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lp-brand-bright/10 text-lp-brand border border-lp-brand/20">
              <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
              <span className="text-sm font-semibold tracking-wide uppercase">Trusted by 10k+ patients</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl leading-tight sm:leading-[56px] font-bold tracking-tight text-foreground max-w-xl">
              Healthcare that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                Actually Works
              </span>
            </h1>
            <p className="text-lg leading-7 text-lp-on-surface-variant max-w-lg">
              Ditch the waiting room. Access world-class medical experts, personalized treatment plans, and secure care
              from anywhere in the world.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center px-8 py-4 bg-lp-brand text-lp-on-brand text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Get Started Now
              </Link>
              <Link
                href="/consultants"
                className="inline-flex items-center justify-center px-8 py-4 bg-lp-surface-container text-lp-brand text-xl font-semibold rounded-xl hover:bg-lp-surface-container-high transition-all"
              >
                Find Specialist
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] max-h-[450px] relative">
              <Image
                src={HOME_HERO_IMAGE}
                alt="Clinical excellence — professional medical environment with diagnostic technology"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-2xl shadow-xl max-w-md hidden md:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="size-6 shrink-0 text-lp-brand" aria-hidden />
                  <div>
                    <div className="font-heading font-bold text-lp-cta-bg">10k+</div>
                    <div className="text-sm text-lp-on-surface-variant">Active Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="size-6 shrink-0 fill-lp-brand text-lp-brand" aria-hidden />
                  <div>
                    <div className="font-heading font-bold text-lp-cta-bg">4.9/5</div>
                    <div className="text-sm text-lp-on-surface-variant">User Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Headphones className="size-6 shrink-0 text-lp-brand" aria-hidden />
                  <div>
                    <div className="font-heading font-bold text-lp-cta-bg">24/7</div>
                    <div className="text-sm text-lp-on-surface-variant">Expert Support</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="size-6 shrink-0 text-lp-brand" aria-hidden />
                  <div>
                    <div className="font-heading font-bold text-lp-cta-bg">HIPAA</div>
                    <div className="text-sm text-lp-on-surface-variant">Security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
