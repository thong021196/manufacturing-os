import type { FactProvenance, FrontendBlock, FrontendPageModel } from "@/lib/frontend/types";
import type { ContentBlock, PageRegistryEntry, Provenance } from "@/lib/content/types";
import { getContentBlock } from "@/lib/content/repository/content-blocks";
import { getEvidence } from "@/lib/content/repository/evidence";
import { getApplication, getPart, getProcessCapability } from "@/lib/content/repository/entities";

function toFactProvenance(p: Provenance): FactProvenance {
  const evidence = p.evidenceId ? getEvidence(p.evidenceId) : undefined;
  return {
    source: p.source,
    confidence: p.confidence,
    lastVerified: p.lastVerified,
    evidence: evidence?.summary ?? "See lib/content/repository/evidence.ts.",
  };
}

type BlockOf<T extends FrontendBlock["type"]> = Extract<FrontendBlock, { type: T }>;
/** The raw, provenance-free shape a ContentBlock.data payload carries for
 * an array-of-rows block type — provenance is injected at render time from
 * the block's own Provenance record (see the comment on resolveBlock). */
type Unprovenanced<T> = T extends { provenance?: FactProvenance } ? Omit<T, "provenance"> : T;

function withProvenance<T extends { provenance?: FactProvenance }>(items: Unprovenanced<T>[], fp: FactProvenance): T[] {
  return items.map((item) => ({ ...item, provenance: fp })) as T[];
}

/** Resolves one ContentBlock into the FrontendBlock shape the presentation
 * layer (components/design-system/pages/*) renders. Item-level rows carry
 * the block's own provenance unless a row supplies a more specific one —
 * this is the "auto-rollup vs manual" question UQ-4 flags; MVP default is
 * "inherit the block's provenance," which is the more conservative choice
 * since every row is still traceable to a real Evidence record. */
function resolveBlock(block: ContentBlock): FrontendBlock {
  const fp = toFactProvenance(block.provenance);

  switch (block.blockType) {
    case "specGrid": {
      const data = block.data as { items: Unprovenanced<BlockOf<"specGrid">["items"][number]>[] };
      return { type: "specGrid", items: withProvenance(data.items, fp) };
    }
    case "criticalFeatures": {
      const data = block.data as { features: Unprovenanced<BlockOf<"criticalFeatures">["features"][number]>[] };
      return { type: "criticalFeatures", features: withProvenance(data.features, fp) };
    }
    case "materials": {
      const data = block.data as { rows: Unprovenanced<BlockOf<"materials">["rows"][number]>[] };
      return { type: "materials", rows: withProvenance(data.rows, fp) };
    }
    case "manufacturingRoute": {
      const data = block.data as { steps: Unprovenanced<BlockOf<"manufacturingRoute">["steps"][number]>[] };
      return { type: "manufacturingRoute", steps: withProvenance(data.steps, fp) };
    }
    case "inspection": {
      const data = block.data as { rows: Unprovenanced<BlockOf<"inspection">["rows"][number]>[] };
      return { type: "inspection", rows: withProvenance(data.rows, fp) };
    }
    case "applications": {
      const data = block.data as { title: string; items: Unprovenanced<BlockOf<"applications">["items"][number]>[] };
      return { type: "applications", title: data.title, items: withProvenance(data.items, fp) };
    }
    case "relatedEntities": {
      const data = block.data as { title: string; items: Unprovenanced<BlockOf<"relatedEntities">["items"][number]>[] };
      return { type: "relatedEntities", title: data.title, items: withProvenance(data.items, fp) };
    }
    case "hero":
      return { type: "hero", ...(block.data as Omit<BlockOf<"hero">, "type">) };
    case "capabilityStrip":
      return { type: "capabilityStrip", ...(block.data as Omit<BlockOf<"capabilityStrip">, "type">) };
    case "fileRequirements":
      return { type: "fileRequirements", ...(block.data as Omit<BlockOf<"fileRequirements">, "type">) };
    case "faq":
      return { type: "faq", ...(block.data as Omit<BlockOf<"faq">, "type">) };
    case "cta":
      return { type: "cta", ...(block.data as Omit<BlockOf<"cta">, "type">) };
    default:
      throw new Error(`Unknown content block type: ${block.blockType}`);
  }
}

function resolveBlockIds(ids: string[]): FrontendBlock[] {
  return ids.map((id) => {
    const block = getContentBlock(id);
    if (!block) throw new Error(`Content block not found: ${id}. Check page-registry.ts / entities.ts references.`);
    return resolveBlock(block);
  });
}

/** Composes a PageRegistryEntry into the FrontendPageModel the existing
 * (accepted) presentational components already read. This is the seam a
 * future Sanity-backed ContentAdapter replaces — everything above this
 * function (repository/*.ts) changes, nothing below it (components/) does. */
export function composePageModel(entry: PageRegistryEntry): FrontendPageModel | null {
  // Publish gating (draft/scheduled/unpublished/paused) is decided by the
  // callers via lib/content/publishing.ts -- this function only composes.

  let blockIds: string[];
  if (entry.entity) {
    const e =
      entry.entity.kind === "part"
        ? getPart(entry.entity.id)
        : entry.entity.kind === "application"
          ? getApplication(entry.entity.id)
          : entry.entity.kind === "processCapability"
            ? getProcessCapability(entry.entity.id)
            : undefined;
    if (!e) throw new Error(`PageRegistry entry ${entry.path} references missing entity ${entry.entity.kind}:${entry.entity.id}`);
    blockIds = e.contentBlockIds;
  } else {
    blockIds = entry.contentBlockIds ?? [];
  }

  const kindMap: Record<PageRegistryEntry["pageKind"], FrontendPageModel["kind"]> = {
    home: "part", // unused: home renders its own bespoke composition, not via FrontendPageModel
    part: "part",
    application: "application",
    capability: "capability",
    quality: "quality",
    howItWorks: "engineering",
    company: "engineering",
    manufacturingNetwork: "engineering",
    resources: "resource",
    resourceArticle: "engineering",
    rfq: "engineering",
    guide: "engineering",
  };

  return {
    kind: kindMap[entry.pageKind],
    slug: entry.path.split("/").filter(Boolean).pop() ?? "",
    title: entry.title,
    description: entry.description,
    seo: entry.seo,
    breadcrumbs: entry.breadcrumbs,
    blocks: resolveBlockIds(blockIds),
  };
}
