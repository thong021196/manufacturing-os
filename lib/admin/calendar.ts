import { contentAdapter } from "@/lib/content/adapter";
import { getContentOverrideStore, type ContentOverride } from "@/lib/content/overrides";
import { calendarState, parsePublishAt, UNPAUSABLE_PATHS, type CalendarState } from "@/lib/content/publishing";
import type { PageRegistryEntry } from "@/lib/content/types";

export interface CalendarRow {
  entry: PageRegistryEntry;
  state: CalendarState;
  publishAt: Date | null;
  override: ContentOverride | null;
  pausable: boolean;
}

/** Every registry page with its calendar state right now, for /admin and
 * /admin/content. Reads the overrides store directly (no cache) so the
 * owner always sees the truth after pausing/resuming. */
export async function loadCalendar(now: Date = new Date()): Promise<{ rows: CalendarRow[]; overridesError: string | null }> {
  let overrides: ContentOverride[] = [];
  let overridesError: string | null = null;
  try {
    overrides = await (await getContentOverrideStore()).list();
  } catch (error) {
    overridesError = (error as Error).message;
  }
  const byPath = new Map(overrides.map((o) => [o.path, o]));
  const paused = new Set(overrides.filter((o) => o.paused).map((o) => o.path));
  const rows = contentAdapter.getAllEntries().map((entry) => ({
    entry,
    state: calendarState(entry, now, paused),
    publishAt: parsePublishAt(entry),
    override: byPath.get(entry.path) ?? null,
    pausable: !UNPAUSABLE_PATHS.has(entry.path),
  }));
  return { rows, overridesError };
}
