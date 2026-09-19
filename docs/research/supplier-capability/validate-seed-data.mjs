#!/usr/bin/env node
// Validates docs/research/supplier-capability/seed-*.json for internal
// reference integrity and flags what is (and isn't) resolvable to the
// app's canonical process/material IDs. This is a standalone check for
// this research folder only -- it does not import or depend on any code
// under app/ or lib/, and is not run as part of the app build.
//
// Run: node docs/research/supplier-capability/validate-seed-data.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

const suppliers = read("seed-suppliers.json").suppliers;
const capabilities = read("seed-supplier-capabilities.json").supplierCapabilities;
const machineEvidence = read("seed-machine-evidence.json").machineEvidence;

// The app's canonical IDs as of lib/mock/data.ts on
// origin/claude/issue-2-implementation-3g9kzq. Update this list if that
// branch's canonical process/material set changes.
const CANONICAL_PROCESS_IDS = new Set(["proc-cnc-milling", "proc-cnc-turning", "proc-sheet-metal"]);
const CANONICAL_MATERIAL_IDS = new Set(["mat-6061-t6", "mat-17-4ph", "mat-delrin"]);

let errors = 0;
let warnings = 0;
const err = (msg) => { console.error("ERROR:", msg); errors++; };
const warn = (msg) => { console.warn("warn: ", msg); warnings++; };

const supplierIds = new Set(suppliers.map((s) => s.id));
const capabilityIds = new Set(capabilities.map((c) => c.id));
const machineIds = new Set(machineEvidence.map((m) => m.id));

// --- Reference integrity ---
for (const s of suppliers) {
  for (const capId of s.declaredCapabilityIds ?? []) {
    if (!capabilityIds.has(capId)) err(`${s.id}: declaredCapabilityIds references missing capability ${capId}`);
  }
  for (const capId of s.observedCapabilityIds ?? []) {
    if (!capabilityIds.has(capId)) err(`${s.id}: observedCapabilityIds references missing capability ${capId}`);
  }
  for (const mId of s.machineEvidenceIds ?? []) {
    if (!machineIds.has(mId)) err(`${s.id}: machineEvidenceIds references missing machine evidence ${mId}`);
  }
}
for (const c of capabilities) {
  if (!supplierIds.has(c.supplierId)) err(`${c.id}: supplierId ${c.supplierId} does not resolve to a supplier`);
  if (c.layer !== "declared") err(`${c.id}: layer is "${c.layer}", expected "declared" (no transaction history exists for observed-layer records in this research pass)`);
}
for (const m of machineEvidence) {
  if (!supplierIds.has(m.supplierId)) err(`${m.id}: supplierId ${m.supplierId} does not resolve to a supplier`);
}

// --- Traceable-required fields present ---
for (const [label, records] of [["supplier", suppliers], ["capability", capabilities], ["machine evidence", machineEvidence]]) {
  for (const r of records) {
    for (const field of ["status", "createdAt", "updatedAt", "owner", "source", "confidence"]) {
      if (r[field] === undefined) err(`${label} ${r.id}: missing required field "${field}"`);
    }
    for (const ev of r.evidence ?? []) {
      if (!ev.id) err(`${label} ${r.id}: an evidence entry is missing "id"`);
    }
  }
}

// --- Canonical ID coverage (informational, not an error -- this dataset
// intentionally goes wider than the app's current 3-material seed list) ---
let capsWithCanonicalProcess = 0;
let capsWithCanonicalMaterial = 0;
for (const c of capabilities) {
  const procs = c.canonicalProcessIds ?? [];
  const mats = c.canonicalMaterialIds ?? [];
  if (procs.length && procs.every((p) => CANONICAL_PROCESS_IDS.has(p))) capsWithCanonicalProcess++;
  else if (procs.length) warn(`${c.id}: canonicalProcessIds contains an ID not in the app's known set: ${procs}`);
  if (mats.length && mats.every((m) => CANONICAL_MATERIAL_IDS.has(m))) capsWithCanonicalMaterial++;
  else if (mats.length) warn(`${c.id}: canonicalMaterialIds contains an ID not in the app's known set: ${mats}`);
  if (c.sizeEnvelopeMm === null) warn(`${c.id}: sizeEnvelopeMm is null (unknown) -- NOT directly importable as a typed SupplierCapability until filled in`);
  if (c.quantityRange === null) warn(`${c.id}: quantityRange is null (unknown) -- NOT directly importable as a typed SupplierCapability until filled in`);
}

console.log(`\nChecked ${suppliers.length} suppliers, ${capabilities.length} capabilities, ${machineEvidence.length} machine-evidence records.`);
console.log(`Capabilities with a canonical process match: ${capsWithCanonicalProcess}/${capabilities.length}`);
console.log(`Capabilities with a canonical material match: ${capsWithCanonicalMaterial}/${capabilities.length} (low is expected -- the app's seed material list is only 3 materials, far narrower than real supplier catalogs)`);
console.log(`\n${errors} error(s), ${warnings} warning(s) (warnings are expected/informational -- see notes above).`);

if (errors > 0) {
  console.error("\nFAILED: fix the errors above before treating this data as clean seed data.");
  process.exit(1);
} else {
  console.log("\nPASSED: all reference integrity and required-field checks succeeded.");
}
