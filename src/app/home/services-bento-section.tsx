import Image from "next/image";
import { Video, Globe2, FileText, LineChart } from "lucide-react";
import { HOME_DOC_AVATARS, HOME_VIDEO_CARD_IMAGE } from "./constants";

export function ServicesBentoSection() {
  return (
    <section id="services" className="w-full bg-lp-surface">
      <div className="py-16 px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-lp-cta-bg">
            Everything you need for Superior Health
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-lp-primary-container rounded-[2rem] p-10 text-lp-on-secondary-container relative overflow-hidden flex flex-col justify-end min-h-[400px]">
            <Image
              src={HOME_VIDEO_CARD_IMAGE}
              alt=""
              fill
              className="object-cover opacity-30 pointer-events-none"
              sizes="(max-width: 768px) 100vw, 66vw"
              aria-hidden
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Video className="size-6 text-lp-secondary-fixed shrink-0" aria-hidden />
                <span className="text-sm font-semibold tracking-wide text-white">Unlimited access</span>
              </div>
              <h3 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-white">Instant Video Consultations</h3>
              <p className="text-lg leading-7 text-white max-w-md">
                24/7 access to physicians without the wait. High-definition care from the comfort of your home.
              </p>
            </div>
          </div>

          <div className="bg-lp-surface-container rounded-[2rem] p-10 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-lp-brand text-lp-on-brand flex items-center justify-center mb-8">
              <Globe2 className="size-7 shrink-0" aria-hidden />
            </div>
            <h3 className="font-heading text-3xl sm:text-4xl font-semibold text-lp-cta-bg mb-4">
              Global Specialist Network
            </h3>
            <p className="text-base text-lp-on-surface-variant">
              Access over 40+ disciplines and world-renowned experts from top global medical institutions.
            </p>
            <div className="mt-auto pt-8">
              <div className="flex -space-x-4">
                {HOME_DOC_AVATARS.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-4 border-lp-surface-container-lowest object-cover"
                  />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-lp-surface-container-lowest bg-lp-cta-bg text-white flex items-center justify-center text-xs font-bold">
                  +400
                </div>
              </div>
            </div>
          </div>

          <div className="bg-lp-surface-variant rounded-[2rem] p-10 flex flex-col justify-between">
            <div>
              <FileText className="text-lp-brand size-8 mb-6 shrink-0" aria-hidden />
              <h3 className="font-heading text-2xl font-semibold text-lp-cta-bg mb-4">Smart Health Records</h3>
            </div>
            <p className="text-base text-lp-on-surface-variant">
              All your medical history, prescriptions, and lab results in one secure, portable dashboard.
            </p>
          </div>

          <div className="md:col-span-2 bg-lp-brand-bright text-lp-on-secondary-container rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <LineChart className="size-10 mb-6 shrink-0" aria-hidden />
              <h3 className="font-heading text-3xl sm:text-4xl font-semibold mb-4">AI-Powered Care Plans</h3>
              <p className="text-base opacity-90">
                Personalized health insights and preventive care schedules tailored to your unique genetic and medical
                profile.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="glass-card p-6 rounded-2xl w-full max-w-xs shadow-2xl">
                <div className="h-2 w-24 bg-lp-on-secondary-container/20 rounded-full mb-4" />
                <div className="space-y-3">
                  <div className="h-10 bg-lp-on-secondary-container/10 rounded flex items-center px-3 gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="h-2 w-32 bg-lp-on-secondary-container/20 rounded-full" />
                  </div>
                  <div className="h-10 bg-lp-on-secondary-container/10 rounded flex items-center px-3 gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div className="h-2 w-24 bg-lp-on-secondary-container/20 rounded-full" />
                  </div>
                  <div className="h-10 bg-lp-on-secondary-container/10 rounded flex items-center px-3 gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-28 bg-lp-on-secondary-container/20 rounded-full" />
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
