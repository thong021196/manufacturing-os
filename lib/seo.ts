import type { Metadata } from "next";

/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production/preview
 * environments (see .env.example); falls back to a placeholder so builds
 * never crash for lack of it, but production deploys should always set it
 * explicitly. */
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.manufacturingos.example").replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Builds Next.js Metadata for a public page, including canonical URL and
 * Open Graph, from a PageRegistry-shaped title/description and its path.
 * `noindex` follows the PageRegistry entry's indexPolicy (e.g. legal
 * placeholder pages pending counsel review are never indexed). */
export function buildMetadata(input: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "Manufacturing OS",
      type: "website",
    },
    robots: input.noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
