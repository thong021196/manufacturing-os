import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { FrontendBlock, FrontendPageModel } from "@/lib/frontend/types";
import type { PageRegistryEntry } from "@/lib/content/types";
import { contentAdapter } from "@/lib/content/adapter";
import { composePageModel } from "@/lib/content/compose";
import { getPausedPaths } from "@/lib/content/overrides";
import { isEntryLive } from "@/lib/content/publishing";
import { buildMetadata } from "@/lib/seo";

/**
 * Request/regeneration-time publish gate used by every public page. Applies
 * the content-calendar schedule AND owner pauses (lib/content/publishing.ts)
 * at render time, so combined with `export const revalidate = 300` in each
 * public page, a scheduled page appears -- and a paused one disappears --
 * without a redeploy.
 */

export async function getLiveEntry(path: string, now: Date = new Date()): Promise<PageRegistryEntry | null> {
  const entry = contentAdapter.getPageRegistryEntry(path);
  if (!entry) return null;
  return isEntryLive(entry, now, await getPausedPaths()) ? entry : null;
}

/** Every registry path that is public right now. */
export async function getLivePaths(now: Date = new Date()): Promise<Set<string>> {
  const paused = await getPausedPaths();
  return new Set(
    contentAdapter
      .getAllEntries()
      .filter((e) => isEntryLive(e, now, paused))
      .map((e) => e.path),
  );
}

/** Registry paths that exist but are NOT public right now (draft,
 * future-scheduled, unpublished, paused). Links to these are removed. */
export async function getHiddenRegistryPaths(now: Date = new Date()): Promise<string[]> {
  const live = await getLivePaths(now);
  return contentAdapter
    .getAllEntries()
    .map((e) => e.path)
    .filter((p) => !live.has(p));
}

export async function getLiveIndexableEntries(now: Date = new Date()): Promise<PageRegistryEntry[]> {
  const paused = await getPausedPaths();
  return contentAdapter.getIndexableEntries().filter((e) => isEntryLive(e, now, paused));
}

/** Drops relation/link rows that point at a registry page which is not
 * public right now, so a scheduled page is never linked before it is live. */
function stripHiddenLinks(blocks: FrontendBlock[], hidden: ReadonlySet<string>): FrontendBlock[] {
  return blocks.map((block) => {
    if (block.type === "relatedEntities" || block.type === "applications") {
      return { ...block, items: block.items.filter((item) => !item.href || !hidden.has(item.href)) };
    }
    return block;
  });
}

/** The live page model for `path`, or a 404 (next/navigation notFound()). */
export async function requireLivePage(path: string): Promise<FrontendPageModel> {
  const entry = await getLiveEntry(path);
  if (!entry) notFound();
  const model = composePageModel(entry);
  if (!model) notFound();
  const hidden = new Set(await getHiddenRegistryPaths());
  return { ...model, blocks: stripHiddenLinks(model.blocks, hidden) };
}

/** 404s unless `path` is live. For registry pages whose body is bespoke
 * (home, company, rfq, legal) rather than composed from blocks. */
export async function requireLiveEntry(path: string): Promise<PageRegistryEntry> {
  const entry = await getLiveEntry(path);
  if (!entry) notFound();
  return entry;
}

/** Metadata for a registry page; falls back to noindex when not live (the
 * page itself 404s in that case). */
export async function liveMetadata(path: string): Promise<Metadata> {
  const entry = await getLiveEntry(path);
  if (!entry) return { robots: { index: false, follow: false } };
  return buildMetadata({
    path,
    title: entry.seo.title,
    description: entry.seo.description,
    noindex: entry.indexPolicy === "noindex",
  });
}
