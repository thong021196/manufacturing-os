import { getPgPool, toIso } from "@/lib/db/pg";
import type { ContentOverride, ContentOverrideStore } from "@/lib/content/overrides";

/** RDS store: `content_overrides` table (infra/sql/0002_admin_workflow_rds.sql). */
export class AwsContentOverrideStore implements ContentOverrideStore {
  async list(): Promise<ContentOverride[]> {
    const { rows } = await getPgPool().query("select path, paused, reason, updated_by, updated_at from content_overrides");
    return rows.map((r: Record<string, unknown>) => ({
      path: String(r.path),
      paused: Boolean(r.paused),
      reason: String(r.reason ?? ""),
      updatedBy: String(r.updated_by ?? ""),
      updatedAt: toIso(r.updated_at),
    }));
  }

  async setPaused(path: string, paused: boolean, reason: string, updatedBy: string): Promise<void> {
    if (!paused) {
      await getPgPool().query("delete from content_overrides where path = $1", [path]);
      return;
    }
    await getPgPool().query(
      `insert into content_overrides (path, paused, reason, updated_by, updated_at)
       values ($1, true, $2, $3, now())
       on conflict (path) do update set paused = true, reason = excluded.reason,
         updated_by = excluded.updated_by, updated_at = now()`,
      [path, reason, updatedBy],
    );
  }
}
