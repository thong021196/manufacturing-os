import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  rowHref,
  emptyLabel = "No records yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            {columns.map((col) => (
              <th key={col.header} className={`whitespace-nowrap py-2 pr-4 font-medium ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = rowHref?.(row);
            const cells = columns.map((col) => (
              <td key={col.header} className={`whitespace-nowrap py-2.5 pr-4 align-middle ${col.className ?? ""}`}>
                {col.cell(row)}
              </td>
            ));
            return href ? (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-accent-soft/60">
                {columns.map((col, i) => (
                  <td key={col.header} className={`whitespace-nowrap py-0 pr-4 align-middle ${col.className ?? ""}`}>
                    <Link href={href} className="block py-2.5">
                      {i === 0 ? <span className="font-medium text-navy-800">{col.cell(row)}</span> : col.cell(row)}
                    </Link>
                  </td>
                ))}
              </tr>
            ) : (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                {cells}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
