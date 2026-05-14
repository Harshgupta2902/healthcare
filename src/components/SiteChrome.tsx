"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * Auth routes render full-page experiences (own header/footer) without the
 * global marketing shell or main top padding for the fixed site header.
 */
function isAuthFullPagePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/login" || pathname.startsWith("/login/");
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authShell = isAuthFullPagePath(pathname);

  if (authShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
