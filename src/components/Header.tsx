"use client";

import { useState } from "react";
import { Menu, CircleX, LogIn, User, LogOut, LayoutDashboard, Stethoscope } from "lucide-react";
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

export default function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    router.push('/register');
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    const userRole = session?.user?.role;
    const path = userRole === "professional" ? '/dashboard/professional' : '/dashboard';
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfessionalDashboardClick = () => {
    router.push('/dashboard/professional');
    setIsMobileMenuOpen(false);
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

  return (
    <header className={`sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border ${className}`}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-heading font-bold text-primary hover:opacity-80 transition-opacity">
              HealthHere
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/services"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a
              href="/how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </a>
          </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-3">
                {mounted && !isPending && session?.user ? (
                  <>
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
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleLoginClick}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>

                  <Button size="sm" onClick={handleSignUpClick}>
                    Sign up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu">
              {isMobileMenuOpen ?
              <CircleX className="h-5 w-5" /> :
              <Menu className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen &&
        <div className="md:hidden border-t border-border bg-card">
            <nav className="px-2 py-4 space-y-2">
              <a
              href="/services"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </a>
              <a
              href="/how-it-works"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                How it works
              </a>
              <a
              href="/contact"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                Contact Us
              </a>
              <div className="pt-2 mt-2 border-t border-border space-y-2">
                {!isPending && session?.user ? (
                  <>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>
                    </div>
<Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={handleDashboardClick}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={handleProfessionalDashboardClick}
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Professional Portal
                      </Button>
                      <Button
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={handleLoginClick}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button size="sm" className="w-full" onClick={handleSignUpClick}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        }
      </div>
    </header>);

}