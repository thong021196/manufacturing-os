import { getFrontendPage } from "@/lib/frontend/adapter";
import { buildMetadata } from "@/lib/seo";
import { CapabilityGuide } from "@/components/design-system/pages/capability-guide";

const PATH = "/capabilities/5-axis-machining";
const page = getFrontendPage(PATH);
export const metadata = buildMetadata({ path: PATH, title: page.seo.title, description: page.seo.description });
export default function FiveAxisMachiningPage() {
  return <CapabilityGuide page={page} />;
}
