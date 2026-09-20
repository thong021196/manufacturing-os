import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/company/legal/terms",
  title: "Terms of Service | Manufacturing OS",
  description: "Manufacturing OS terms of service.",
  noindex: true,
});

export default function TermsPage() {
  return (
    <div className="legal-page">
      <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company", href: "/company" }, { label: "Terms" }]} />
      <h1>Terms of service</h1>
      <p className="legal-page__lede">This page is a placeholder pending formal legal review.</p>
      <p>Commercial terms — quoting, revision control, acceptance criteria, and liability for manufactured hardware — will be documented here as counsel-reviewed terms of service before this system is used for production commitments.</p>
      <p>Until then, engagement terms for a specific RFQ are confirmed directly with the reviewing team as part of that quote.</p>
    </div>
  );
}
