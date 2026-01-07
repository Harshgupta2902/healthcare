"use client";

import { useState, useEffect } from "react";
import { Menu, CircleX, LogIn, LogOut, LayoutDashboard, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface HeaderProps {
  className?: string;
}

function UserMenu({ session, isPending, refetch, mounted }: { session: any, isPending: boolean, refetch: () => void, mounted: boolean }) {
  const router = useRouter();

  const handleDashboardClick = () => {
    const userRole = session?.user?.role;
    const path = userRole === "professional" ? '/dashboard/professional' : '/dashboard';
    router.push(path);
  };

  const handleProfessionalDashboardClick = () => {
    router.push('/dashboard/professional');
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  if (!mounted || isPending) return null;

  if (session?.user) {
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDashboardClick}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDashboardClick}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              My Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleProfessionalDashboardClick}>
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
    <div className="hidden md:flex items-center space-x-3">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-foreground"
        onClick={() => router.push('/login')}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Button>
      <Button size="sm" onClick={() => router.push('/register')}>
        Sign up
      </Button>
    </div>
  );
}

export default function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // We call useSession here, but we will guard its usage in the UI
  const { data: session, isPending, refetch } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      setIsMobileMenuOpen(false);
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border ${className}`}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-heading font-bold text-primary hover:opacity-80 transition-opacity">
              HealthHere
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <UserMenu session={session} isPending={isPending} refetch={refetch} mounted={mounted} />

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <CircleX className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="px-2 py-4 space-y-2">
            <a href="/services" className="block px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
            <a href="/how-it-works" className="block px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>How it works</a>
            <a href="/contact" className="block px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a>
            
            <div className="pt-2 mt-2 border-t border-border space-y-2">
              {mounted && !isPending && session?.user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{session.user.name}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { router.push(session.user.role === 'professional' ? '/dashboard/professional' : '/dashboard'); setIsMobileMenuOpen(false); }}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
                </>
              ) : mounted && !isPending ? (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}>
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Button>
                  <Button size="sm" className="w-full" onClick={() => { router.push('/register'); setIsMobileMenuOpen(false); }}>Sign up</Button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
