import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";

const page = getFrontendPage("engineering");
export const metadata = pageMetadata(page);
export default function EngineeringPage() {
  return <KnowledgeIndex page={page} />;
}
