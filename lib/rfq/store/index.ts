import { rfqBackend } from "@/lib/rfq/config";
import type { RfqStore } from "@/lib/rfq/store/interface";

let cached: RfqStore | null = null;

/** Resolves the active RfqStore once per server process, based on
 * RFQ_BACKEND / available Supabase env vars (see lib/rfq/config.ts).
 * Dynamic imports keep local dev from ever needing @supabase/supabase-js
 * to actually connect anywhere, and keep the Supabase client construction
 * (which throws without env vars -- see store/supabase.ts) out of the
 * module graph entirely when running the local fallback. */
export async function getRfqStore(): Promise<RfqStore> {
  if (cached) return cached;
  const backend = rfqBackend();
  if (backend === "supabase") {
    const { SupabaseRfqStore } = await import("@/lib/rfq/store/supabase");
    cached = new SupabaseRfqStore();
  } else {
    const { LocalRfqStore } = await import("@/lib/rfq/store/local");
    cached = new LocalRfqStore();
  }
  return cached;
}
