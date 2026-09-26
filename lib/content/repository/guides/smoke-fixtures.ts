import type { ContentBlock, PageRegistryEntry, Provenance } from "@/lib/content/types";
import type { GuidePage } from "@/lib/content/repository/guides";

/**
 * TEST-ONLY content-calendar fixtures, loaded only when the server process
 * (build AND runtime) has CONTENT_SMOKE_FIXTURES=true. Production never sets
 * it (infra/terraform/ecs.tf does not, CI's production image build does
 * not). They exist so the scheduled-publishing behaviour can be verified end
 * to end in a local smoke test:
 *
 *   /smoke-fixtures/scheduled-past     scheduled, publishAt in the past -> renders
 *   /smoke-fixtures/scheduled-future   scheduled, publishAt in 2099     -> 404
 *   /smoke-fixtures/draft              draft                            -> 404
 *   /smoke-fixtures/scheduled-soon     scheduled at CONTENT_SMOKE_SOON_AT
 *                                      (optional) -> 404, then renders after
 *                                      that time on the next revalidation
 *
 * Body copy is deliberately generic placeholder text: no manufacturing
 * claims of any kind.
 */
const fixtureProvenance: Provenance = {
  source: "structured_fixture",
  confidence: "low",
  lastVerified: "2026-09-26",
  evidenceId: "ev-launch-copy-2026-09",
};

function fixture(slug: string, title: string, publishStatus: PageRegistryEntry["publishStatus"], publishAt?: string): GuidePage {
  const path = `/smoke-fixtures/${slug}`;
  const blocks: ContentBlock[] = [
    {
      id: `cb-smoke-${slug}-hero`,
      kind: "knowledge",
      blockType: "hero",
      data: {
        eyebrow: "TEST FIXTURE",
        title,
        summary: "Content-calendar smoke-test fixture. Not real content; only present when CONTENT_SMOKE_FIXTURES=true.",
        meta: [
          { label: "Status", value: publishStatus },
          { label: "Publish at", value: publishAt ?? "n/a" },
        ],
        visualLabel: "Fixture",
        visualCode: `SMOKE / ${slug.toUpperCase()}`,
      },
      provenance: fixtureProvenance,
      appliesTo: [],
    },
    {
      id: `cb-smoke-${slug}-cta`,
      kind: "knowledge",
      blockType: "cta",
      data: { title: "Fixture call to action", body: "Placeholder text for the smoke test." },
      provenance: fixtureProvenance,
      appliesTo: [],
    },
  ];
  return {
    entry: {
      path,
      pageKind: "guide",
      contentBlockIds: blocks.map((b) => b.id),
      title,
      description: "Content-calendar smoke-test fixture.",
      breadcrumbs: [{ label: "Fixtures" }, { label: title }],
      publishStatus,
      publishAt,
      // Fixtures are never meant to be indexed, but "index" lets the smoke
      // test prove the sitemap includes a live scheduled page and excludes
      // a future one.
      indexPolicy: "index",
      seo: { title: `${title} | Manufacturing OS`, description: "Content-calendar smoke-test fixture." },
      updatedAt: "2026-09-26",
    },
    blocks,
  };
}

export function smokeFixtureGuides(): GuidePage[] {
  const pages = [
    fixture("scheduled-past", "Scheduled (past) fixture", "scheduled", "2026-01-01T00:00:00Z"),
    fixture("scheduled-future", "Scheduled (future) fixture", "scheduled", "2099-01-01T00:00:00Z"),
    fixture("draft", "Draft fixture", "draft"),
  ];
  const soon = process.env.CONTENT_SMOKE_SOON_AT;
  if (soon && !Number.isNaN(Date.parse(soon))) {
    pages.push(fixture("scheduled-soon", "Scheduled (soon) fixture", "scheduled", soon));
  }
  return pages;
}
