import { Breadcrumbs } from "@/components/design-system/primitives";
import { liveMetadata, requireLiveEntry } from "@/lib/content/live";

const PATH = "/company/legal/terms";

// Public registry page: rendered only while live per the content calendar
// (lib/content/publishing.ts); otherwise 404. Re-rendered in the background
// at most every 300 s (= PUBLIC_REVALIDATE_SECONDS) so schedule changes and
// owner pauses apply without a redeploy.
export const revalidate = 300;

export function generateMetadata() {
  return liveMetadata(PATH);
}

export default async function TermsPage() {
  await requireLiveEntry(PATH);
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
