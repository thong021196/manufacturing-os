import type { Metadata } from "next";
import type { ReactNode } from "react";

// Owner admin: never indexed (also X-Robots-Tag from proxy.ts, Disallow in
// robots.txt, never in the sitemap), never cached.
export const metadata: Metadata = {
  title: { default: "Admin | Manufacturing OS", template: "%s | Admin | Manufacturing OS" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "same-origin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
