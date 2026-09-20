# Migration Plan

How PR #21's research is preserved, what does (and does not) happen to it, and — per the issue's Human Gate requirement — the consolidated list of unresolved architecture questions raised across all 13 deliverables in this pass.

## 1. What is preserved, and how

Nothing in `docs/research/search-intent-pilot/` (PR #21's own folder) is touched by this pass — this branch does not modify, move, or delete any file under `docs/research/`, per this task's explicit instruction. PR #21's research is preserved in three independent ways:

1. **As the literal source document.** `docs/research/search-intent-pilot/` remains on its own branch (`claude/issue-20-search-intent-pilot`), unmerged, untouched, and is the citable source for every fact carried into this architecture.
2. **As explicit mapping.** `pr21-mapping.csv` (deliverable 10) maps every one of PR #21's 34 candidate pages into the new model, preserving its `build_status`, its evidence URLs (as future `Evidence` documents), and its specific rationale (query-hygiene notes, cannibalization decisions) in each row's `required_migration_note`.
3. **As worked instantiation.** `worked-examples.md` shows three of PR #21's own pages (OBJ01, APP01, PRB_B) fully re-expressed as entities/relations/evidence/content blocks, carrying forward PR #21's specific findings (including its own honest evidence gaps — see `worked-examples.md` §1.3 on the un-verified bearing-bore tolerance figure) rather than re-deriving or re-fabricating them.

## 2. No destructive migration

- No `/robot-parts/...` URL is created, published, or deployed by this pass — there is nothing to migrate away from, because nothing was ever put into production under that prefix. The issue's own framing ("do NOT inherit its `/robot-parts/...` URL assumptions as production architecture") is satisfied by never instantiating them, not by migrating existing live URLs.
- No existing route in this repository's `app/` tree is added, removed, or changed.
- No Sanity project is created, no schema is deployed, no documents are written to a live CMS. Every JSON/schema snippet in `sanity-schema-proposal.md` and `worked-examples.md` is illustrative pseudocode in a markdown fence, not data entered anywhere.
- No Postgres/Supabase migration file is added; `lib/types.ts` is unmodified.

## 3. What a future BUILD pass would actually do (not performed here)

Recorded for planning purposes only:

1. Stand up a Sanity project from `sanity-schema-proposal.md`'s schemas.
2. For each `keep` row in `pr21-mapping.csv`, author the corresponding `Part`/`Application`/`ProcessCapability` document and its evidence, using PR #21's cited URLs as the evidence source (re-verified, not blindly copied, per AGENTS.md rule #7's `last_verified` requirement).
3. Author `ContentBlock` documents for shared technical concepts (bearing-bore concentricity, 7075-T6 material properties, 5-axis process explanation, etc.) before authoring individual Part pages, so reuse is designed in from the first page rather than retrofitted.
4. Create `pageRegistry` records for the `keep` set with `publishStatus: draft`, route them through normal editorial review, and only then move any of them to `published` — one page at a time, through the Human Gate, not as a batch.
5. Implement the actual Next.js route templates per `rendering-revalidation.md`, reading the current `node_modules/next/dist/docs/` in that future session before writing any route code, per this repo's AGENTS.md instruction (not done in this pass, since no Next.js code is written here).
6. Resolve the unresolved questions in §4 below, ideally before or during step 4-5, not after pages are live.

## 4. Unresolved architecture questions (consolidated, for Human Gate review)

| ID | Question | Raised in | Recommended default (not decided) |
|---|---|---|---|
| UQ-1 | `Part` is now used for two different things: the new public knowledge entity proposed here, and the existing private `lib/types.ts` `Part` (a specific physical part instance tied to one RFQ/revision). Which name changes? | `architecture-decision.md` §6, `operational-boundary.md` §3.2 | Rename the private one to `PartInstance` (smaller blast radius — fewer references in the current mock-data app than a rename touching every future public-content reference would have) — but this is a naming call for whoever owns `lib/types.ts` going forward, not decided here. |
| UQ-2 | `lib/types.ts`'s existing `Component` mixes public-knowledge fields and private-operational fields (`operational-boundary.md` §3.1). Does a future pass actually split it into a public `Part`/`Assembly` + a slimmer private `Component` referencing it by `sanityPartId`, or keep `Component` as-is and treat the new Sanity layer as purely additive/parallel? | `operational-boundary.md` §3.1 | Split, for consistency with the rest of this architecture — but this is a real refactor of existing app code and should be scoped as its own issue, not decided implicitly here. |
| UQ-3 | Is `Domain` (grouping `Application`s, e.g. "Robotics") the right shape, or should "Robotics" instead be a first-class root entity with its own stronger semantics (e.g. owning default navigation, default content-block scoping)? This pass deliberately kept `Domain` minimal (no slug, nav-grouping only) per the issue's "Robotics is the first application domain, not the root ontology," but a stronger `Domain` concept might be wanted later for domain-specific defaults (e.g. different `example_rfq` fields per domain). | `entity-relationship.md` §2.3, `url-namespace-policy.md` §2 | Keep minimal for now; expand only if a second domain's actual needs (not speculative ones) demand it — consistent with AGENTS.md rule #10, "avoid premature automation." |
| UQ-4 | When a `Part` references `ContentBlock`s and `Evidence` of differing confidence levels, is the Part's own overall `status`/confidence auto-computed (e.g. floor of all referenced blocks) or manually set by an editor? | `sanity-schema-proposal.md` §6 | Manual, at least initially — auto-rollup is a nice-to-have that risks silently downgrading a well-evidenced page because of one weakly-evidenced cross-referenced block; needs product input before automating. |
| UQ-5 | Who owns the eventual GSC ingestion job (`SearchQuery`/`SearchPerformanceRecord` population), on what cadence, and with what retention policy? Not automated in this pass per the issue's explicit instruction. | `search-intent-integration.md` §3 | Scope as its own future issue once real pages are published and have real GSC data to ingest — premature before then. |
| UQ-6 | Is `pageRegistry.contentVersion` incremented by an explicit Sanity Studio document action, a webhook-computed content hash, or another mechanism? Needed for CDN/ISR cache-key correctness once real revalidation is implemented. | `page-registry.md` §1, `rendering-revalidation.md` §4 | Content-hash-on-publish via a Sanity webhook is the most robust (immune to accidental manual-field-forgetting) — but this is an implementation choice for the BUILD phase, not decided here. |
| UQ-7 | Redirect mechanism for slug/URL changes after publication (`page-registry.md` §4, `url-namespace-policy.md` §5): a static `next.config` `redirects()` list, or a runtime lookup against live `pageRegistry` `canonical_redirect` records? | `url-namespace-policy.md` §5 | Runtime lookup, once the registry is large enough that regenerating a static config on every change becomes friction — but a static list is simpler to start with at low page counts. Needs a BUILD-phase decision once real redirect volume is known. |
| UQ-8 | When should an M:N edge be promoted from a plain bidirectional reference to a full `EntityRelation` document with its own evidence/confidence (`entity-relationship.md` §2.3)? No worked example in this pass needed one — the threshold (e.g. "only when a competitor's page or industry source specifically corroborates the relation itself, independent of either endpoint's own evidence") is proposed but not tested against a real case. | `entity-relationship.md` §2.3 | Leave the mechanism available but unused until a real case demands it — do not pre-build `EntityRelation` documents speculatively. |
| UQ-9 | Timing and ownership of the actual literal data-entry step (turning `pr21-mapping.csv`'s 18 `keep` rows into real Sanity documents) — is this the next issue immediately after this one merges, or does it wait for a separate Sanity-project-setup issue first? | `migration-plan.md` §3 | Sequence as: (a) a small infra issue to stand up the Sanity project and schemas from `sanity-schema-proposal.md`, then (b) a content-authoring issue per `pr21-mapping.csv`'s `keep` set — kept as two issues so infrastructure review and content/evidence review aren't conflated in one PR. |

None of UQ-1 through UQ-9 blocks the *architecture* proposed in this pass from being reviewed and approved at the Human Gate — each is a scoped decision for a future BUILD-phase issue, not a defect in the graph/registry/namespace design itself. They are surfaced here precisely so they get decided deliberately, by the owner and/or OpenAI's architecture review, rather than by default during implementation.

## 5. No production URL changes (restated)

To close the loop explicitly, since it is one of the issue's most emphasized constraints: this pass changes zero production URLs, because it creates zero production URLs. The current live site (if any exists outside this repo's internal-tooling `app/` shell) is entirely unaffected. `pr21-mapping.csv`'s `proposed_canonical_path` column is exactly that — proposed — and takes effect only once a future BUILD pass's `pageRegistry` records move to `publishStatus: published`, each one individually reviewed.
