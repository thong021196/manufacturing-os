import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("application");
export const metadata = pageMetadata(page);
export default function HumanoidRobotsPage() { return <PublicTechnicalPage page={page} />; }
