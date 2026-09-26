import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

const nav = [
  { href: "/admin", label: "This week" },
  { href: "/admin/rfqs", label: "RFQ inbox" },
  { href: "/admin/content", label: "Content calendar" },
];

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  // Layout-level check is for rendering the chrome only; each page and
  // action re-checks (layouts are not re-run on every navigation).
  const session = await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-[10px] font-bold text-white">MO</span>
            <span className="text-sm font-semibold text-navy-900">Owner admin</span>
          </Link>
          <nav className="flex flex-1 flex-wrap gap-4 text-sm" aria-label="Admin">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-navy-800 hover:text-accent">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>Signed in as {session.username}</span>
            <form action={logoutAction}>
              <button type="submit" className="rounded-md border border-border px-2.5 py-1 text-xs text-navy-800 hover:border-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
