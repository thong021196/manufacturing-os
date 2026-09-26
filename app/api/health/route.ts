import { NextResponse } from "next/server";
import { rfqBackend } from "@/lib/rfq/config";
import { getLivePaths } from "@/lib/content/live";

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
    // Commit of the running image, set by the deploy workflow (APP_VERSION
    // in the ECS task definition). The workflow's smoke check waits until
    // this matches the commit it just deployed.
    version: process.env.APP_VERSION || "dev",
    rfqBackend: rfqBackend(),
    livePages: (await getLivePaths()).size,
  });
}
