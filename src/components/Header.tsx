"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  CircleX,
  LogIn,
  LogOut,
  LayoutDashboard,
  Stethoscope,
  BadgeCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LpButton } from "@/components/ui/lp-button";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAndRedirectHome } from "@/features/auth/logout";
import { getCurrentPathRedirect } from "@/features/auth/current-path-redirect";
import { openAuthModal } from "@/features/auth/open-auth-modal";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const desktopNavClass = (active: boolean) =>
    `whitespace-nowrap text-sm tracking-wide transition-colors ${
      active
        ? "font-extrabold text-lp-brand"
        : "font-semibold text-lp-on-surface-variant hover:text-lp-brand"
    }`;

  const mobileNavClass = (active: boolean) =>
    `block rounded-lg px-3 py-2.5 text-sm transition-colors ${
      active
        ? "bg-lp-surface-container font-extrabold text-lp-brand"
        : "font-semibold text-lp-on-surface-variant hover:bg-lp-surface-container hover:text-lp-brand"
    }`;

  useEffect(() => {
    setMounted(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsPending(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) {
          setUser(session?.user ?? null);
          setIsPending(false);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        if (!cancelled) setIsPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, pathname]);

  if (pathname?.startsWith("/application/enter")) {
    return null;
  }

  const handleSignOut = () => {
    setIsMobileMenuOpen(false);
    void logoutAndRedirectHome();
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
    setIsMobileMenuOpen(false);
  };

  const openLoginModal = () => {
    openAuthModal({ view: "login", redirect: getCurrentPathRedirect(pathname ?? "/") });
  };

  const openSignupModal = () => {
    openAuthModal({ view: "signup", redirect: getCurrentPathRedirect(pathname ?? "/") });
  };

  const renderAuthSection = () => {
    if (!mounted || isPending) return null;

    if (user) {
      return (
        <div className="hidden nav:flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg cursor-pointer border-lp-outline-variant px-3 text-sm font-semibold text-lp-on-surface hover:bg-lp-surface-container-low"
            onClick={handleDashboardClick}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.user_metadata?.image} className="object-cover" />
                  <AvatarFallback className="bg-lp-brand text-lp-on-brand text-xs font-semibold">
                    {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-lp-outline-variant/40">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.user_metadata?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="hidden nav:flex items-center gap-4">
        <LpButton
          type="button"
          variant="headerGuest"
          className="hidden sm:block"
          onClick={openLoginModal}
        >
          Login
        </LpButton>
        <LpButton type="button" variant="headerGuestCta" onClick={openSignupModal}>
          Sign up
        </LpButton>
      </div>
    );
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-lp-outline-variant/30 bg-lp-surface/80 px-5 shadow-sm backdrop-blur-md sm:px-8 lg:px-16 top-[var(--pwa-banner-h,0px)] ${className ?? ""}`}
    >
      <div className="flex min-w-0 items-center gap-3 nav:gap-4">
        <Link
          href="/"
          className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 font-extrabold tracking-tight font-heading text-2xl sm:text-3xl"
        >
          Protealth
        </Link>
        {mounted && !isPending && user && (
          <Badge
            variant="secondary"
            className="hidden shrink-0 border border-lp-outline-variant/40 bg-lp-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lp-brand nav:inline-flex"
          >
            {user.user_metadata?.role === "professional" ? (
              <>
                Professional <BadgeCheck className="h-3 w-3" />
              </>
            ) : (
              "Patient Portal"
            )}
          </Badge>
        )}
      </div>

      <nav className="hidden flex-1 justify-center nav:flex">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/services" className={desktopNavClass(pathname === "/services")}>
            Services
          </Link>
          {(!user || user.user_metadata?.role !== "professional") && (
            <Link href="/consultants" className={desktopNavClass(pathname === "/consultants")}>
              Consultants
            </Link>
          )}
          <Link href="/how-it-works" className={desktopNavClass(pathname === "/how-it-works")}>
            How it works
          </Link>
          <Link href="/blog" className={desktopNavClass(pathname?.startsWith("/blog") ?? false)}>
            Blog
          </Link>
          <Link href="/support" className={desktopNavClass(pathname?.startsWith("/support") ?? false)}>
            Support
          </Link>
          <Link href="/contact" className={desktopNavClass(pathname === "/contact")}>
            Contact Us
          </Link>
        </div>
      </nav>

      <div className="flex items-center gap-2 nav:gap-4">
        {renderAuthSection()}

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-lp-on-surface nav:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <CircleX className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-lp-outline-variant/30 bg-lp-surface-container-lowest shadow-lg nav:hidden">
          <nav className="max-h-[min(70vh,calc(100dvh-5rem))] space-y-1 overflow-y-auto px-3 py-4">
            <Link
              href="/services"
              className={mobileNavClass(pathname === "/services")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            {(!user || user.user_metadata?.role !== "professional") && (
              <Link
                href="/consultants"
                className={mobileNavClass(pathname === "/consultants")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Consultants
              </Link>
            )}
            <Link
              href="/how-it-works"
              className={mobileNavClass(pathname === "/how-it-works")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/blog"
              className={mobileNavClass(pathname?.startsWith("/blog") ?? false)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/support"
              className={mobileNavClass(pathname?.startsWith("/support") ?? false)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support Center
            </Link>
            <Link
              href="/contact"
              className={mobileNavClass(pathname === "/contact")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            <div className="mt-3 space-y-2 border-t border-lp-outline-variant/30 pt-3">
              {mounted && !isPending && user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.image} className="object-cover" />
                      <AvatarFallback className="bg-lp-brand text-lp-on-brand text-xs">
                        {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate text-sm font-medium">{user.user_metadata?.name || "User"}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-lp-outline-variant cursor-pointer"
                    onClick={handleDashboardClick}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </>
              ) : mounted && !isPending ? (
                <div className="flex flex-col gap-2 px-1">
                  <LpButton
                    type="button"
                    variant="headerGuest"
                    fullWidth
                    className="justify-center"
                    onClick={() => {
                      openLoginModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </LpButton>
                  <LpButton
                    type="button"
                    variant="headerGuestCta"
                    fullWidth
                    className="justify-center"
                    onClick={() => {
                      openSignupModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </LpButton>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
