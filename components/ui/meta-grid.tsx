import type { ReactNode } from "react";

export interface MetaField {
  label: string;
  value: ReactNode;
}

export function MetaGrid({ fields }: { fields: MetaField[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">{field.label}</dt>
          <dd className="mt-0.5 text-sm text-navy-900">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}
