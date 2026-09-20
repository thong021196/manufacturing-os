import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, QualityLedger } from "@/components/design-system/pages/quality-ledger";

const page = getFrontendPage("quality");
export const metadata = pageMetadata(page);
export default function QualityPage() {
  return <QualityLedger page={page} />;
}
