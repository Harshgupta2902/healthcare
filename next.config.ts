import type { NextConfig } from "next";

/** jsPDF uses html2canvas 1.x, which cannot parse Tailwind v4 `oklch()`. Alias to html2canvas-pro. */
const html2canvasAlias = "html2canvas-pro";

const nextConfig: NextConfig = {
  async headers() {
    const baseHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "geolocation=(), camera=(self)",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      },
    ];

    // COEP/COOP break third-party payment embeds (Razorpay checkout iframe + script).
    const strictCrossOriginHeaders: { key: string; value: string }[] = [
      {
        key: "Cross-Origin-Embedder-Policy",
        value: "require-corp",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
    ];

    const productionCsp: { key: string; value: string }[] =
      process.env.NODE_ENV === "production"
        ? [
            {
              key: "Content-Security-Policy",
              value: "upgrade-insecure-requests",
            },
          ]
        : [];

    const paymentHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "geolocation=(), camera=(self)",
      },
      ...productionCsp,
    ];

    return [
      {
        source: "/book-consultation",
        headers: paymentHeaders,
      },
      {
        source: "/book-consultation/checkout",
        headers: paymentHeaders,
      },
      {
        // All routes except booking/payment pages — COEP/COOP break Razorpay embeds.
        source: "/((?!book-consultation$|book-consultation/checkout).*)",
        headers: [...baseHeaders, ...strictCrossOriginHeaders, ...productionCsp],
      },
    ];
  },
  serverExternalPackages: ['better-auth'],
  turbopack: {
    // Package name only — absolute Windows paths break Turbopack ("windows imports are not implemented yet").
    resolveAlias: {
      html2canvas: html2canvasAlias,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: html2canvasAlias,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
// Orchids restart: 1767959722778
