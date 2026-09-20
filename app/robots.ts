import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

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
