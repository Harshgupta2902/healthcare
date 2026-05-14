import type { Metadata } from "next";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HealthHereAssistant } from "@/components/HealthHereAssistant";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { rootMetadata } from "@/lib/seo/root-metadata";
import { RootJsonLd } from "@/lib/seo/root-json-ld";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col min-w-0" suppressHydrationWarning>
        <RootJsonLd />
        <ErrorReporter />
        <Analytics />
        <Header />
        <main className="flex flex-1 flex-col min-h-0 min-w-0 overflow-x-clip pt-20">
          {children}
        </main>
        <Footer />
        <HealthHereAssistant />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
