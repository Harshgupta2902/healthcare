"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, CircleX, LogIn, LogOut, LayoutDashboard, Stethoscope } from "lucide-react";
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
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
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

  // Subscribe once; pathname-based refresh handles server-action login (no SIGNED_IN event in browser)
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

  // Re-sync session when the route changes — Header stays mounted, so /login → /dashboard must re-read cookies
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

  // Hide header on admin pages
  if (pathname?.startsWith('/application/enter')) {
    return null;
  }

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    try {
      // Clear browser session first so Supabase client state matches cookies
      const { error } = await supabase.auth.signOut({ scope: 'global' });
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
    router.replace('/');
  };

  const handleDashboardClick = () => {
    const userRole = user?.user_metadata?.role || "client";
    const path = '/dashboard';
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Prevent SSR of the auth-dependent parts to avoid hydration mismatch
  const renderAuthSection = () => {
    if (!mounted || isPending) return null;

    if (user) {
      return (
        <div className="hidden min-[992px]:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-semibold"
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
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.user_metadata?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDashboardClick}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                My Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
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
      <div className="hidden min-[992px]:flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => router.push('/login')}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
        <Button size="sm" className="h-8 rounded-lg px-4 text-xs font-semibold cursor-pointer" onClick={() => router.push('/register')}>
          Sign up
        </Button>
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-card/90 backdrop-blur-md border-b border-border ${className ?? ""}`}>
      <div className="w-full px-4 sm:px-5 min-[992px]:px-4 min-[1200px]:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl min-[1200px]:text-2xl font-heading font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 font-extrabold tracking-tight">
                HealthHere
              </span>
            </Link>
            {mounted && !isPending && user && (
              <Badge variant="secondary" className="hidden min-[992px]:flex font-semibold px-3 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-100 gap-1 items-center rounded-full text-[10px] uppercase">
                {user.user_metadata?.role === 'professional' ? (
                  <>Professional <BadgeCheck className="h-3 w-3" /></>
                ) : (
                  'Patient Portal'
                )}
              </Badge>
            )}
          </div>

          <nav className="hidden min-[992px]:flex items-center gap-3 min-[1200px]:gap-5">
            <Link href="/services" className={`whitespace-nowrap text-[13px] font-semibold transition-colors ${pathname === '/services' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Services
            </Link>
            {(!user || user.user_metadata?.role !== 'professional') && (
              <Link href="/consultants" className={`whitespace-nowrap text-[13px] font-semibold transition-colors ${pathname === '/consultants' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Consultants
              </Link>
            )}
            <Link href="/how-it-works" className={`whitespace-nowrap text-[13px] font-semibold transition-colors ${pathname === '/how-it-works' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              How it works
            </Link>
            <Link href="/support" className={`whitespace-nowrap text-[13px] font-semibold transition-colors ${pathname?.startsWith('/support') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Support
            </Link>
            <Link href="/contact" className={`whitespace-nowrap text-[13px] font-semibold transition-colors ${pathname === '/contact' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Contact Us
            </Link>
          </nav>


          <div className="flex items-center gap-2 min-[1200px]:gap-4">
            {renderAuthSection()}

            <Button
              variant="ghost"
              size="sm"
              className="min-[992px]:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <CircleX className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="min-[992px]:hidden border-t border-border bg-card">
          <nav className="px-2 py-4 space-y-2">
            <Link href="/services" className={`block px-3 py-2 text-sm ${pathname === '/services' ? 'font-extrabold text-foreground' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            {(!user || user.user_metadata?.role !== 'professional') && (
              <Link href="/consultants" className={`block px-3 py-2 text-sm ${pathname === '/consultants' ? 'font-extrabold text-foreground' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Consultants</Link>
            )}
            <Link href="/how-it-works" className={`block px-3 py-2 text-sm ${pathname === '/how-it-works' ? 'font-extrabold text-foreground' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>How it works</Link>
            <Link href="/support" className={`block px-3 py-2 text-sm ${pathname?.startsWith('/support') ? 'font-extrabold text-foreground' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Support Center</Link>
            <Link href="/contact" className={`block px-3 py-2 text-sm ${pathname === '/contact' ? 'font-extrabold text-foreground' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>

            <div className="pt-2 mt-2 border-t border-border space-y-2">

              {mounted && !isPending && user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.image} className="object-cover" />
                      <AvatarFallback>{user.user_metadata?.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{user.user_metadata?.name || 'User'}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleDashboardClick}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
                </>
              ) : mounted && !isPending ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 justify-center cursor-pointer" onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}>
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Button>
                  <Button size="sm" className="flex-1 cursor-pointer" onClick={() => { router.push('/register'); setIsMobileMenuOpen(false); }}>Sign up</Button>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

