import type { ContentBlock, PageRegistryEntry } from "@/lib/content/types";
import { smokeFixtureGuides } from "@/lib/content/repository/guides/smoke-fixtures";

/**
 * Content-calendar pages ("guide" page kind), rendered by the generic
 * catch-all route app/[...slug]/page.tsx through the same ContentBlock /
 * Evidence / provenance model as every other public page.
 *
 * HOW NEW PAGES ARRIVE (docs/ops/content-pipeline.md):
 *  1. A scheduled Claude routine drafts ONE file per page in this folder
 *     (e.g. `robot-mounting-bracket.ts`) exporting a GuidePage with
 *     `publishStatus: "scheduled"` and a future `publishAt`, adds it to
 *     `guidePages` below, and opens a PR labelled `content`.
 *  2. The owner reviews and merges the PR during a visit (= approval).
 *  3. The page goes live by itself once `publishAt` passes (public pages
 *     revalidate every 5 minutes -- no redeploy).
 *
 * Evidence rules (AGENTS.md rule 7, same as the rest of the repo): every
 * block carries provenance pointing at an Evidence record; no invented
 * tolerances, certifications, capacities, prices, lead times or customer
 * claims. A page without enough real evidence stays `draft`.
 */
export interface GuidePage {
  entry: PageRegistryEntry;
  blocks: ContentBlock[];
}

export const guidePages: GuidePage[] = [
  // No content-calendar pages yet. The first ones come from the validated
  // search-intent pilot candidates listed in docs/ops/content-pipeline.md.
];

/** Test-only fixtures (never set in production -- see smoke-fixtures.ts). */
function fixturePages(): GuidePage[] {
  return process.env.CONTENT_SMOKE_FIXTURES === "true" ? smokeFixtureGuides() : [];
}

export function allGuidePages(): GuidePage[] {
  return [...guidePages, ...fixturePages()];
}
