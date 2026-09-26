import type { Metadata } from "next";

// Looked up through a variable on purpose: Next.js inlines literal
// `process.env.NEXT_PUBLIC_*` reads at BUILD time, and the production
// Docker image is built once in CI and configured at runtime by ECS. A
// dynamic lookup is read at runtime instead.
const RUNTIME_SITE_URL_KEYS = ["SITE_URL", "NEXT_PUBLIC_SITE_URL"];

/** Canonical site origin. Production sets SITE_URL on the ECS task
 * (infra/terraform/ecs.tf, from var.site_url); NEXT_PUBLIC_SITE_URL is still
 * honoured for local/preview builds. Falls back to a placeholder so builds
 * never crash for lack of it. */
export function siteOrigin(): string {
  const env = process.env;
  const value = RUNTIME_SITE_URL_KEYS.map((key) => env[key]).find((v) => typeof v === "string" && v.trim() !== "");
  return (value || "https://www.manufacturingos.example").replace(/\/$/, "");
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
