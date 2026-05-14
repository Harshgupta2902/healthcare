import { canonicalUrl, getMetadataBase, SITE_NAME } from "./site";

const ORG_DESCRIPTION =
  "Healthcare that actually works: skip the waiting room and access medical experts, personalized treatment plans, and secure care from anywhere.";

/**
 * Site-wide Schema.org JSON-LD (Organization + WebSite) for crawlers and rich-result tools.
 */
export function RootJsonLd() {
  const siteRoot = canonicalUrl("/");
  const base = getMetadataBase();
  const organizationId = `${siteRoot}#organization`;
  const websiteId = `${siteRoot}#website`;
  const logoUrl = new URL("opengraph-image", base).href;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: siteRoot,
        description: ORG_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteRoot,
        name: SITE_NAME,
        description: ORG_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD is built from app-controlled strings only (no user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
