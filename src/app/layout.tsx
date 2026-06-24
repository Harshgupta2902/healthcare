import type { Metadata } from "next";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import SiteChrome from "@/components/SiteChrome";
import { HealthHereAssistant } from "@/components/HealthHereAssistant";
import { AuthModalProvider } from "@/features/auth/AuthModal";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { rootMetadata } from "@/lib/seo/root-metadata";
import { RootJsonLd } from "@/lib/seo/root-json-ld";
import Script from "next/script";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col min-w-0" suppressHydrationWarning>
        <RootJsonLd />
        <ErrorReporter />
        <Analytics />
        <AuthModalProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthModalProvider>
        <HealthHereAssistant />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
