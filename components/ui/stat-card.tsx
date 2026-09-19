import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={`rounded-lg border border-border p-4 ${
        tone === "accent" ? "bg-navy-900 text-white" : "bg-surface"
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wide ${tone === "accent" ? "text-white/60" : "text-muted"}`}>
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-semibold ${tone === "accent" ? "text-white" : "text-navy-900"}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${tone === "accent" ? "text-white/70" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
