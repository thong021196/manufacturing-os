import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/company/legal/privacy",
  title: "Privacy Policy | Manufacturing OS",
  description: "Manufacturing OS privacy policy.",
  noindex: true,
});

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company", href: "/company" }, { label: "Privacy" }]} />
      <h1>Privacy policy</h1>
      <p className="legal-page__lede">This page is a placeholder pending formal legal review.</p>
      <p>Manufacturing OS treats CAD files, drawings, BOMs, and other customer materials submitted through the RFQ intake as private by default — they are never publicly indexed or shared outside the manufacturing review and production process. A complete, counsel-reviewed privacy policy will be published here before this system handles production data.</p>
      <p>For questions about how a specific submission is handled today, use the RFQ intake and ask the reviewing team directly.</p>
    </div>
  );
}
