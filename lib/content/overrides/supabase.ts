import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ContentOverride, ContentOverrideStore } from "@/lib/content/overrides";

/** Supabase store: `content_overrides` table (supabase/migrations/0002_admin_workflow.sql),
 * service-role only (RLS on, no policies). */
export class SupabaseContentOverrideStore implements ContentOverrideStore {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SupabaseContentOverrideStore requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  async list(): Promise<ContentOverride[]> {
    const { data, error } = await this.client.from("content_overrides").select("path, paused, reason, updated_by, updated_at");
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      path: String(r.path),
      paused: Boolean(r.paused),
      reason: String(r.reason ?? ""),
      updatedBy: String(r.updated_by ?? ""),
      updatedAt: String(r.updated_at ?? ""),
    }));
  }

  async setPaused(path: string, paused: boolean, reason: string, updatedBy: string): Promise<void> {
    const { error } = paused
      ? await this.client
          .from("content_overrides")
          .upsert({ path, paused: true, reason, updated_by: updatedBy, updated_at: new Date().toISOString() })
      : await this.client.from("content_overrides").delete().eq("path", path);
    if (error) throw new Error(error.message);
  }
}
