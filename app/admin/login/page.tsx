import type { Metadata } from "next";
import { adminTotpRequired, safeAdminNext } from "@/lib/admin/auth";
import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = safeAdminNext(typeof params.next === "string" ? params.next : undefined);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-accent text-[11px] font-bold text-white">MO</span>
          <span className="text-sm font-semibold text-navy-900">Manufacturing OS · Owner admin</span>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h1 className="text-lg font-semibold text-navy-900">Sign in</h1>
          <p className="mt-1 text-xs text-muted">Private console. Access is logged.</p>
          <LoginForm next={next} totpRequired={adminTotpRequired()} />
        </div>
      </div>
    </main>
  );
}
