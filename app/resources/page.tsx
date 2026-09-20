import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";

const page = getFrontendPage("resource");
export const metadata = pageMetadata(page);
export default function ResourcesPage() {
  return <KnowledgeIndex page={page} />;
}
