import type { FrontendBlock, FrontendPageModel } from "@/lib/frontend/types";
import { contentAdapter } from "@/lib/content/adapter";

/**
 * Resolves a public page by its URL path through the Page Registry /
 * structured content layer (see lib/content/). This replaced a flat
 * kind-keyed mock object (lib/frontend/mock.ts, removed) — content now
 * lives in typed entities + reusable ContentBlocks + Evidence
 * (lib/content/repository/*), gated by a PageRegistry, and is only
 * resolved into this presentation-facing FrontendPageModel shape here.
 * Presentational components (components/design-system/pages/*) are
 * unchanged: they still read only FrontendPageModel/FrontendBlock.
 */
export function getFrontendPage(path: string): FrontendPageModel {
  const page = contentAdapter.getPageModel(path);
  if (!page) {
    throw new Error(
      `No published PageRegistry entry for "${path}". Add one in lib/content/repository/page-registry.ts before routing to it.`,
    );
  }
  return page;
}

export function getPageMetadata(page: FrontendPageModel) {
  return { title: page.seo.title, description: page.seo.description };
}

/** Pulls the single block of a given type out of a page's block array. Each
 * page composition reads only the blocks it needs and lays them out on its
 * own terms — there is no generic renderer that stamps every block type in
 * array order across every page kind. */
export function pickBlock<T extends FrontendBlock["type"]>(
  page: FrontendPageModel,
  type: T,
): Extract<FrontendBlock, { type: T }> | undefined {
  return page.blocks.find((block): block is Extract<FrontendBlock, { type: T }> => block.type === type);
}
