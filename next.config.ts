import type { NextConfig } from "next";

/** jsPDF uses html2canvas 1.x, which cannot parse Tailwind v4 `oklch()`. Alias to html2canvas-pro. */
const html2canvasAlias = "html2canvas-pro";

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders: { key: string; value: string }[] = [
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
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Content-Security-Policy",
              value: "upgrade-insecure-requests",
            },
          ]
        : []),
    ];

    // Do not set COEP/COOP — they apply to the whole document on client-side
    // navigation and block Razorpay checkout.js + payment iframe.
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
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
