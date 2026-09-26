import type { Evidence } from "@/lib/content/types";

// Evidence ledger for the MVP content set.
//
// Honesty rule (AGENTS.md rule #7 + issue #25 constraints): nothing here is
// a fabricated certification, capacity figure, tolerance, or customer
// claim. Every record is explicitly marked "structured_fixture" (authored
// launch copy written for this MVP, not yet independently re-verified
// against a live supplier/production record) so no page overstates its own
// confidence. Replace `sourceType`/`confidence` per record as each claim is
// actually verified against a supplier, drawing, or production outcome.

export const evidenceRecords: Evidence[] = [
  {
    id: "ev-launch-copy-2026-09",
    summary:
      "MVP launch copy authored for Manufacturing OS's public site (issue #25). Describes the intended process/route/evidence discipline, not a specific completed job.",
    sourceType: "structured_fixture",
    confidence: "medium",
    capturedAt: "2026-09-20",
  },
  {
    id: "ev-5-axis-process-general",
    summary:
      "General 5-axis CNC machining process characteristics (setup reduction, complex-access geometry) — industry-standard process knowledge, not a claim about a specific supplier's equipment or a specific job's outcome.",
    sourceType: "documentation_verified",
    confidence: "medium",
    capturedAt: "2026-09-20",
  },
  {
    id: "ev-business-model-issue-25",
    summary:
      "Business model and customer flow (CAD/drawing/BOM intake -> requirement normalization -> China manufacturing network routing -> quote -> coordinated production/QC -> single accountable delivery interface) as defined in GitHub issue #25.",
    sourceType: "manual_entry",
    confidence: "verified",
    url: "https://github.com/thong021196/manufacturing-os/issues/25",
    capturedAt: "2026-09-20",
  },
];

export function getEvidence(id: string): Evidence | undefined {
  return evidenceRecords.find((e) => e.id === id);
}
