import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarState, isEntryLive, isLiveBySchedule, validateRegistry } from "@/lib/content/publishing";
import { pageRegistry } from "@/lib/content/repository/page-registry";
import { getContentBlock } from "@/lib/content/repository/content-blocks";
import { getEvidence } from "@/lib/content/repository/evidence";
import { smokeFixtureGuides } from "@/lib/content/repository/guides/smoke-fixtures";
import type { PageRegistryEntry } from "@/lib/content/types";

const base: PageRegistryEntry = {
  path: "/x",
  pageKind: "guide",
  contentBlockIds: ["cb"],
  title: "X",
  description: "",
  breadcrumbs: [],
  publishStatus: "published",
  indexPolicy: "index",
  seo: { title: "", description: "" },
  updatedAt: "2026-09-26",
};
const now = new Date("2026-10-01T12:00:00Z");
const none = new Set<string>();

test("publish rules: published / scheduled past / scheduled future / draft / unpublished", () => {
  assert.equal(isLiveBySchedule(base, now), true);
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "scheduled", publishAt: "2026-10-01T11:59:00Z" }, now), true);
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "scheduled", publishAt: "2026-10-01T12:01:00Z" }, now), false);
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "scheduled", publishAt: "2026-10-01T14:00:00+02:00" }, now), true, "offset honoured");
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "scheduled" }, now), false, "missing publishAt never goes live");
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "scheduled", publishAt: "2026-10-01T11:00:00" }, now), false, "no offset = invalid");
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "draft" }, now), false);
  assert.equal(isLiveBySchedule({ ...base, publishStatus: "unpublished" }, now), false);
});

test("owner pause hides an otherwise-live page", () => {
  assert.equal(isEntryLive(base, now, new Set(["/x"])), false);
  assert.equal(calendarState(base, now, new Set(["/x"])), "paused");
  assert.equal(calendarState(base, now, none), "live");
  assert.equal(calendarState({ ...base, publishStatus: "scheduled", publishAt: "2099-01-01T00:00:00Z" }, now, none), "scheduled");
  assert.equal(calendarState({ ...base, publishStatus: "scheduled", publishAt: "tomorrow" }, now, none), "invalid");
});

test("the real page registry is valid and every existing page is still published", () => {
  assert.deepEqual(validateRegistry(pageRegistry), []);
  for (const entry of pageRegistry.filter((e) => e.pageKind !== "guide")) {
    assert.equal(entry.publishStatus, "published", `${entry.path} must stay published`);
  }
});

test("every guide page resolves its blocks, has a hero, and cites real evidence", () => {
  const guides = pageRegistry.filter((e) => e.pageKind === "guide");
  for (const entry of guides) {
    const blocks = (entry.contentBlockIds ?? []).map((id) => getContentBlock(id));
    assert.ok(blocks.every(Boolean), `${entry.path}: missing content block`);
    assert.ok(blocks.some((b) => b?.blockType === "hero"), `${entry.path}: needs a hero block`);
    for (const b of blocks) {
      if (b?.provenance.evidenceId) assert.ok(getEvidence(b.provenance.evidenceId), `${entry.path}: unknown evidence ${b.provenance.evidenceId}`);
    }
  }
});

test("smoke fixtures are valid registry entries", () => {
  assert.deepEqual(
    validateRegistry(smokeFixtureGuides().map((g) => g.entry)),
    [],
  );
});

test("validateRegistry catches bad content PRs", () => {
  const errors = validateRegistry([
    { ...base, path: "/a" },
    { ...base, path: "/a" },
    { ...base, path: "/b/", publishStatus: "scheduled", publishAt: "2026-10-01" },
    { ...base, path: "/admin/x" },
  ]);
  assert.ok(errors.some((e) => e.includes("duplicate")));
  assert.ok(errors.some((e) => e.includes("trailing slash")));
  assert.ok(errors.some((e) => e.includes("explicit offset")));
  assert.ok(errors.some((e) => e.includes("reserved")));
});
