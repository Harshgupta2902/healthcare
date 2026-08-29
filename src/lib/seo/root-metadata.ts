import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, getMetadataBase, SITE_NAME } from "./site";

const ROOT_DESCRIPTION =
  "Healthcare that actually works: skip the waiting room and access medical experts, personalized treatment plans, and secure care from anywhere.";

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Protealth — Healthcare that actually works",
    template: "%s | Protealth",
  },
  description: ROOT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "health",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — healthcare access platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
