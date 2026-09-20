import { frontendPages } from "@/lib/frontend/mock";
import type { FactProvenance, FrontendBlock, FrontendPageModel } from "@/lib/frontend/types";

const mockProvenance: FactProvenance = {
  source: "structured_mock_fixture",
  confidence: "medium",
  lastVerified: "2026-09-20",
  evidence: "Design-system fixture; replace with CMS or operational evidence before publication.",
};

function addProvenance<T extends object>(entry: T & { provenance?: FactProvenance }): T & { provenance: FactProvenance } {
  return { ...entry, provenance: entry.provenance ?? mockProvenance };
}

function normalizeBlocks(blocks: FrontendBlock[]): FrontendBlock[] {
  return blocks.map((block) => {
    if (block.type === "specGrid") return { ...block, items: block.items.map(addProvenance) };
    if (block.type === "criticalFeatures") return { ...block, features: block.features.map(addProvenance) };
    if (block.type === "materials") return { ...block, rows: block.rows.map(addProvenance) };
    if (block.type === "manufacturingRoute") return { ...block, steps: block.steps.map(addProvenance) };
    if (block.type === "inspection") return { ...block, rows: block.rows.map(addProvenance) };
    if (block.type === "applications" || block.type === "relatedEntities") return { ...block, items: block.items.map(addProvenance) };
    return block;
  });
}

function normalizePage(page: FrontendPageModel): FrontendPageModel {
  return { ...page, blocks: normalizeBlocks(page.blocks) };
}

export function getFrontendPage(kind: FrontendPageModel["kind"]): FrontendPageModel {
  return normalizePage(frontendPages[kind]);
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
