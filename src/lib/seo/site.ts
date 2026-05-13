/**
 * Canonical site URL for metadata, OG URLs, and sitemap.
 * Set APP_URL in production (e.g. https://www.healthhere.example).
 */
export const SITE_NAME = "HealthHere";

export const DEFAULT_DESCRIPTION =
  "Making quality healthcare accessible and convenient for everyone, wherever you are.";

export function getSiteUrl(): string {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl().replace(/\/+$/, "")}/`);
}

export function canonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return `${getSiteUrl().replace(/\/+$/, "")}/`;
  return new URL(path.slice(1), getMetadataBase()).href;
}
