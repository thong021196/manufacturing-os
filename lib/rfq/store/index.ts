import { processState } from "@/lib/process-state";
import { rfqBackend } from "@/lib/rfq/config";
import type { RfqStore } from "@/lib/rfq/store/interface";

const holder = processState("rfqStore", () => ({ store: null as RfqStore | null }));

/** Resolves the active RfqStore once per server process, based on
 * RFQ_BACKEND / available aws/Supabase env vars (see lib/rfq/config.ts).
 * Dynamic imports keep local dev from ever needing `pg`,
 * `@aws-sdk/client-s3`, or `@supabase/supabase-js` to actually connect
 * anywhere, and keep each backend's client construction (which throws
 * without its required env vars -- see store/aws.ts, store/supabase.ts)
 * out of the module graph entirely when running the local fallback. */
export async function getRfqStore(): Promise<RfqStore> {
  if (holder.store) return holder.store;
  let cached: RfqStore;
  const backend = rfqBackend();
  if (backend === "aws") {
    const { AwsRfqStore } = await import("@/lib/rfq/store/aws");
    cached = new AwsRfqStore();
  } else if (backend === "supabase") {
    const { SupabaseRfqStore } = await import("@/lib/rfq/store/supabase");
    cached = new SupabaseRfqStore();
  } else {
    const { LocalRfqStore } = await import("@/lib/rfq/store/local");
    cached = new LocalRfqStore();
  }
  holder.store = cached;
  return cached;
}
