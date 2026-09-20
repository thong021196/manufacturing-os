import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, CapabilityGuide } from "@/components/design-system/pages/capability-guide";

const page = getFrontendPage("capability");
export const metadata = pageMetadata(page);
export default function FiveAxisMachiningPage() {
  return <CapabilityGuide page={page} />;
}
