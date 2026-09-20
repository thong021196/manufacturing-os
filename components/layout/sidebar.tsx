"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-thin flex h-full flex-col overflow-y-auto bg-navy-950 px-3 py-4 text-sm">
      <Link href="/ops" onClick={onNavigate} className="mb-5 flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
          MO
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">Manufacturing OS</span>
      </Link>
      <div className="flex flex-col gap-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {group.label !== "Overview" && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`block rounded-md px-2.5 py-1.5 transition-colors ${
                        active
                          ? "bg-accent text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
