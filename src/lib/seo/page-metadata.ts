import type { Metadata } from "next";
import { canonicalUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "./site";

export const ROBOTS_NOINDEX: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export type PageMetaInput = {
  title: string;
  description?: string;
  pathname: string;
  keywords?: string[];
  robots?: Metadata["robots"];
  /** Absolute image URL for OG/Twitter; omit for default `/opengraph-image`. */
  ogImage?: string | null;
  openGraphType?: "website" | "article";
  /** Use when the visible title must not use the global template (e.g. homepage). */
  absoluteTitle?: string;
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname,
  keywords,
  robots,
  ogImage,
  openGraphType = "website",
  absoluteTitle,
}: PageMetaInput): Metadata {
  const canonical = canonicalUrl(pathname);
  const brandedOgTitle = absoluteTitle ?? `${title} | ${SITE_NAME}`;
  const images =
    ogImage && (ogImage.startsWith("http://") || ogImage.startsWith("https://"))
      ? [{ url: ogImage, width: 1200, height: 630, alt: brandedOgTitle }]
      : [{ url: "/opengraph-image", width: 1200, height: 630, alt: brandedOgTitle }];

  const base: Metadata = {
    ...(absoluteTitle ? { title: { absolute: absoluteTitle } } : { title }),
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      type: openGraphType,
      url: canonical,
      title: brandedOgTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedOgTitle,
      description,
      images: images.map((i) => i.url),
    },
    robots:
      robots ??
      ({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      } satisfies Metadata["robots"]),
  };

  return base;
}

export function buildHomeMetadata(): Metadata {
  return buildPageMetadata({
    absoluteTitle: "HealthHere — Your Health, Our Priority",
    title: "HealthHere",
    description: DEFAULT_DESCRIPTION,
    pathname: "/",
    keywords: [
      "HealthHere",
      "healthcare",
      "telehealth",
      "online doctor",
      "medical consultants",
      "book consultation",
      "health platform",
    ],
  });
}
