import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { CapabilityLayerBadge } from "@/components/ui/badges";
import { Suppliers, Processes, capabilitiesForSupplier } from "@/lib/data";

export default function CapabilityGraphPage() {
  const suppliers = Suppliers.all();
  const processes = Processes.all();

  return (
    <div>
      <PageHeader
        eyebrow="Supply"
        title="Capability Graph"
        description="Matrix of suppliers against manufacturing processes. Declared capability is self-reported; observed capability is confirmed by production and QC evidence. The two are always shown as distinct layers, never merged into one score."
      />
      <Panel>
        <div className="scrollbar-thin -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Supplier</th>
                {processes.map((p) => (
                  <th key={p.id} className="py-2 pr-4 font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => {
                const caps = capabilitiesForSupplier(supplier.id);
                return (
                  <tr key={supplier.id} className="border-b border-border last:border-b-0">
                    <td className="py-2.5 pr-4">
                      <Link href={`/supply/suppliers/${supplier.id}`} className="font-medium text-navy-800 hover:text-accent">
                        {supplier.name}
                      </Link>
                    </td>
                    {processes.map((process) => {
                      const forProcess = caps.filter((c) => c.processId === process.id);
                      return (
                        <td key={process.id} className="py-2.5 pr-4">
                          {forProcess.length === 0 ? (
                            <span className="text-xs text-muted">—</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {forProcess.map((cap) => (
                                <CapabilityLayerBadge key={cap.id} layer={cap.layer} />
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
