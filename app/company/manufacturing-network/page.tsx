import type { Metadata } from "next";
import { NetworkPageContent } from "@/components/design-system/network-page";

export const metadata: Metadata = {
  title: "Manufacturing Network | Manufacturing OS",
  description: "How Manufacturing OS coordinates engineering intent, production capability, and inspection evidence across a qualified China manufacturing network.",
};

export default function CompanyManufacturingNetworkPage() {
  return <NetworkPageContent breadcrumbLabel="Manufacturing Network" />;
}
