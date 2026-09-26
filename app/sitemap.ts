import type { MetadataRoute } from "next";
import { getLiveIndexableEntries } from "@/lib/content/live";
import { absoluteUrl } from "@/lib/seo";

// Regenerated at most every 300 s (same cadence as public pages), so a
// scheduled page enters the sitemap once its publishAt passes and a paused
// page leaves it -- no redeploy. The GitHub Pages static preview build
// exports it once at build time.
export const revalidate = 300;

/** Generated from the Page Registry — only entries that are live right now
 * (lib/content/publishing.ts) and indexable are listed, so drafts,
 * future-scheduled, unpublished, paused and noindex pages (e.g. the legal
 * placeholders pending counsel review) never appear here. /admin is never
 * in the registry. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getLiveIndexableEntries();
  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.publishStatus === "scheduled" && entry.publishAt ? entry.publishAt.slice(0, 10) : entry.updatedAt,
    changeFrequency: entry.path === "/" ? "weekly" : "monthly",
    priority: entry.path === "/" ? 1 : entry.pageKind === "rfq" ? 0.9 : 0.6,
  }));
}
