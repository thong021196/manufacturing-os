import { notFound } from "next/navigation";
import { KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";
import { contentAdapter } from "@/lib/content/adapter";
import { liveMetadata, requireLivePage } from "@/lib/content/live";
import { isLiveBySchedule } from "@/lib/content/publishing";

/**
 * Shared implementation for content-calendar ("guide") route files. Each
 * URL prefix that holds guide pages has one tiny optional catch-all route
 * file, e.g. app/robot-parts/[[...slug]]/page.tsx, that re-exports these
 * helpers plus a literal `export const revalidate = 300`.
 *
 * Why per-prefix and not one root catch-all: the route keeps the default
 * dynamicParams = true (see the route file for why `false` breaks on-demand
 * revalidation), so proxy.ts must turn away non-registry paths under the
 * prefix before they create ISR cache entries -- a root-level catch-all
 * would put the proxy in front of every URL on the site.
 *
 * Adding a prefix = copy app/robot-parts/[[...slug]]/page.tsx to
 * app/<prefix>/[[...slug]]/page.tsx, add the prefix to GUIDE_PREFIXES in
 * lib/content/publishing.ts (validateRegistry enforces it) and to the
 * matcher in proxy.ts.
 */
export function guideRoute(prefix: string) {
  const toPath = (slug: string[] | undefined): string =>
    slug && slug.length > 0 ? `${prefix}/${slug.map((s) => decodeURIComponent(s)).join("/")}` : prefix;

  function generateStaticParams() {
    const now = new Date();
    const guides = contentAdapter
      .getAllEntries()
      .filter((e) => e.pageKind === "guide" && (e.path === prefix || e.path.startsWith(`${prefix}/`)));
    // Every guide path (drafts and future-scheduled included) becomes an ISR
    // entry that 404s until live and flips to rendered on revalidation after
    // publishAt. The static GitHub Pages preview (no server) only exports
    // what is live at build time.
    const exported = process.env.GITHUB_PAGES === "true" ? guides.filter((e) => isLiveBySchedule(e, now)) : guides;
    return exported.map((e) => ({ slug: e.path === prefix ? [] : e.path.slice(prefix.length + 1).split("/") }));
  }

  async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
    return liveMetadata(toPath((await params).slug));
  }

  async function GuidePage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const path = toPath((await params).slug);
    const entry = contentAdapter.getPageRegistryEntry(path);
    if (!entry || entry.pageKind !== "guide") notFound();
    const page = await requireLivePage(path);
    return <KnowledgeIndex page={page} />;
  }

  return { generateStaticParams, generateMetadata, GuidePage };
}
