import { Breadcrumbs } from "@/components/design-system/primitives";
import { liveMetadata, requireLiveEntry } from "@/lib/content/live";

const PATH = "/company/legal/privacy";

// Public registry page: rendered only while live per the content calendar
// (lib/content/publishing.ts); otherwise 404. Re-rendered in the background
// at most every 300 s (= PUBLIC_REVALIDATE_SECONDS) so schedule changes and
// owner pauses apply without a redeploy.
export const revalidate = 300;

export function generateMetadata() {
  return liveMetadata(PATH);
}

export default async function PrivacyPage() {
  await requireLiveEntry(PATH);
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
