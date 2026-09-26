import type { Metadata } from "next";
import Link from "next/link";
import { pickBlock } from "@/lib/frontend/adapter";
import type { FrontendPageModel } from "@/lib/frontend/types";
import { ArrowRight } from "@/components/design-system/icons";
import { Breadcrumbs, Button, IndexMark, MonoLabel, Reveal } from "@/components/design-system/primitives";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

/** The Quality page: a vertical evidence ledger — a spine of checkpoints,
 * not a spec table. This is the trust/evidence composition, distinct from
 * every workspace/dossier layout used elsewhere. */
export function QualityLedger({ page }: { page: FrontendPageModel }) {
  const hero = pickBlock(page, "hero");
  const inspection = pickBlock(page, "inspection");
  const criticalFeatures = pickBlock(page, "criticalFeatures");
  const related = pickBlock(page, "relatedEntities");
  const cta = pickBlock(page, "cta");
  if (!hero) return null;

  const ledger = [
    ...(inspection?.rows.map((row) => ({ key: row.check, title: row.check, detail: `${row.method} · ${row.evidence}` })) ?? []),
  ];

  return (
    <div className="mx-ledger">
      <div className="mx-ledger__hero">
        <Breadcrumbs items={page.breadcrumbs} />
        <MonoLabel className="mx-mono-label--on-console">{hero.eyebrow}</MonoLabel>
        <h1>{hero.title}</h1>
        <p>{hero.summary}</p>
        <div className="mx-ledger__meta">
          {hero.meta.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
        </div>
      </div>

      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <div className="mx-chapter__head"><MonoLabel>THE EVIDENCE TRAIL</MonoLabel><h2>Every checkpoint is a record, not an assumption.</h2></div>
          <ol className="mx-ledger__spine">
            {ledger.map((item, index) => (
              <li key={item.key}>
                <IndexMark value={String(index + 1).padStart(2, "0")} />
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {criticalFeatures && (
        <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><MonoLabel>PROVENANCE DISCIPLINE</MonoLabel><h2>How a fact earns its place here.</h2></div>
            <div className="mx-feature-grid">
              {criticalFeatures.features.map((feature) => (
                <div key={feature.index} className="mx-feature-grid__item">
                  <IndexMark value={feature.index} />
                  <strong>{feature.title}</strong>
                  <p>{feature.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal className="mx-chapter mx-chapter--console mx-chapter--close">
        <div className="mx-chapter__inner mx-chapter__inner--close">
          <div>
            <MonoLabel className="mx-mono-label--on-console">MAKE ACCEPTANCE EXPLICIT</MonoLabel>
            <h2 className="mx-home__closing-statement">{cta?.title ?? "Bring the drawing."}</h2>
            <p className="mx-chapter__lede-on-console">{cta?.body}</p>
            <Button href="/rfq" size="lg">Attach the acceptance plan <ArrowRight size={16} /></Button>
          </div>
          {related && (
            <ul className="mx-mini-index mx-mini-index--links">
              {related.items.map((item) => <li key={item.label}><Link href={item.href ?? "#"}>{item.label}<ArrowRight size={13} /></Link></li>)}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
