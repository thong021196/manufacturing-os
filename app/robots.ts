import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Revalidated (not force-static) so the Sitemap: line uses the runtime
// SITE_URL of the deployed image rather than whatever was set at build time.
export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/operational surfaces are never publicly indexed
        // (AGENTS.md rule #4 — CAD/customer files must never be publicly
        // indexed). The internal ops dashboard under these prefixes has no
        // customer data itself, but is not part of the public product and
        // is kept out of search regardless.
        disallow: [
          // Owner admin: also noindex via X-Robots-Tag (proxy.ts) and
          // metadata, and login-gated server-side.
          "/admin",
          "/api/",
          "/ops",
          "/discovery/",
          "/execution/",
          "/intelligence/",
          "/knowledge/",
          "/supply/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
