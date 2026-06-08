import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { createSupabasePublic } from "@/lib/supabase/public";

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] =
  [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.85 },
    { path: "/accessibility", changeFrequency: "yearly", priority: 0.6 },
    { path: "/book-consultation", changeFrequency: "weekly", priority: 0.95 },
    { path: "/consultants", changeFrequency: "daily", priority: 0.95 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.75 },
    { path: "/how-it-works", changeFrequency: "monthly", priority: 0.85 },
    { path: "/blog", changeFrequency: "daily", priority: 0.85 },
    { path: "/services", changeFrequency: "weekly", priority: 0.85 },
    { path: "/specialists", changeFrequency: "weekly", priority: 0.85 },
    { path: "/support", changeFrequency: "monthly", priority: 0.7 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.55 },
    { path: "/unsubscribe", changeFrequency: "yearly", priority: 0.2 },
  ];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/+$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let consultantEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabasePublic();
      const { data, error } = await supabase
        .from("professional_profiles")
        .select("user_id, updated_at")
        .eq("is_verified", true);

      if (!error && data?.length) {
        consultantEntries = data.map((row) => ({
          url: `${base}/consultants/${row.user_id}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }

      const { data: posts, error: postsErr } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("status", "published");

      if (!postsErr && posts?.length) {
        blogEntries = posts.map((row) => ({
          url: `${base}/blog/${row.slug}`,
          lastModified: row.updated_at
            ? new Date(row.updated_at)
            : row.published_at
              ? new Date(row.published_at)
              : now,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        }));
      }
    }
  } catch {
    // RLS or env: ship static URLs only
  }

  return [...staticEntries, ...consultantEntries, ...blogEntries];
}
