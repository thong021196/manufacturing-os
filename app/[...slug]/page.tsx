import { notFound } from "next/navigation";
import { KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";
import { contentAdapter } from "@/lib/content/adapter";
import { liveMetadata, requireLivePage } from "@/lib/content/live";
import { isLiveBySchedule } from "@/lib/content/publishing";

/**
 * Generic renderer for content-calendar pages (pageKind "guide", defined in
 * lib/content/repository/guides/). Hand-built pages with their own route
 * files always win over this catch-all; this route only ever serves paths
 * that have a "guide" registry entry.
 *
 * - dynamicParams = false: any path not returned by generateStaticParams is
 *   a 404 without rendering anything.
 * - Every guide entry (including drafts and future-scheduled ones) is
 *   returned, so each path exists as an ISR entry; the page 404s via
 *   requireLivePage until it is live, and the 300 s revalidation flips it
 *   to rendered after publishAt -- no redeploy.
 * - The GitHub Pages static preview (no server, no ISR) only exports pages
 *   that are live at build time.
 */
export const revalidate = 300;
export const dynamicParams = false;

function pathFromSlug(slug: string[]): string {
  return `/${slug.map((s) => decodeURIComponent(s)).join("/")}`;
}

export function generateStaticParams() {
  const guides = contentAdapter.getAllEntries().filter((e) => e.pageKind === "guide");
  const now = new Date();
  const exported = process.env.GITHUB_PAGES === "true" ? guides.filter((e) => isLiveBySchedule(e, now)) : guides;
  return exported.map((e) => ({ slug: e.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  return liveMetadata(pathFromSlug(slug));
}

export default async function GuidePage({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const entry = contentAdapter.getPageRegistryEntry(path);
  if (!entry || entry.pageKind !== "guide") notFound();
  const page = await requireLivePage(path);
  return <KnowledgeIndex page={page} />;
}
