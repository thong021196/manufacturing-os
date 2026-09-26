import { processState } from "@/lib/process-state";
import { rfqBackend } from "@/lib/rfq/config";

/**
 * The owner's one content override: PAUSE a public page from /admin/content
 * (e.g. something on it is wrong and a PR can't wait). A paused page 404s
 * and drops out of links and the sitemap within seconds (the admin action
 * revalidates it), even though the repo still says it is published or
 * scheduled. Resuming restores whatever the repo says.
 *
 * Deliberately NOT supported here: editing page bodies, changing publishAt,
 * or creating pages -- those stay in the repo and go through a reviewed PR
 * (docs/ops/content-pipeline.md). Stored in the same backend as RFQs
 * (RFQ_BACKEND): content_overrides table on RDS/Supabase (migration 0002),
 * or .data/content-overrides.json locally.
 */
export interface ContentOverride {
  path: string;
  paused: boolean;
  reason: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ContentOverrideStore {
  list(): Promise<ContentOverride[]>;
  setPaused(path: string, paused: boolean, reason: string, updatedBy: string): Promise<void>;
}

export async function getContentOverrideStore(): Promise<ContentOverrideStore> {
  const backend = rfqBackend();
  if (backend === "aws") {
    const { AwsContentOverrideStore } = await import("@/lib/content/overrides/aws");
    return new AwsContentOverrideStore(); // stateless; shares the process-wide pg pool
  }
  if (backend === "supabase") {
    const { SupabaseContentOverrideStore } = await import("@/lib/content/overrides/supabase");
    return new SupabaseContentOverrideStore();
  }
  const { LocalContentOverrideStore } = await import("@/lib/content/overrides/local");
  return new LocalContentOverrideStore();
}

// Short process-wide cache so public page renders don't hit the database on
// every regeneration. The admin action clears it immediately after a write.
// processState: shared by every route bundle (see lib/process-state.ts).
const CACHE_MS = 30_000;
const state = processState("contentOverrideCache", () => ({ cache: null as { at: number; paused: Set<string> } | null }));

export function invalidateContentOverrideCache(): void {
  state.cache = null;
}

/** Paths currently paused by the owner. Fails OPEN (returns an empty set)
 * if the store is unreachable: a database blip must not 404 the whole
 * public site; the worst case is a paused page briefly reappearing. */
export async function getPausedPaths(): Promise<Set<string>> {
  const cache = state.cache;
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.paused;
  try {
    const store = await getContentOverrideStore();
    const paused = new Set((await store.list()).filter((o) => o.paused).map((o) => o.path));
    state.cache = { at: Date.now(), paused };
    return paused;
  } catch (error) {
    console.error("[content] could not read content overrides; treating none as paused", (error as Error).message);
    return new Set();
  }
}
