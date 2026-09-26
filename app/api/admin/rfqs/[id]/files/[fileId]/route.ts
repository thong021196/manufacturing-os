import { open, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminForRoute } from "@/lib/admin/auth";
import { rfqLocalStorageDir } from "@/lib/rfq/config";
import { contentDispositionAttachment } from "@/lib/rfq/download";
import { getRfqStore } from "@/lib/rfq/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  // Belt-and-braces: even if a browser tried to render the file, it would
  // run with no script/plugin capability.
  "Content-Security-Policy": "default-src 'none'; sandbox",
};

/**
 * Owner-only download of one uploaded RFQ file.
 *  - Session is verified here (in addition to proxy.ts).
 *  - The file must belong to the submission in the URL (no guessing ids
 *    across submissions).
 *  - aws / supabase: 302 to a presigned URL that expires after
 *    RFQ_DOWNLOAD_URL_TTL_SECONDS (default 300 s) and forces
 *    Content-Disposition: attachment.
 *  - local: streamed from disk after checking the resolved path stays inside
 *    the local store directory.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/rfqs/[id]/files/[fileId]">) {
  const session = requireAdminForRoute(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });

  const { id, fileId } = await ctx.params;
  const store = await getRfqStore();
  const rfq = await store.getSubmissionDetail(id);
  const file = rfq?.files.find((f) => f.id === fileId);
  if (!rfq || !file) return NextResponse.json({ error: "not found" }, { status: 404, headers: PRIVATE_HEADERS });

  console.info(`[admin] file download ${rfq.referenceId}/${file.id}`, { by: session.username });
  const ref = await store.getFileDownloadRef(file, { downloadName: file.fileName });

  if (ref.kind === "signed-url") {
    return NextResponse.redirect(ref.value, { status: 302, headers: { ...PRIVATE_HEADERS, "Referrer-Policy": "no-referrer" } });
  }

  const root = path.resolve(/* turbopackIgnore: true */ process.cwd(), rfqLocalStorageDir());
  const resolved = path.resolve(ref.value);
  if (!resolved.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: PRIVATE_HEADERS });
  }
  let size: number;
  try {
    size = (await stat(resolved)).size;
  } catch {
    return NextResponse.json({ error: "file missing from local store" }, { status: 404, headers: PRIVATE_HEADERS });
  }
  const handle = await open(resolved, "r");
  const body = Readable.toWeb(handle.createReadStream()) as ReadableStream<Uint8Array>;
  return new Response(body, {
    status: 200,
    headers: {
      ...PRIVATE_HEADERS,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Content-Disposition": contentDispositionAttachment(file.fileName),
    },
  });
}
