import { liveMetadata, requireLivePage } from "@/lib/content/live";
import { KnowledgeIndex } from "@/components/design-system/pages/knowledge-index";

const PATH = "/how-it-works";

// Public registry page: rendered only while live per the content calendar
// (lib/content/publishing.ts); otherwise 404. Re-rendered in the background
// at most every 300 s (= PUBLIC_REVALIDATE_SECONDS) so schedule changes and
// owner pauses apply without a redeploy.
export const revalidate = 300;

export function generateMetadata() {
  return liveMetadata(PATH);
}

export default async function HowItWorksPage() {
  const page = await requireLivePage(PATH);
  return <KnowledgeIndex page={page} />;
}
