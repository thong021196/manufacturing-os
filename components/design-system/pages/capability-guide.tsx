import type { Metadata } from "next";
import Link from "next/link";
import { pickBlock } from "@/lib/frontend/adapter";
import type { FrontendPageModel } from "@/lib/frontend/types";
import { ArrowRight, Check, FileText, X } from "@/components/design-system/icons";
import { Breadcrumbs, Button, CornerTicks, IndexMark, MonoLabel, Panel, Reveal } from "@/components/design-system/primitives";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

/** The Capability page: a decision guide. It opens with a binary "use this
 * / consider an alternative" framing before any spec content — it reads as
 * an engineering recommendation, not a listing. */
export function CapabilityGuide({ page }: { page: FrontendPageModel }) {
  const hero = pickBlock(page, "hero");
  const capabilityStrip = pickBlock(page, "capabilityStrip");
  const criticalFeatures = pickBlock(page, "criticalFeatures");
  const materials = pickBlock(page, "materials");
  const route = pickBlock(page, "manufacturingRoute");
  const applications = pickBlock(page, "applications");
  const fileRequirements = pickBlock(page, "fileRequirements");
  const cta = pickBlock(page, "cta");
  if (!hero) return null;

  return (
    <div className="mx-guide">
      <div className="mx-guide__hero">
        <Breadcrumbs items={page.breadcrumbs} />
        <MonoLabel className="mx-mono-label--on-console">{hero.eyebrow}</MonoLabel>
        <h1>{hero.title}</h1>
        <p>{hero.summary}</p>
      </div>

      <div className="mx-guide__decision">
        <div className="mx-guide__decision-col mx-guide__decision-col--use">
          <MonoLabel>USE THIS WHEN</MonoLabel>
          <ul>
            {(criticalFeatures?.features ?? []).slice(0, 4).map((feature) => (
              <li key={feature.index}><Check size={15} />{feature.title}</li>
            ))}
          </ul>
        </div>
        <div className="mx-guide__decision-col mx-guide__decision-col--avoid">
          <MonoLabel>CONSIDER AN ALTERNATIVE WHEN</MonoLabel>
          <ul>
            <li><X size={15} />Geometry is simple and a single 3-axis setup already holds every critical datum</li>
            <li><X size={15} />Lot size and tolerance do not justify the added programming and setup time</li>
            <li><X size={15} />A lower-complexity route reaches the same acceptance criteria at lower risk</li>
          </ul>
        </div>
      </div>

      {capabilityStrip && (
        <div className="mx-dossier-strip mx-dossier-strip--paper">
          {capabilityStrip.items.map((item) => (
            <div key={item.label}>
              <MonoLabel>{item.label}</MonoLabel>
              <strong>{item.value}</strong>
              {item.note && <small>{item.note}</small>}
            </div>
          ))}
        </div>
      )}

      {criticalFeatures && (
        <Reveal className="mx-chapter mx-chapter--paper">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="01" /><h2>What controls the decision</h2></div>
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

      {route && (
        <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="02" /><h2>The route</h2></div>
            <ol className="mx-route-spine">
              {route.steps.map((step) => (
                <li key={step.step}>
                  <IndexMark value={step.step} />
                  <div><strong>{step.title}</strong><p>{step.detail}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      )}

      {materials && (
        <Reveal className="mx-chapter mx-chapter--paper">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="03" /><h2>Materials</h2></div>
            <table className="mx-dossier-table">
              <tbody>
                {materials.rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      {applications && (
        <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="04" /><h2>Common part families</h2></div>
            <div className="mx-index-table">
              {applications.items.map((item) => (
                <Link key={item.label} href={item.href ?? "#"} className="mx-index-table__row">
                  <span className="mx-index-table__code">{item.type}</span>
                  <span className="mx-index-table__body"><strong>{item.label}</strong><p>{item.detail}</p></span>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {fileRequirements && (
        <div className="mx-public-container">
          <Panel ticks className="mx-file-panel">
            <FileText size={22} />
            <div>
              <h3>Send the geometry, let it decide the route</h3>
              <p>{cta?.body ?? "Send the CAD and drawing. We will explain where this capability is useful and where a simpler route is safer."}</p>
              <div className="mx-file-panel__formats">
                {(fileRequirements.formats ?? ["STEP", "STP", "IGES", "X_T", "PDF", "BOM"]).map((format) => <span key={format}>{format}</span>)}
              </div>
            </div>
            <Button href="/rfq" variant="secondary">Open RFQ intake</Button>
          </Panel>
        </div>
      )}
      <CornerTicks />
    </div>
  );
}
