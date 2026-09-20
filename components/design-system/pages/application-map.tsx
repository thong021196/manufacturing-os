import type { Metadata } from "next";
import Link from "next/link";
import { pickBlock } from "@/lib/frontend/adapter";
import type { FrontendPageModel } from "@/lib/frontend/types";
import { ArrowRight, FileText } from "@/components/design-system/icons";
import { Breadcrumbs, Button, CornerTicks, IndexMark, MonoLabel, Panel, Reveal } from "@/components/design-system/primitives";

export function pageMetadata(page: FrontendPageModel): Metadata {
  return { title: page.seo.title, description: page.seo.description, openGraph: { title: page.seo.title, description: page.seo.description, type: "website" } };
}

/** The Application page: a system map. The decomposition diagram IS the
 * hero — there is no headline-left/visual-right hero grid here. */
export function ApplicationMap({ page }: { page: FrontendPageModel }) {
  const hero = pickBlock(page, "hero");
  const capabilityStrip = pickBlock(page, "capabilityStrip");
  const components = pickBlock(page, "applications");
  const route = pickBlock(page, "manufacturingRoute");
  const related = pickBlock(page, "relatedEntities");
  const fileRequirements = pickBlock(page, "fileRequirements");
  const cta = pickBlock(page, "cta");
  if (!hero) return null;
  const nodes = (components?.items ?? []).slice(0, 6);

  return (
    <div className="mx-sysmap">
      <div className="mx-sysmap__hero">
        <Breadcrumbs items={page.breadcrumbs} />
        <div className="mx-sysmap__diagram" aria-label={hero.visualLabel}>
          <div className="mx-sysmap__diagram-grid" />
          <div className="mx-sysmap__core">
            <span>{hero.visualCode}</span>
            {hero.title}
          </div>
          {nodes.map((node, index) => (
            <div key={node.label} className={`mx-sysmap__node mx-sysmap__node--${index}`}>{node.label}</div>
          ))}
        </div>
        <div className="mx-sysmap__intro">
          <MonoLabel className="mx-mono-label--on-console">{hero.eyebrow}</MonoLabel>
          <h1>{hero.title}</h1>
          <p>{hero.summary}</p>
        </div>
      </div>

      {capabilityStrip && (
        <div className="mx-dossier-strip mx-dossier-strip--paper">
          {capabilityStrip.items.map((item) => (
            <div key={item.label}>
              <MonoLabel>{item.label}</MonoLabel>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}

      {components && (
        <Reveal className="mx-chapter mx-chapter--paper">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="01" /><h2>System components</h2></div>
            <div className="mx-index-table">
              {components.items.map((item) => (
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

      {route && (
        <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
          <div className="mx-chapter__inner">
            <div className="mx-chapter__head"><IndexMark value="02" /><h2>How the system gets manufactured</h2></div>
            <div className="mx-process-rail">
              {route.steps.map((step) => (
                <div key={step.step} className="mx-process-rail__step">
                  <IndexMark value={step.step} />
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal className="mx-chapter mx-chapter--console mx-chapter--close">
        <div className="mx-chapter__inner mx-chapter__inner--close">
          <div>
            <MonoLabel className="mx-mono-label--on-console">CONTINUE INTO THE SYSTEM</MonoLabel>
            <h2 className="mx-home__closing-statement">{cta?.title ?? "Start from the system you are building."}</h2>
            <p className="mx-chapter__lede-on-console">{cta?.body}</p>
            <Button href="/rfq" size="lg">Upload CAD / Request quote <ArrowRight size={16} /></Button>
          </div>
          {related && (
            <ul className="mx-mini-index mx-mini-index--links">
              {related.items.map((item) => (
                <li key={item.label}><Link href={item.href ?? "#"}>{item.label}<ArrowRight size={13} /></Link></li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      {fileRequirements && (
        <div className="mx-public-container">
          <Panel ticks className="mx-file-panel">
            <FileText size={22} />
            <div>
              <h3>Start with the engineering files</h3>
              <p>Upload the latest revision and we will flag missing information before routing the quote.</p>
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
