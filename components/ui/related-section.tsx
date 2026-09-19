import Link from "next/link";
import type { ReactNode } from "react";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";

export interface RelatedItem {
  id: string;
  label: string;
  href: string;
  meta?: ReactNode;
}

export function RelatedSection({
  title,
  items,
  emptyLabel = "None linked yet.",
}: {
  title: string;
  items: RelatedItem[];
  emptyLabel?: string;
}) {
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-accent"
              >
                <span className="font-medium text-navy-800">{item.label}</span>
                {item.meta && <span className="shrink-0 text-xs text-muted">{item.meta}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
