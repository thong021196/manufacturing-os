import type { MetadataRoute } from "next";
import { contentAdapter } from "@/lib/content/adapter";
import { absoluteUrl } from "@/lib/seo";

/** Generated from the Page Registry (lib/content/repository/page-registry.ts)
 * — only published, indexable entries are listed, so a draft/noindex page
 * (e.g. the legal placeholders pending counsel review) never appears here. */
export default function sitemap(): MetadataRoute.Sitemap {
  return contentAdapter.getIndexableEntries().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.updatedAt,
    changeFrequency: entry.path === "/" ? "weekly" : "monthly",
    priority: entry.path === "/" ? 1 : entry.pageKind === "rfq" ? 0.9 : 0.6,
  }));
}
