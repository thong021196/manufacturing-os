import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("engineering");
export const metadata = pageMetadata(page);
export default function EngineeringPage() { return <PublicTechnicalPage page={page} />; }
