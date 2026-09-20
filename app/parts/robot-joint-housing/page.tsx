import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PartWorkspace } from "@/components/design-system/pages/part-workspace";

const page = getFrontendPage("part");
export const metadata = pageMetadata(page);
export default function RobotJointHousingPage() {
  return <PartWorkspace page={page} />;
}
