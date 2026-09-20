import { getFrontendPage } from "@/lib/frontend/adapter";
import { buildMetadata } from "@/lib/seo";
import { KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";

const PATH = "/engineering";
const page = getFrontendPage(PATH);
export const metadata = buildMetadata({ path: PATH, title: page.seo.title, description: page.seo.description });
export default function EngineeringPage() {
  return <KnowledgeIndex page={page} />;
}
