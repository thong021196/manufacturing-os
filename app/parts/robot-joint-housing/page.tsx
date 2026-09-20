import { getFrontendPage } from "@/lib/frontend/adapter";
import { pageMetadata, PublicTechnicalPage } from "@/components/design-system/public-page";

const page = getFrontendPage("part");
export const metadata = pageMetadata(page);
export default function RobotJointHousingPage() { return <PublicTechnicalPage page={page} />; }
