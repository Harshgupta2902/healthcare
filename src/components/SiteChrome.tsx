"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * Admin panel has its own layout (sidebar + navbar); skip marketing shell padding.
 */
function isAdminPanelPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/application/enter" || pathname.startsWith("/application/enter/");
}

function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bareShell = isAdminPanelPath(pathname);
  const hideFooter = isDashboardPath(pathname);

  if (bareShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col pt-20">
        {children}
      </main>
      {!hideFooter ? <Footer /> : null}
    </>
  );
}
