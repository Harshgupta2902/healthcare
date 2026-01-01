"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
      setEmail('');
      toast.success('Thanks for subscribing! Check your email for confirmation.');

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`bg-card border-t w-full ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {/* Contact & Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                HealthHere
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Making quality healthcare accessible and convenient for everyone, wherever you are.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span> care@healthhere.com
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Phone:</span> +91 9981322736
              </p>
            </div>
            </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Quick Links
            </h3>
            <nav className="space-y-2">
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/services"
                    className="text-muted-foreground hover:text-primary transition-colors">

                    Our Services
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors">

                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/help"
                    className="text-muted-foreground hover:text-primary transition-colors">

                    Help & Support
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors">

                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Newsletter & Legal */}
          <div className="space-y-6">
            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h3 className="font-heading font-semibold text-lg text-foreground">
                Stay Updated
              </h3>
              {isSuccess ?
              <div className="p-3 bg-secondary rounded-md">
                  <p className="text-sm text-secondary-foreground font-medium">
                    ✓ Successfully subscribed!
                  </p>
                </div> :

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={error ? 'border-destructive' : ''}
                    aria-describedby={error ? 'email-error' : 'email-privacy'}
                    aria-label="Email address for newsletter" />

                    {error &&
                  <p id="email-error" className="text-destructive text-xs" role="alert">
                        {error}
                      </p>
                  }
                  </div>
                  <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="sm">

                    {isSubmitting ?
                  'Subscribing...' :

                  <>
                        Subscribe
                        <Send className="w-4 h-4 ml-2" />
                      </>
                  }
                  </Button>
                  <p id="email-privacy" className="text-xs text-muted-foreground">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              }
            </div>

            {/* Social & Legal Links */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/healthhere"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter"
                  className="text-muted-foreground hover:text-primary transition-colors">

                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/healthhere"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on LinkedIn"
                  className="text-muted-foreground hover:text-primary transition-colors">

                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
              
              <div className="pt-4 border-t border-border">
                <nav className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <a
                    href="/privacy"
                    className="hover:text-primary transition-colors">

                    Privacy Policy
                  </a>
                  <a
                    href="/terms"
                    className="hover:text-primary transition-colors">

                    Terms of Service
                  </a>
                  <a
                    href="/accessibility"
                    className="hover:text-primary transition-colors">

                    Accessibility
                  </a>
                </nav>
                <p className="text-xs text-muted-foreground mt-4">
                  © 2024 HealthHere. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>);

}