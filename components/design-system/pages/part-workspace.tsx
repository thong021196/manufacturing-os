import type { Metadata } from "next";
import Link from "next/link";
import { pickBlock } from "@/lib/frontend/adapter";
import type { FrontendPageModel } from "@/lib/frontend/types";
import { ArrowRight, Check, FileText } from "@/components/design-system/icons";
import { Breadcrumbs, Button, CornerTicks, IndexMark, MonoLabel, Panel, Reveal, StatusTag } from "@/components/design-system/primitives";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

const sections = [
  { id: "route", label: "Route" },
  { id: "features", label: "Features" },
  { id: "materials", label: "Materials" },
  { id: "inspection", label: "Inspection" },
  { id: "context", label: "Context" },
];

/** The Part page: a procurement workspace, not an entity template. A
 * persistent object/context rail sits alongside a navigable technical
 * dossier — this is a fixed two-pane structure, unlike the homepage's
 * vertical chapter sequence or the RFQ console's rail+step layout. */
export function PartWorkspace({ page }: { page: FrontendPageModel }) {
  const hero = pickBlock(page, "hero");
  const capabilityStrip = pickBlock(page, "capabilityStrip");
  const specGrid = pickBlock(page, "specGrid");
  const criticalFeatures = pickBlock(page, "criticalFeatures");
  const materials = pickBlock(page, "materials");
  const route = pickBlock(page, "manufacturingRoute");
  const inspection = pickBlock(page, "inspection");
  const applications = pickBlock(page, "applications");
  const related = pickBlock(page, "relatedEntities");
  const fileRequirements = pickBlock(page, "fileRequirements");
  const faq = pickBlock(page, "faq");
  const cta = pickBlock(page, "cta");
  if (!hero) return null;

  return (
    <div className="mx-workspace">
      <div className="mx-workspace__topbar">
        <Breadcrumbs items={page.breadcrumbs} />
        <StatusTag tone="evidence">RFQ-READY</StatusTag>
      </div>

      <div className="mx-workspace__layout">
        <aside className="mx-workspace__rail">
          <div className="mx-workspace__rail-sticky">
            <Panel ticks className="mx-object-card">
              <MonoLabel>{hero.eyebrow}</MonoLabel>
              <h1 className="mx-workspace__title">{hero.title}</h1>
              <p className="mx-workspace__summary">{hero.summary}</p>
              <div className="mx-object-figure" aria-label={hero.visualLabel}>
                <svg viewBox="0 0 200 160" fill="none" aria-hidden="true">
                  <rect x="30" y="30" width="140" height="100" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="100" cy="80" r="26" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="100" cy="80" r="10" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="30" y1="30" x2="10" y2="14" stroke="currentColor" strokeWidth="1" />
                  <line x1="170" y1="30" x2="190" y2="14" stroke="currentColor" strokeWidth="1" />
                  <line x1="100" y1="30" x2="100" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
                <span>{hero.visualCode}</span>
              </div>
              <dl className="mx-object-card__meta">
                {hero.meta.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mx-object-card__readiness">
                <MonoLabel>RFQ READINESS</MonoLabel>
                <ul>
                  <li><Check size={13} /> Geometry &amp; interfaces reviewed</li>
                  <li><Check size={13} /> Manufacturing route mapped</li>
                  <li><Check size={13} /> Inspection plan scoped</li>
                </ul>
              </div>
              <Button href="/rfq" className="mx-object-card__cta">
                Upload CAD / Request quote <ArrowRight size={15} />
              </Button>
            </Panel>
          </div>
        </aside>

        <div className="mx-workspace__dossier">
          <nav className="mx-workspace__segmented" aria-label="Dossier sections">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>{section.label}</a>
            ))}
          </nav>

          {capabilityStrip && (
            <div className="mx-dossier-strip">
              {capabilityStrip.items.map((item) => (
                <div key={item.label}>
                  <MonoLabel>{item.label}</MonoLabel>
                  <strong>{item.value}</strong>
                  {item.note && <small>{item.note}</small>}
                </div>
              ))}
            </div>
          )}

          {specGrid && (
            <Reveal className="mx-dossier-section">
              <div className="mx-dossier-section__head"><IndexMark value="01" /><h2>Overview</h2></div>
              <div className="mx-spec-rows">
                {specGrid.items.map((item) => (
                  <div key={item.label} className="mx-spec-rows__row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    {item.annotation && <em>{item.annotation}</em>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {route && (
            <Reveal className="mx-dossier-section" id="route">
              <div className="mx-dossier-section__head"><IndexMark value="02" /><h2>Manufacturing route</h2></div>
              <ol className="mx-route-spine">
                {route.steps.map((step) => (
                  <li key={step.step}>
                    <IndexMark value={step.step} />
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {criticalFeatures && (
            <Reveal className="mx-dossier-section" id="features">
              <div className="mx-dossier-section__head"><IndexMark value="03" /><h2>Critical features</h2></div>
              <div className="mx-feature-grid">
                {criticalFeatures.features.map((feature) => (
                  <div key={feature.index} className="mx-feature-grid__item">
                    <IndexMark value={feature.index} />
                    <strong>{feature.title}</strong>
                    <p>{feature.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {materials && (
            <Reveal className="mx-dossier-section" id="materials">
              <div className="mx-dossier-section__head"><IndexMark value="04" /><h2>Materials &amp; finish</h2></div>
              <table className="mx-dossier-table">
                <tbody>
                  {materials.rows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      <td>{row.value}</td>
                      <td>{row.status && <StatusTag tone="neutral">{row.status}</StatusTag>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}

          {inspection && (
            <Reveal className="mx-dossier-section" id="inspection">
              <div className="mx-dossier-section__head"><IndexMark value="05" /><h2>Inspection strategy</h2></div>
              <table className="mx-dossier-table">
                <tbody>
                  {inspection.rows.map((row) => (
                    <tr key={row.check}>
                      <th>{row.check}</th>
                      <td>{row.method}</td>
                      <td>{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}

          {(applications || related) && (
            <Reveal className="mx-dossier-section" id="context">
              <div className="mx-dossier-section__head"><IndexMark value="06" /><h2>Application &amp; related capability</h2></div>
              <div className="mx-context-list">
                {[...(applications?.items ?? []), ...(related?.items ?? [])].map((item) => (
                  <Link key={item.label} href={item.href ?? "#"} className="mx-context-list__row">
                    <span>{item.type}</span>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {fileRequirements && (
            <Panel ticks className="mx-file-panel">
              <FileText size={22} />
              <div>
                <h3>Start with the engineering files</h3>
                <p>Upload the latest revision and we will flag missing information before routing the quote.</p>
                <div className="mx-file-panel__formats">
                  {(fileRequirements.formats ?? ["STEP", "STP", "IGES", "X_T", "PDF", "BOM"]).map((format) => (
                    <span key={format}>{format}</span>
                  ))}
                </div>
              </div>
              <Button href="/rfq" variant="secondary">Open RFQ intake</Button>
            </Panel>
          )}

          {faq && (
            <div className="mx-faq">
              {faq.items.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          )}

          {cta && (
            <div className="mx-dossier-cta">
              <div>
                <MonoLabel>READY WHEN YOU ARE</MonoLabel>
                <h3>{cta.title}</h3>
                <p>{cta.body}</p>
              </div>
              <Button href="/rfq">Upload CAD / Request quote</Button>
            </div>
          )}
        </div>
      </div>
      <CornerTicks />
    </div>
  );
}
