import { getFrontendPage } from "@/lib/frontend/adapter";
import { buildMetadata } from "@/lib/seo";
import { PartWorkspace } from "@/components/design-system/pages/part-workspace";

const PATH = "/parts/robot-joint-housing";
const page = getFrontendPage(PATH);
export const metadata = buildMetadata({ path: PATH, title: page.seo.title, description: page.seo.description });
export default function RobotJointHousingPage() {
  return <PartWorkspace page={page} />;
}
