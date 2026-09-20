import { frontendPages } from "@/lib/frontend/mock";
import type { FrontendPageModel } from "@/lib/frontend/types";

export function getFrontendPage(kind: FrontendPageModel["kind"]): FrontendPageModel {
  return frontendPages[kind];
}

export function getPageMetadata(page: FrontendPageModel) {
  return { title: page.seo.title, description: page.seo.description };
}
