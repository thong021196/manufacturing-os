import type { FrontendPageModel } from "@/lib/frontend/types";
import type { PageRegistryEntry } from "@/lib/content/types";
import { getPageRegistryEntry, getIndexablePaths, pageRegistry } from "@/lib/content/repository/page-registry";
import { composePageModel } from "@/lib/content/compose";

/**
 * ContentAdapter is the swap point called for by issue #25 / PR #24: a
 * future Sanity-backed implementation of this exact interface replaces
 * RepositoryContentAdapter below with zero changes to any page or
 * presentational component, because every page reads FrontendPageModel via
 * this interface, never the repository files directly.
 */
export interface ContentAdapter {
  getPageRegistryEntry(path: string): PageRegistryEntry | undefined;
  getPageModel(path: string): FrontendPageModel | null;
  getIndexableEntries(): PageRegistryEntry[];
  getAllEntries(): PageRegistryEntry[];
}

class RepositoryContentAdapter implements ContentAdapter {
  getPageRegistryEntry(path: string) {
    return getPageRegistryEntry(path);
  }
  getPageModel(path: string): FrontendPageModel | null {
    const entry = getPageRegistryEntry(path);
    if (!entry) return null;
    return composePageModel(entry);
  }
  getIndexableEntries() {
    return getIndexablePaths();
  }
  getAllEntries() {
    return pageRegistry;
  }
}

/** Singleton content adapter used throughout the app. Swapping to Sanity
 * means adding a `SanityContentAdapter implements ContentAdapter` and
 * changing this one export — see docs/architecture/entity-publishing-system/
 * for the target Sanity schema shape. */
export const contentAdapter: ContentAdapter = new RepositoryContentAdapter();
