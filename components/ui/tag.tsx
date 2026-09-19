import { type ReactNode } from "react";

export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "navy";

const toneClasses: Record<TagTone, string> = {
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  accent: "bg-accent-soft text-navy-700 border-accent/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
  navy: "bg-navy-900 text-white border-navy-900",
};

export function Tag({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: TagTone;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
