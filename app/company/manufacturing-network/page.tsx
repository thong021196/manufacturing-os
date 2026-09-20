import type { Metadata } from "next";
import { NetworkAtlas } from "@/components/design-system/pages/network-atlas";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/company/manufacturing-network",
  title: "Manufacturing Network | Manufacturing OS",
  description: "How Manufacturing OS routes engineering requirements through a qualified manufacturing network with inspection and evidence.",
});

export default function ManufacturingNetworkPage() {
  return <NetworkAtlas breadcrumbLabel="Manufacturing network" />;
}
