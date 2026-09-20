import { getFrontendPage } from "@/lib/frontend/adapter";
import { buildMetadata } from "@/lib/seo";
import { QualityLedger } from "@/components/design-system/pages/quality-ledger";

const PATH = "/quality";
const page = getFrontendPage(PATH);
export const metadata = buildMetadata({ path: PATH, title: page.seo.title, description: page.seo.description });
export default function QualityPage() {
  return <QualityLedger page={page} />;
}
