import { HomeExperience } from "@/components/design-system/pages/home";
import { buildMetadata } from "@/lib/seo";
import { getFrontendPage } from "@/lib/frontend/adapter";

const page = getFrontendPage("/");

export const metadata = buildMetadata({ path: "/", title: page.seo.title, description: page.seo.description });

export default function HomePage() {
  return <HomeExperience />;
}
