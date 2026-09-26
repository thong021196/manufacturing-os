import { liveMetadata, requireLivePage } from "@/lib/content/live";
import { ApplicationMap } from "@/components/design-system/pages/application-map";

const PATH = "/applications/humanoid-robots";

// Public registry page: rendered only while live per the content calendar
// (lib/content/publishing.ts); otherwise 404. Re-rendered in the background
// at most every 300 s (= PUBLIC_REVALIDATE_SECONDS) so schedule changes and
// owner pauses apply without a redeploy.
export const revalidate = 300;

export function generateMetadata() {
  return liveMetadata(PATH);
}

export default async function HumanoidRobotsPage() {
  const page = await requireLivePage(PATH);
  return <ApplicationMap page={page} />;
}
