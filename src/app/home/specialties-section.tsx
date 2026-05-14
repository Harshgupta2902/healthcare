import {
  Stethoscope,
  Brain,
  Venus,
  Baby,
  Eye,
  Activity,
  type LucideIcon,
} from "lucide-react";

const specialties: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Stethoscope,
    title: "General Physician",
    desc: "Primary care for common illnesses, checkups, and wellness advice.",
  },
  {
    icon: Brain,
    title: "Psychologist",
    desc: "Mental health support, therapy sessions, and emotional wellness plans.",
  },
  {
    icon: Venus,
    title: "Gynecologist",
    desc: "Expert care for women's reproductive health and maternal support.",
  },
  {
    icon: Baby,
    title: "Pediatrician",
    desc: "Specialized healthcare for infants, children, and adolescents.",
  },
  {
    icon: Eye,
    title: "Ophthalmologist",
    desc: "Comprehensive eye care, vision testing, and surgical referrals.",
  },
  {
    icon: Activity,
    title: "Psychiatrist",
    desc: "Medical diagnosis and pharmacological treatment for mental health.",
  },
];

export function SpecialtiesSection() {
  return (
    <section className="w-full bg-lp-surface-container-low py-16">
      <div className="px-5 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-lp-cta-bg">
            Specialized Care For Every Need
          </h2>
          <p className="text-base text-lp-on-surface-variant mt-2">
            Connect with board-certified professionals across all major disciplines.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-lp-surface-container-lowest p-8 rounded-xl border border-lp-outline-variant/30 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-lp-brand/10 flex items-center justify-center text-lp-brand mb-6 group-hover:scale-110 transition-transform">
                <Icon className="size-7" aria-hidden />
              </div>
              <h3 className="font-heading text-2xl font-semibold text-lp-cta-bg mb-3">{title}</h3>
              <p className="text-sm leading-5 text-lp-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
