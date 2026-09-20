import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("resource");
export const metadata = pageMetadata(page);
export default function ResourcesPage() { return <PublicTechnicalPage page={page} />; }
