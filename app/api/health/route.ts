import { NextResponse } from "next/server";
import { rfqBackend } from "@/lib/rfq/config";
import { contentAdapter } from "@/lib/content/adapter";

// Health/smoke endpoint for deployment verification (issue #25 requirement
// 4). Deliberately reports which RFQ backend is active rather than
// probing Supabase live on every request — this is a liveness/config
// check, not a dependency health check that could itself leak load onto
// the database. GET only, cheap, and safe to hit from an uptime monitor.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    rfqBackend: rfqBackend(),
    publishedPages: contentAdapter.getAllEntries().filter((e) => e.publishStatus === "published").length,
  });
}
