# Internal Linking

How links between public pages are generated from the graph, and why navigation/breadcrumbs are a separate, editable rendering rather than a second copy of canonical identity.

## 1. Relationship-driven linking

Every link between two public pages should be derivable from a graph relation, not hand-authored prose links scattered through page bodies. Concretely, per page type:

- **Part page** (`/parts/robot-joint-housing/`): links out to every `Application` in its `applications[]` (via a `related_applications` relational `ContentBlock`), every `ProcessCapability` in its `processes[]`, every `Material` in its `materials[]`, every `EngineeringProblem` in its `engineeringProblems[]`, every `InspectionConcept` in its `inspectionConcepts[]`, and every `Part` in its `relatedParts[]` — plus, where relevant, any `Assembly` listing it in `contains[]` (resolved via reverse reference).
- **Application page** (`/applications/humanoid-robots/`): links to every `Part`/`Assembly` in `usedParts[]`/`usedAssemblies[]` and every `ProcessCapability` in `relevantProcesses[]` — this is the entire mechanism behind acceptance test 2 ("aggregate relevant parts/processes through relations without owning/copying their source technical knowledge"). The Application page never contains its own copy of, say, the bearing-bore explanation; it links to the Part page (or pulls in the same `EngineeringProblem`-scoped `ContentBlock` directly, per `rendering-revalidation.md` §3) rather than restating it.
- **Capability page** (`/capabilities/5-axis-machining/`): links to every `Part`/`Assembly` in `appliesToParts[]`/`appliesToAssemblies[]` — this is acceptance test 3's mechanism. It never generates a link (or a page) for every possible Part, only for the ones an actual relation connects it to, and it never creates `capability × part` cross-product pages (`page-registry.md` §3.1).

Only a `pageRegistry` record with `publishStatus: published` and `indexPolicy: index` produces a clickable, crawlable link — a relation to an entity whose own page isn't published yet (e.g. `Part: harmonic-reducer-housing` in `worked-examples.md`, which has no `pageRegistry` record) renders as plain text or is simply omitted from the linked list, never as a broken link or a link to a draft URL.

## 2. Breadcrumbs and navigation vs. canonical identity — the `NavNode` contract

A page's canonical URL (`pageRegistry.canonicalPath`) is fixed at authoring time and never depends on where the page happens to be reachable from in a menu. Breadcrumbs and menus are rendered from `NavNode` documents (`entity-relationship.md` §2.3, schema in `sanity-schema-proposal.md` §5), which are a **separate, parallel structure**:

```
NavNode: "Parts" (root)
 └─ NavNode: "Housings" → target: pageRegistry(/parts/) [category listing]
     └─ NavNode: "Robot Joint Housing" → target: pageRegistry(/parts/robot-joint-housing/)

NavNode: "Applications" (root)
 └─ NavNode: "Humanoid Robots" → target: pageRegistry(/applications/humanoid-robots/)
     └─ NavNode: "Robot Joint Housing" → target: pageRegistry(/parts/robot-joint-housing/)   ← SAME page, second NavNode
```

The Robot Joint Housing page is reachable (and gets a coherent breadcrumb: "Applications / Humanoid Robots / Robot Joint Housing") from **both** places, because two `NavNode` documents both `target` the same `pageRegistry` record. Its own `canonicalPath` (`/parts/robot-joint-housing/`) never changes regardless of which `NavNode` a visitor arrived through — the rendered breadcrumb reflects *how the visitor navigated*, or a chosen default primary breadcrumb (typically its own namespace: "Parts / Robot Joint Housing"), not an assertion about the entity's "true parent." This is the literal mechanism behind invariant #13 ("URL identity must not depend on current navigation hierarchy. Taxonomy/navigation may evolve without forcing canonical URL migration") — the taxonomy (`NavNode` tree) can be entirely restructured, re-parented, renamed, or split into multiple menus (primary nav vs. footer vs. a future "Industries" mega-menu) with zero effect on any `canonicalPath`.

## 3. Avoiding hard-coded tree assumptions

Nothing in the rendering layer (`rendering-revalidation.md` §1) assumes a page has exactly one parent, one breadcrumb path, or a fixed depth. Any component that renders "related pages," a breadcrumb, or a sidebar must resolve its list from the entity graph (§1) or from `NavNode` (§2) at render time — never from a hand-maintained constant list of "children" baked into a page template, which is exactly the failure mode PR #21's own site map risked (its `related_parent_page`/`related_child_pages` CSV columns are a single fixed hierarchy per page, workable for a 34-page pilot but not for the graph this pass replaces it with). Where PR #21 wrote "related_parent_page: CAT01" for nearly every object page, the equivalent in this architecture is simply: the Part's `applications[]` relation (plural, real) plus, if wanted, one or more `NavNode` placements — never a single hard-coded parent field on the entity itself.

## 4. Cross-linking without duplication (the "cross-link heavily rather than duplicate" pattern)

PR #21's own `pilot-pages.csv`/`cannibalization-map.csv` repeatedly recommend "cross-link rather than duplicate" (bearing housing ↔ joint/actuator housing, OBJ20 ↔ PRB_A, APP09 ↔ PRB_A). This architecture makes that the *only* available pattern rather than a stylistic recommendation an author has to remember: since content lives in `ContentBlock` documents referenced by entities (not copied into page bodies), two pages that both need to discuss the same concept share the same `ContentBlock` automatically once both entities reference the same `EngineeringProblem`/`Material`/etc. — there is no separate "duplicate the paragraph" action available to a content author in the first place. Where genuinely distinct framing is still needed for two audiences (e.g. an Application page's brief mention of a technical concept vs. a Part page's deep-dive), that's two different `ContentBlock`s of different `blockType` (e.g. `definition` on the Application page vs. `critical_features` on the Part page) each scoped and authored for its own purpose — still no copy, just two different reusable units.
