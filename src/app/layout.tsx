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
import { PAYMENT_PROVIDER } from "@/features/booking-orders/lib/constants";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col min-w-0" suppressHydrationWarning>
        {PAYMENT_PROVIDER === "razorpay" ? (
          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
        ) : null}
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
