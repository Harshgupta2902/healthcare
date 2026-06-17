import type { Metadata } from "next";
import { buildPageMetadata, ROBOTS_NOINDEX } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your dashboard",
  description:
    "Your dashboard on HealthHere: manage appointments, prescriptions, medical profile, insurance, and account settings in one place.",
  pathname: "/dashboard",
  keywords: ["HealthHere dashboard", "patient portal", "your dashboard"],
  robots: ROBOTS_NOINDEX,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-lp-surface">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lp-surface-container-low via-lp-surface to-lp-secondary-fixed/40 opacity-90" />
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] animate-pulse rounded-full bg-lp-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-lp-surface-variant/50 blur-[140px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
