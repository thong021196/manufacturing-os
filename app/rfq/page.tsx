import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system/primitives";
import { RfqWizard } from "@/components/design-system/rfq-wizard";

export const metadata: Metadata = { title: "Request a Quote | Manufacturing OS", description: "Upload an engineering package for a drawing-led manufacturing review." };

export default function RfqPage() {
  return <div className="rfq-page"><Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "RFQ intake" }]} /><RfqWizard /></div>;
}
