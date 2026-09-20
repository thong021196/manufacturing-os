import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("capability");
export const metadata = pageMetadata(page);
export default function FiveAxisMachiningPage() { return <PublicTechnicalPage page={page} />; }
