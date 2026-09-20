import type { Metadata } from "next";
import { BlockRenderer } from "@/components/design-system/block-renderer";
import { TechnicalHero } from "@/components/design-system/product";
import type { FrontendPageModel } from "@/lib/frontend/types";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

export function PublicTechnicalPage({ page }: { page: FrontendPageModel }) {
  const hero = page.blocks.find((block) => block.type === "hero");
  if (!hero || hero.type !== "hero") return null;
  const hasSpecification = page.blocks.some((block) => block.type === "specGrid");
  return <div className={`public-page public-page--${page.kind}`} data-page-kind={page.kind}><TechnicalHero breadcrumbs={page.breadcrumbs} eyebrow={hero.eyebrow} title={hero.title} summary={hero.summary} meta={hero.meta} visualLabel={hero.visualLabel} visualCode={hero.visualCode} specificationHref={hasSpecification ? "#specification" : undefined} /><BlockRenderer blocks={page.blocks} /></div>;
}
