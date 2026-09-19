export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted">
      {label}
    </div>
  );
}
