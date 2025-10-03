"use client";

import { useState } from "react";
import { Menu, CircleX, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { toast } from "sonner";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    router.push('/register');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border ${className}`}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-heading font-bold text-primary">
              HealthHere
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors !whitespace-pre-line">
              Contact Us
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-3">
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
              href="#services"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </a>
              <a
              href="#how-it-works"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                How it works
              </a>
              <a
              href="#pricing"
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}>
                Pricing
              </a>
              <div className="pt-2 mt-2 border-t border-border space-y-2">
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
              </div>
            </nav>
          </div>
        }
      </div>
    </header>);

}