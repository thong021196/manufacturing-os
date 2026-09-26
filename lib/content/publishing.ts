import type { PageRegistryEntry } from "@/lib/content/types";

/**
 * Content calendar rules -- the single source of truth for "is this page
 * public right now?" (docs/ops/content-pipeline.md).
 *
 * A page is public (rendered, linked, listed in the sitemap) only when:
 *   publishStatus === "published", or
 *   publishStatus === "scheduled" and publishAt <= now,
 * and the owner has not paused it from /admin/content (content_overrides).
 * Everything else 404s.
 *
 * Public pages export `revalidate = 300`, so a scheduled page goes live
 * within ~5 minutes of its publishAt on the running server, without a
 * redeploy.
 */

/** Seconds between background re-renders of public pages. Keep in sync with
 * the literal `export const revalidate = 300` in public page files (Next.js
 * requires that value to be a statically analysable literal). */
export const PUBLIC_REVALIDATE_SECONDS = 300;

// publishAt must carry an explicit offset so "when does this go live" never
// depends on the server's timezone.
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export function parsePublishAt(entry: Pick<PageRegistryEntry, "publishAt">): Date | null {
  if (!entry.publishAt || !ISO_WITH_OFFSET.test(entry.publishAt)) return null;
  const ms = Date.parse(entry.publishAt);
  return Number.isNaN(ms) ? null : new Date(ms);
}

/** Repo-level rule only (ignores owner pauses). */
export function isLiveBySchedule(entry: PageRegistryEntry, now: Date = new Date()): boolean {
  if (entry.publishStatus === "published") return true;
  if (entry.publishStatus !== "scheduled") return false;
  const at = parsePublishAt(entry);
  return at !== null && at.getTime() <= now.getTime();
}

export function isEntryLive(entry: PageRegistryEntry, now: Date, pausedPaths: ReadonlySet<string>): boolean {
  return isLiveBySchedule(entry, now) && !pausedPaths.has(entry.path);
}

export type CalendarState = "live" | "scheduled" | "draft" | "unpublished" | "paused" | "invalid";

/** What the admin content calendar shows for one entry. */
export function calendarState(entry: PageRegistryEntry, now: Date, pausedPaths: ReadonlySet<string>): CalendarState {
  if (entry.publishStatus === "scheduled" && !parsePublishAt(entry)) return "invalid";
  if (isLiveBySchedule(entry, now)) return pausedPaths.has(entry.path) ? "paused" : "live";
  if (entry.publishStatus === "scheduled") return "scheduled";
  if (entry.publishStatus === "unpublished") return "unpublished";
  return "draft";
}

/** Paths the owner may never pause from the admin (pausing them would take
 * the site or the RFQ intake down). Unpublishing these needs a reviewed PR. */
export const UNPAUSABLE_PATHS: ReadonlySet<string> = new Set(["/", "/rfq"]);

/** Structural checks run by `npm test` (tests/publishing.test.ts) so a bad
 * content PR fails CI instead of silently never going live. */
export function validateRegistry(entries: PageRegistryEntry[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.path)) errors.push(`${entry.path}: duplicate path`);
    seen.add(entry.path);
    if (!entry.path.startsWith("/") || (entry.path.length > 1 && entry.path.endsWith("/"))) {
      errors.push(`${entry.path}: path must start with "/" and have no trailing slash`);
    }
    if (entry.publishStatus === "scheduled" && !parsePublishAt(entry)) {
      errors.push(`${entry.path}: scheduled pages need publishAt as ISO 8601 with an explicit offset, e.g. 2026-10-05T13:00:00Z`);
    }
    if (entry.pageKind === "guide" && (!entry.contentBlockIds || entry.contentBlockIds.length === 0)) {
      errors.push(`${entry.path}: guide pages need contentBlockIds`);
    }
    if (entry.path.startsWith("/admin") || entry.path.startsWith("/api")) {
      errors.push(`${entry.path}: /admin and /api are reserved`);
    }
  }
  return errors;
}
