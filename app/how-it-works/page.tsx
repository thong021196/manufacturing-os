import { getFrontendPage } from "@/lib/frontend/adapter";
import { buildMetadata } from "@/lib/seo";
import { KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";

const PATH = "/how-it-works";
const page = getFrontendPage(PATH);
export const metadata = buildMetadata({ path: PATH, title: page.seo.title, description: page.seo.description });
export default function HowItWorksPage() {
  return <KnowledgeIndex page={page} />;
}
