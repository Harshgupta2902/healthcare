"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * Auth and admin routes use their own shell — no marketing Header/Footer or
 * `pt-20` offset for the fixed site header.
 */
function isAuthFullPagePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/login" || pathname.startsWith("/login/");
}

/** Admin panel has its own layout (sidebar + navbar); skip marketing shell padding. */
function isAdminPanelPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/application/enter" || pathname.startsWith("/application/enter/");
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bareShell = isAuthFullPagePath(pathname) || isAdminPanelPath(pathname);

  if (bareShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
