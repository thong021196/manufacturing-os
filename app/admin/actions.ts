"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { attemptLogin, clearSessionCookie, requireAdmin, safeAdminNext, setSessionCookie } from "@/lib/admin/auth";
import { clientIpFromHeaders } from "@/lib/admin/rate-limit";
import { contentAdapter } from "@/lib/content/adapter";
import { getContentOverrideStore, invalidateContentOverrideCache } from "@/lib/content/overrides";
import { UNPAUSABLE_PATHS } from "@/lib/content/publishing";
import { getRfqStore } from "@/lib/rfq/store";
import { isRfqStatus } from "@/lib/rfq/types";
import { sanitizeText } from "@/lib/rfq/validate";

/**
 * Owner-admin Server Functions. Every one except login re-verifies the
 * session itself (requireAdmin) -- proxy.ts is not relied on alone, per the
 * Next.js guidance that Server Functions are reachable as POSTs to the page
 * they're used on. Next.js also rejects Server Function POSTs whose Origin
 * doesn't match the Host (CSRF), and the session cookie is SameSite=Strict.
 */

export interface LoginState {
  error?: string;
}

function field(form: FormData, key: string, max = 512): string {
  const v = form.get(key);
  return typeof v === "string" ? v.slice(0, max) : "";
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ip = clientIpFromHeaders(await headers());
  const result = await attemptLogin({
    username: field(form, "username", 200),
    password: field(form, "password", 1024),
    totp: field(form, "totp", 16),
    ip,
  });
  if (!result.ok) return { error: result.error };
  await setSessionCookie(result.token, result.maxAge);
  redirect(safeAdminNext(field(form, "next", 512)));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function updateRfqStatusAction(form: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = field(form, "id", 64);
  const status = field(form, "status", 32);
  if (!id || !isRfqStatus(status)) return;
  const store = await getRfqStore();
  await store.updateStatus(id, status, session.username);
  revalidatePath("/admin", "layout");
}

export async function addRfqNoteAction(form: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = field(form, "id", 64);
  const body = sanitizeText(field(form, "body", 8000));
  if (!id || !body) return;
  const store = await getRfqStore();
  await store.addNote(id, body, session.username);
  revalidatePath(`/admin/rfqs/${id}`);
}

export async function setContentPausedAction(form: FormData): Promise<void> {
  const session = await requireAdmin();
  const path = field(form, "path", 512);
  const paused = field(form, "paused", 8) === "true";
  const reason = sanitizeText(field(form, "reason", 500));
  // Only real registry pages, and never the home page / RFQ intake.
  if (!contentAdapter.getPageRegistryEntry(path) || (paused && UNPAUSABLE_PATHS.has(path))) return;
  const store = await getContentOverrideStore();
  await store.setPaused(path, paused, reason, session.username);
  invalidateContentOverrideCache();
  console.info(`[admin] content ${paused ? "paused" : "resumed"}: ${path}`, { by: session.username });
  // Re-render public pages now (the page itself, nav links, sitemap)
  // rather than waiting for the 5-minute revalidation.
  revalidatePath("/", "layout");
}
