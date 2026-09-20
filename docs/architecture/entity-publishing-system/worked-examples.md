# Worked Examples

Per the owner's priority #4: prove the architecture with Robot Joint Housing (a `Part`), Humanoid (an `Application`), and 5-Axis Machining (a `ProcessCapability`), end to end — entities → relations → evidence → content blocks → Page Registry → final URL → rendered page sections. All three trace directly to `pr21-mapping.csv` rows OBJ01, APP01, and PRB_B.

## 1. Robot Joint Housing (`Part`)

### 1.1 Entity

```json
{
  "_type": "part",
  "_id": "part-robot-joint-housing",
  "name": "Robot Joint Housing",
  "slug": { "current": "robot-joint-housing" },
  "aliases": ["robot joint housing", "joint shell", "robotic joint enclosure"],
  "summary": "A machined housing that carries a robot joint's bearing, motor face, and encoder interface.",
  "partFamily": "housing",
  "relatedParts": ["part-robot-actuator-housing", "part-harmonic-reducer-housing"],
  "applications": ["app-humanoid-robots", "app-industrial-robot-parts"],
  "processes": ["capability-5-axis-machining"],
  "materials": ["material-7075-t6-aluminum", "material-ti-6al-4v", "material-peek"],
  "engineeringProblems": ["eng-bearing-bore-concentricity"],
  "inspectionConcepts": ["quality-cmm-bore-report"],
  "lifecycleStages": ["lifecycle-prototype", "lifecycle-low-volume", "lifecycle-production"],
  "contentBlocks": ["block-joint-housing-definition", "block-joint-housing-part-variants"],
  "status": "reviewed",
  "evidenceRefs": ["evidence-jadecnc-joint-housing", "evidence-ptsmake-joint-housing"],
  "lastVerified": "2026-04-XX"
}
```

### 1.2 Relations (from PR #21's own research)

- `applications`: Humanoid Robots (`APP01`, PR #21 evidence Q032), Industrial Robot Parts (`APP04`, Q040 as the navigational hub).
- `relatedParts`: Robot Actuator Housing (`OBJ02` — PR #21 cross-link note: "cross-link OBJ03"), Harmonic Reducer Housing (`OBJ03` — real entity, no page of its own; see §1.5).
- `processes`: 5-Axis Machining (`PRB_B`) — this is the reverse direction of the relation used in §3 below.
- `engineeringProblems`: Bearing Bore Concentricity — the entity that owns the reusable tolerance-guidance content shared with Robot Bearing Housing (`OBJ05`).

### 1.3 Evidence

```json
{
  "_type": "evidence",
  "_id": "evidence-jadecnc-joint-housing",
  "claimId": "joint-housing-market-existence",
  "sourceUrl": "https://www.jadecnc.com/precision-cnc-machining-for-robot-joint-housings/",
  "sourceType": "supplier_marketing",
  "sourceTitle": "Precision CNC Machining for Robot Joint Housings",
  "observedFact": "A specialist CNC job shop runs a dedicated marketing page for custom robot joint housing machining, confirming commercial-supply-side existence for this object once framed with a 'custom CNC machining' qualifier.",
  "confidence": "medium",
  "lastVerified": "2026-04-XX",
  "notes": "Carried forward from PR #21 query Q001/Q051-Q055 (5/5 deepened framings confirmed clean, no wrong-buyer contamination). Evidence of commercial supply/search-surface existence, not buyer demand volume -- see market-summary.md's own explicit caveat, preserved here rather than overstated."
}
```

A second `evidence` document (`evidence-bearing-bore-tolerance-not-verified`) is deliberately created with `sourceType: "manual_entry"`, `confidence: "low"`, `observedFact: "No documentation-verified figure found for bearing-bore concentricity on this object; the only traceable prior figure was a single vendor's marketing claim, not independently verified."` — this is the honest carry-forward of PR #21's own neutralization of the ~0.0002in figure (`market-summary.md`, "Unsourced technical specs neutralized"). The architecture does not re-fabricate a number PR #21 correctly refused to publish; it records *why* the number is absent as its own evidence-backed fact.

### 1.4 Content blocks

- `block-joint-housing-definition` (`blockKind: knowledge`, `blockType: definition`, `appliesToEntityRefs: [part-robot-joint-housing]`) — what a robot joint housing is, page-specific (not reused elsewhere, since this is definitional to this one Part).
- A **shared** knowledge block, `block-bearing-bore-concentricity-guidance` (`blockType: critical_features`, `appliesToEntityRefs: [eng-bearing-bore-concentricity]`, cites `evidence-bearing-bore-tolerance-not-verified`) — reached via the Part's `engineeringProblems` relation, not listed in the Part's own `contentBlocks[]` array. This is the exact block used in `rendering-revalidation.md` §3's `bearing_bore` walkthrough; it is also referenced from `part-robot-actuator-housing` and `part-robot-bearing-housing` the same way.
- `block-joint-housing-part-variants` (`blockKind: relational`, `renderQuery: related_parts`) — renders `relatedParts` live; no authored prose.

### 1.5 Page Registry

```json
{
  "_type": "pageRegistry",
  "_id": "page-parts-robot-joint-housing",
  "pageId": "PART-ROBOT-JOINT-HOUSING",
  "pageType": "part",
  "primaryEntityRef": "part-robot-joint-housing",
  "secondaryEntityRefs": ["capability-5-axis-machining", "eng-bearing-bore-concentricity"],
  "canonicalPath": "/parts/robot-joint-housing/",
  "slug": { "current": "robot-joint-housing" },
  "searchIntentCluster": "cluster-int-01",
  "indexPolicy": "index",
  "buildStatus": "planned",
  "priority": "P0",
  "contentVersion": 1,
  "publishStatus": "draft",
  "lastReviewed": "2026-04-XX",
  "evidenceRefs": ["evidence-jadecnc-joint-housing"]
}
```

`publishStatus: draft` throughout — per the Human Gate, nothing in this pass is approved to publish. Compare this to **Harmonic Reducer Housing** (`part-harmonic-reducer-housing`, referenced in `relatedParts` above): it has a full `Part` document and real relations, but deliberately **no `pageRegistry` document at all**. Querying `pageRegistry` for `primaryEntityRef == "part-harmonic-reducer-housing"` returns nothing — it cannot be reached as a URL, only as a cross-link on OBJ01/OBJ02's pages, which is precisely acceptance test 6.

### 1.6 Rendered page sections (once approved to publish)

`/parts/robot-joint-housing/`:
1. Title/summary (from `part` document fields).
2. Definition (`block-joint-housing-definition`).
3. Critical features / tolerance guidance (`block-bearing-bore-concentricity-guidance` — shared).
4. Materials (relational block over `materials[]`: 7075-T6, Ti-6Al-4V, PEEK).
5. Manufacturing routes (relational block over `processes[]`: 5-Axis Machining, linking to `/capabilities/5-axis-machining/`).
6. Applications (relational block over `applications[]`: links to `/applications/humanoid-robots/` and `/applications/industrial-robot-parts/`).
7. Related parts (`block-joint-housing-part-variants`: Actuator Housing, Harmonic Reducer Housing — the latter rendered as plain related text/anchor, not a link, since it has no published URL yet).
8. Inspection strategy (relational block over `inspectionConcepts[]`).
9. Prototype-to-production note (relational block pulling in the shared `ProcessCapability:prototype-to-production-machining` summary).
10. Example RFQ fields / Files to send / FAQ / CTA (standard reusable block types shared with every `Part` page).

## 2. Humanoid Robots (`Application`)

### 2.1 Entity

```json
{
  "_type": "application",
  "_id": "app-humanoid-robots",
  "name": "Humanoid Robots",
  "slug": { "current": "humanoid-robots" },
  "summary": "Custom manufacturing for humanoid robot mechanical parts -- joints, actuators, structural links.",
  "domain": "domain-robotics",
  "usedParts": ["part-robot-joint-housing", "part-robot-actuator-housing", "part-robot-shaft", "part-robot-bearing-housing"],
  "relevantProcesses": ["capability-5-axis-machining"],
  "relevantMaterials": ["material-ti-6al-4v", "material-7075-t6-aluminum", "material-peek"],
  "contentBlocks": ["block-humanoid-context"],
  "status": "reviewed",
  "evidenceRefs": ["evidence-sinbo-humanoid"],
  "lastVerified": "2026-04-XX"
}
```

### 2.2 Relations

`usedParts` lists four `Part` documents (matching `APP01`'s children in PR #21: OBJ01/02/04/05). None of those four `Part` documents is *owned* by this `Application` — each independently also references `app-industrial-robot-parts` (Robot Joint Housing and Robot Actuator Housing both serve both applications, per `pr21-mapping.csv`'s secondary-entity columns). This is the many-to-many proof: deleting the Humanoid `Application` document tomorrow would not delete or orphan Robot Joint Housing; it would simply remove one relation from its `applications[]` array.

### 2.3 Evidence

`evidence-sinbo-humanoid` carries forward PR #21's Q032 finding (`sinbo-machining.com/products/industries/humanoid-robot-components/`, `falconcncswiss.com`) as `sourceType: supplier_marketing`, `confidence: medium` — same discipline as §1.3.

### 2.4 Content blocks

- `block-humanoid-context` (`blockKind: knowledge`, `blockType: definition`, `appliesToEntityRefs: [app-humanoid-robots]`) — the humanoid-specific framing (leg/knee/hip/ankle joint context, Ti-6Al-4V/PEEK material emphasis) that PR #21's own `pilot-pages.csv` describes for APP01. This is genuinely Application-specific prose, not shared with the Part pages — the Part pages hold the *general* technical content, this block holds the *buyer-persona* framing.
- A **relational** block, `renderQuery: related_parts`, resolves `usedParts` at render time. This is the exact mechanism behind acceptance test 2 ("aggregate relevant parts... through relations without owning/copying their source technical knowledge") — no part of Robot Joint Housing's bearing-bore guidance, materials list, or process content is copied onto this page; the page links to `/parts/robot-joint-housing/` for all of that.

### 2.5 Page Registry

```json
{
  "_type": "pageRegistry",
  "_id": "page-applications-humanoid-robots",
  "pageId": "APP-HUMANOID-ROBOTS",
  "pageType": "application",
  "primaryEntityRef": "app-humanoid-robots",
  "secondaryEntityRefs": ["part-robot-joint-housing", "part-robot-actuator-housing", "part-robot-shaft", "part-robot-bearing-housing"],
  "canonicalPath": "/applications/humanoid-robots/",
  "slug": { "current": "humanoid-robots" },
  "searchIntentCluster": "cluster-int-a01",
  "indexPolicy": "index",
  "buildStatus": "planned",
  "priority": "P0",
  "contentVersion": 1,
  "publishStatus": "draft",
  "lastReviewed": "2026-04-XX",
  "evidenceRefs": ["evidence-sinbo-humanoid"]
}
```

### 2.6 Rendered page sections

1. Title/summary.
2. Humanoid-specific context (`block-humanoid-context`).
3. Parts used in humanoid robots (relational, links to the 4 Part pages — each an independent, already-existing canonical URL).
4. Relevant processes (relational, links to `/capabilities/5-axis-machining/`).
5. Relevant materials (relational).
6. Prototype-to-production / example RFQ / files-to-send / FAQ / CTA (same reusable block types as any page, resolved against this Application as the primary entity).

## 3. 5-Axis Machining (`ProcessCapability`)

### 3.1 Entity

```json
{
  "_type": "processCapability",
  "_id": "capability-5-axis-machining",
  "name": "5-Axis Machining",
  "slug": { "current": "5-axis-machining" },
  "summary": "Multi-axis CNC machining used to hold cross-feature tolerance on compound-angle robot parts in a single setup.",
  "appliesToParts": ["part-robot-joint-housing", "part-robot-actuator-housing", "part-robot-mounting-bracket"],
  "compatibleMaterials": ["material-7075-t6-aluminum", "material-ti-6al-4v"],
  "contentBlocks": ["block-5-axis-process-explainer"],
  "status": "researched",
  "evidenceRefs": ["evidence-jlccnc-5axis"],
  "lastVerified": "2026-04-XX"
}
```

### 3.2 Relations — proving acceptance test 3

`appliesToParts` lists exactly the three `Part` documents PR #21 identified (`PRB_B`'s `related_child_pages`: OBJ01, OBJ02, OBJ07) — **not** every `Part` in the graph. Robot Shaft (`OBJ04`, turned, not 5-axis milled) and Gripper Fingers/Jaws (`OBJ08`, EDM/milled but not part of PR #21's 5-axis evidence set) are absent, because no relation connects them. This is the literal mechanism of acceptance test 3: the page aggregates only what a real, authored relation connects it to, and creating this page never implies or generates `5-axis-machining × every-part` pages — there is no code path that could (`page-registry.md` §3.1, `url-namespace-policy.md` §4).

### 3.3 Evidence and build-status honesty

`evidence-jlccnc-5axis` carries `sourceType: supplier_marketing`, `confidence: medium`, citing `jlccnc.com/blog/customized-cnc-parts-for-robots` per PR #21's Q044 finding. Per `pr21-mapping.csv`'s PRB_B row, this entity's `pageRegistry.buildStatus` stays `planned` (not `built`) and `publishStatus: draft`, honestly reflecting PR #21's own `validate_first` verdict ("generic 5-axis content dominates; page must supply its own robot-specific substance"). **Proving the architecture does not require overriding that evidence-based caution** — the graph, relations, content-block structure, and Page Registry record are all fully specified and valid; only the decision to invest in full content and publish is correctly still pending, exactly as it should be.

### 3.4 Content blocks

- `block-5-axis-process-explainer` (`blockKind: knowledge`, `blockType: manufacturing_routes`, `appliesToEntityRefs: [capability-5-axis-machining]`) — the process explanation itself (single-setup vs. multi-setup tradeoffs tied to joint/housing geometry, per PR #21's own note that this page "must supply robot-specific substance itself").
- Relational block, `renderQuery: related_parts`, resolves `appliesToParts` — the same mechanism as §2.4, proving the pattern generalizes across entity types (an Application and a ProcessCapability both aggregate Parts via the identical relational-block mechanism, not two different implementations).

### 3.5 Page Registry

```json
{
  "_type": "pageRegistry",
  "_id": "page-capabilities-5-axis-machining",
  "pageId": "CAPABILITY-5-AXIS-MACHINING",
  "pageType": "capability",
  "primaryEntityRef": "capability-5-axis-machining",
  "secondaryEntityRefs": ["part-robot-joint-housing", "part-robot-actuator-housing", "part-robot-mounting-bracket"],
  "canonicalPath": "/capabilities/5-axis-machining/",
  "slug": { "current": "5-axis-machining" },
  "searchIntentCluster": "cluster-int-p02",
  "indexPolicy": "index",
  "buildStatus": "planned",
  "priority": "P2",
  "contentVersion": 1,
  "publishStatus": "draft",
  "lastReviewed": "2026-04-XX",
  "evidenceRefs": ["evidence-jlccnc-5axis"]
}
```

### 3.6 Rendered page sections

1. Title/summary.
2. Process explainer (`block-5-axis-process-explainer`).
3. Compatible materials (relational).
4. Parts this applies to (relational — links to the three Part pages, each independently already canonical at `/parts/...`).
5. Example RFQ / files-to-send / FAQ / CTA.

## 4. What these three examples prove together

- **Robot Joint Housing** exists once, is referenced from two different Applications, and shares its bearing-bore content with two sibling Parts without duplication (acceptance test 1).
- **Humanoid** aggregates four Parts and one ProcessCapability by reference, authoring only its own persona-specific framing (acceptance test 2).
- **5-Axis Machining** aggregates exactly the three Parts a real relation connects it to, with no mechanism available to generate a fourth without an explicit authored relation, and no mechanism to turn that relation into a page without an explicit `pageRegistry` approval (acceptance test 3, and acceptance test 6 restated at the ProcessCapability layer).
- All three share the identical four-layer mechanism (`entity → relation → ContentBlock/relational-block → PageRegistry`) regardless of entity type — nothing bespoke was built for "Application pages" versus "Part pages" versus "Capability pages." This is the strongest evidence that the architecture generalizes to the remaining 31 PR #21 candidates (`pr21-mapping.csv`) and to entirely new domains (`future-domain-test.md`) without new mechanism, only new documents.
