import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ContentOverride, ContentOverrideStore } from "@/lib/content/overrides";

/** Dev/test store: `.data/content-overrides.json` (gitignored), next to the
 * local RFQ store. Same durability caveats as lib/rfq/store/local.ts. */
export class LocalContentOverrideStore implements ContentOverrideStore {
  private file: string;

  constructor() {
    const dir = process.env.CONTENT_OVERRIDES_LOCAL_DIR || ".data";
    this.file = path.resolve(/* turbopackIgnore: true */ process.cwd(), dir, "content-overrides.json");
  }

  async list(): Promise<ContentOverride[]> {
    try {
      return JSON.parse(await readFile(this.file, "utf-8")) as ContentOverride[];
    } catch {
      return [];
    }
  }

  async setPaused(pagePath: string, paused: boolean, reason: string, updatedBy: string): Promise<void> {
    const rows = (await this.list()).filter((o) => o.path !== pagePath);
    if (paused) rows.push({ path: pagePath, paused, reason, updatedBy, updatedAt: new Date().toISOString() });
    await mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(rows, null, 2), "utf-8");
    await rename(tmp, this.file);
  }
}
