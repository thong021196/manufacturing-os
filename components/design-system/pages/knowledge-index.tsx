import type { Metadata } from "next";
import Link from "next/link";
import { pickBlock } from "@/lib/frontend/adapter";
import type { FrontendPageModel } from "@/lib/frontend/types";
import { ArrowRight, FileText } from "@/components/design-system/icons";
import { Breadcrumbs, Button, IndexMark, MonoLabel, Panel } from "@/components/design-system/primitives";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

/** The Engineering/Resources pages: a narrow reading document, not a wide
 * workspace or a chapter sequence — this is the one composition that reads
 * like a technical memo, for the second and third visit after trust is
 * already established. */
export function KnowledgeIndex({ page }: { page: FrontendPageModel }) {
  const hero = pickBlock(page, "hero");
  const criticalFeatures = pickBlock(page, "criticalFeatures");
  const route = pickBlock(page, "manufacturingRoute");
  const fileRequirements = pickBlock(page, "fileRequirements");
  const faq = pickBlock(page, "faq");
  const related = pickBlock(page, "relatedEntities");
  const cta = pickBlock(page, "cta");
  if (!hero) return null;

  return (
    <article className="mx-knowledge">
      <Breadcrumbs items={page.breadcrumbs} />
      <MonoLabel>{hero.eyebrow}</MonoLabel>
      <h1>{hero.title}</h1>
      <p className="mx-knowledge__lede">{hero.summary}</p>
      <dl className="mx-knowledge__meta">
        {hero.meta.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl>

      {criticalFeatures && (
        <section>
          <h2>What to get right</h2>
          <ol className="mx-knowledge__list">
            {criticalFeatures.features.map((feature) => (
              <li key={feature.index}><IndexMark value={feature.index} /><div><strong>{feature.title}</strong><p>{feature.detail}</p></div></li>
            ))}
          </ol>
        </section>
      )}

      {route && (
        <section>
          <h2>The sequence</h2>
          <ol className="mx-knowledge__list">
            {route.steps.map((step) => (
              <li key={step.step}><IndexMark value={step.step} /><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>
            ))}
          </ol>
        </section>
      )}

      {fileRequirements && (
        <Panel ticks className="mx-file-panel mx-file-panel--reading">
          <FileText size={20} />
          <div>
            <h3>Start with the engineering files</h3>
            <p>Upload the latest revision and we will flag missing information before routing the quote.</p>
          </div>
          <Button href="/rfq" variant="secondary">Open RFQ intake</Button>
        </Panel>
      )}

      {faq && (
        <section>
          <h2>Questions before you send the package</h2>
          <div className="mx-faq mx-faq--reading">
            {faq.items.map((item) => (
              <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>
            ))}
          </div>
        </section>
      )}

      {related && (
        <section>
          <h2>Useful next steps</h2>
          <ul className="mx-knowledge__links">
            {related.items.map((item) => <li key={item.label}><Link href={item.href ?? "#"}>{item.label}<ArrowRight size={13} /></Link></li>)}
          </ul>
        </section>
      )}

      {cta && (
        <div className="mx-knowledge__cta">
          <div><MonoLabel>READY WHEN YOU ARE</MonoLabel><h2>{cta.title}</h2><p>{cta.body}</p></div>
          <Button href="/rfq">Upload CAD / Request quote</Button>
        </div>
      )}
    </article>
  );
}
