import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("quality");
export const metadata = pageMetadata(page);
export default function QualityPage() { return <PublicTechnicalPage page={page} />; }
