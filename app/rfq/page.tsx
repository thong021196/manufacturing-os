import type { Metadata } from "next";
import { RfqWizard } from "@/components/design-system/rfq-wizard";

export const metadata: Metadata = {
  title: "Request a Quote | Manufacturing OS",
  description: "Upload an engineering package for a drawing-led manufacturing review.",
};

export default function RfqPage() {
  return <RfqWizard />;
}
