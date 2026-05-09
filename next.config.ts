import type { NextConfig } from "next";

/** jsPDF uses html2canvas 1.x, which cannot parse Tailwind v4 `oklch()`. Alias to html2canvas-pro. */
const html2canvasAlias = "html2canvas-pro";

const nextConfig: NextConfig = {
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
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
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
