import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, ApplicationMap } from "@/components/design-system/pages/application-map";

const page = getFrontendPage("application");
export const metadata = pageMetadata(page);
export default function HumanoidRobotsPage() {
  return <ApplicationMap page={page} />;
}
