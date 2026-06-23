/** Current URL path + query for post-auth return (same-origin). */
export function getCurrentPathRedirect(fallbackPath = "/"): string {
  if (typeof window !== "undefined") {
    return `${window.location.pathname}${window.location.search}`;
  }
  return fallbackPath.startsWith("/") ? fallbackPath : "/";
}
