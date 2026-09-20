# Future-Domain Test — Industrial Automation Equipment

Per the owner's priority #5 and acceptance test 5: demonstrate adding a future non-robotics application and show it reuses existing `Part`/`ProcessCapability`/`Material` entities without changing any existing canonical URL.

## 1. Scenario

The business decides to serve a second application domain: **Industrial Automation Equipment** (e.g. conveyor/packaging-line integrators who need custom brackets, enclosures, and sensor mounts — not robots at all, but the same kinds of machined parts). This is exactly the kind of expansion the issue names explicitly ("industrial automation equipment, drones, EV/industrial hardware, etc.").

## 2. What gets added

Exactly two new documents, plus new relation entries on existing documents — no new entity **type**, no new namespace, no schema change:

```json
{
  "_type": "domain",
  "_id": "domain-industrial-automation",
  "name": "Industrial Automation Equipment",
  "summary": "Non-robotic automated production equipment -- conveyors, packaging lines, fixed automation cells.",
  "applications": ["app-industrial-automation-parts"]
}
```

```json
{
  "_type": "application",
  "_id": "app-industrial-automation-parts",
  "name": "Industrial Automation Equipment Parts",
  "slug": { "current": "industrial-automation-equipment-parts" },
  "summary": "Custom manufacturing for conveyor, packaging-line, and fixed-automation-cell mechanical parts.",
  "domain": "domain-industrial-automation",
  "usedParts": ["part-robot-mounting-bracket", "part-sensor-camera-lidar-mount", "part-eoat-tooling-plate"],
  "relevantProcesses": ["capability-5-axis-machining", "capability-sheet-metal-fabrication-welding"],
  "relevantMaterials": ["material-7075-t6-aluminum"],
  "contentBlocks": ["block-industrial-automation-context"],
  "status": "draft",
  "evidenceRefs": [],
  "lastVerified": null
}
```

Plus one new `pageRegistry` record (`publishStatus: draft`, exactly as strict as any other new page — this is a demonstration of *architecture*, not a claim that this page is approved for publication):

```json
{
  "_type": "pageRegistry",
  "pageId": "APP-INDUSTRIAL-AUTOMATION-PARTS",
  "pageType": "application",
  "primaryEntityRef": "app-industrial-automation-parts",
  "secondaryEntityRefs": ["part-robot-mounting-bracket", "part-sensor-camera-lidar-mount", "part-eoat-tooling-plate"],
  "canonicalPath": "/applications/industrial-automation-equipment-parts/",
  "slug": { "current": "industrial-automation-equipment-parts" },
  "indexPolicy": "index",
  "buildStatus": "not_registered",
  "priority": "P3",
  "contentVersion": 1,
  "publishStatus": "draft",
  "lastReviewed": null
}
```

And, on three **already-existing** `Part` documents (Robot Mounting Bracket, Sensor/Camera/LiDAR Mount, EOAT Tooling Plate), exactly one array entry is appended to each one's `applications[]` field: `"app-industrial-automation-parts"`.

That is the entire change set. No `Part`, `Material`, or `ProcessCapability` document has its `slug`, `canonicalPath`, `name`, or any existing relation removed or altered.

## 3. What does not change

| Entity | Before | After | Canonical path |
|---|---|---|---|
| `part-robot-mounting-bracket` | `applications: [app-industrial-robot-parts]` (per its real PR #21 relation) | `applications: [app-industrial-robot-parts, app-industrial-automation-parts]` | `/parts/robot-mounting-bracket/` — **unchanged** |
| `part-sensor-camera-lidar-mount` | `applications: []` (no Application relation in PR #21's original data — see note below) | `applications: [app-industrial-automation-parts]` | `/parts/sensor-camera-lidar-mount/` — **unchanged** |
| `part-eoat-tooling-plate` | `applications: [app-eoat-automation-tooling]` | `applications: [app-eoat-automation-tooling, app-industrial-automation-parts]` | `/parts/eoat-tooling-plate/` — **unchanged** |
| `capability-5-axis-machining` | `appliesToParts: [3 robot parts]` | unchanged (Industrial Automation's use of it is expressed via the `Application.relevantProcesses` relation, not by editing `appliesToParts`) | `/capabilities/5-axis-machining/` — **unchanged** |
| `material-7075-t6-aluminum` | referenced by several robot Parts | unchanged | `/materials/7075-t6-aluminum/` — **unchanged** |

*(Note: `part-sensor-camera-lidar-mount`'s original PR #21 data (`OBJ16`) did not list an explicit `application` relation in `pilot-pages.csv`'s `related_parent_page` column beyond the generic hub — this test adds its first real Application relation, which is itself evidence that the graph model captures relations PR #21's flatter CSV shape had no clean place to record.)*

Every row in the table above demonstrates the same fact: **adding a domain is purely additive**. This is possible only because, per `entity-relationship.md` §3, no `Part` is owned by any `Application` — a `Part`'s canonical identity was never a function of which domain uses it.

## 4. Why no permutation risk was introduced

Adding this domain did **not** trigger, require, or make tempting the creation of `/parts/robot-mounting-bracket/industrial-automation/`, `/applications/industrial-automation-equipment-parts/robot-mounting-bracket/`, or any part × domain combination page. The only new URL is the one explicit, human-authored `pageRegistry` record for the Application hub itself (§2). Robot Mounting Bracket's own page continues to simply list Industrial Automation Equipment Parts as one more entry in its (now two-item) relational "used in these applications" block — the same mechanism proven in `worked-examples.md` §1.6 step 6, unchanged in shape by adding a second application. This is the direct, concrete answer to acceptance test 5's requirement and to `url-namespace-policy.md` §6's future-expansion rule.

## 5. What a genuinely new object type would require (contrast case)

If Industrial Automation instead needed a wholly new kind of part with no existing analogue (say, a "conveyor idler bracket" that shares nothing with any robot part), the process is still additive and still requires no schema change: author one new `Part` document, give it its own `slug` under `/parts/`, relate it to `app-industrial-automation-parts` and whichever `Material`/`ProcessCapability` entities genuinely apply (reusing `material-7075-t6-aluminum` and `capability-5-axis-machining` if accurate, authoring new ones only if the domain genuinely introduces a new material/process). No existing `Part` is touched. This is the same mechanism as §2–§3, just with a new `Part` instead of new relations on existing ones — proving the architecture scales to genuinely new content, not only to relabeling existing content under a new banner.
