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
import { signOut } from "@/features/profile/actions";

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

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) console.error(error);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setIsPending(false);
    try {
      await signOut();
    } catch {
      /* server action may still complete */
    }
    router.refresh();
    router.replace("/");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
    setIsMobileMenuOpen(false);
  };

  const renderAuthSection = () => {
    if (!mounted || isPending) return null;

    if (user) {
      return (
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-lp-outline-variant px-3 text-sm font-semibold text-lp-on-surface hover:bg-lp-surface-container-low"
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
              <DropdownMenuItem onClick={handleDashboardClick}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                My Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <Stethoscope className="h-4 w-4 mr-2" />
                Professional Portal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center gap-4">
        <button
          type="button"
          className="hidden cursor-pointer sm:block px-6 py-2.5 text-sm font-semibold tracking-wide text-lp-on-surface border border-lp-outline-variant rounded-lg hover:bg-lp-surface-container-low transition-all duration-200 active:scale-95"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
        <button
          type="button"
          className="px-6 py-2.5 cursor-pointer text-sm font-semibold tracking-wide bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          onClick={() => router.push("/register")}
        >
          Sign up
        </button>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-lp-outline-variant/30 bg-lp-surface/80 px-5 shadow-sm backdrop-blur-md sm:px-8 lg:px-16 ${className ?? ""}`}
    >
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <Link
          href="/"
          className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 font-extrabold tracking-tight font-heading text-xl sm:text-2xl"
        >
          HealthHere
        </Link>
        {mounted && !isPending && user && (
          <Badge
            variant="secondary"
            className="hidden shrink-0 border border-lp-outline-variant/40 bg-lp-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lp-brand md:inline-flex"
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

      <nav className="hidden flex-1 justify-center md:flex">
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
          <Link href="/support" className={desktopNavClass(pathname?.startsWith("/support") ?? false)}>
            Support
          </Link>
          <Link href="/contact" className={desktopNavClass(pathname === "/contact")}>
            Contact Us
          </Link>
        </div>
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        {renderAuthSection()}

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-lp-on-surface md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <CircleX className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-lp-outline-variant/30 bg-lp-surface-container-lowest shadow-lg md:hidden">
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
                    className="w-full justify-start border-lp-outline-variant"
                    onClick={handleDashboardClick}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </>
              ) : mounted && !isPending ? (
                <div className="flex flex-col gap-2 px-1">
                  <button
                    type="button"
                    className="w-full rounded-lg border border-lp-outline-variant px-4 py-2.5 text-sm font-semibold text-lp-on-surface transition-colors hover:bg-lp-surface-container"
                    onClick={() => {
                      router.push("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" /> Login
                    </span>
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-gradient-to-r from-lp-brand to-lp-brand-bright px-4 py-2.5 text-sm font-semibold text-lp-on-brand shadow-sm"
                    onClick={() => {
                      router.push("/register");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
