import Link from "next/link";
import { ArrowRight } from "@/components/design-system/icons";
import { Breadcrumbs, Button, CornerTicks, IndexMark, MonoLabel, Panel, Reveal, TextLink } from "@/components/design-system/primitives";
import { liveMetadata, requireLiveEntry } from "@/lib/content/live";
import { companyPillars as pillars, companyRoute as route } from "@/lib/content/site-copy";

const PATH = "/company";

// Public registry page: rendered only while live per the content calendar
// (lib/content/publishing.ts); otherwise 404. Re-rendered in the background
// at most every 300 s (= PUBLIC_REVALIDATE_SECONDS) so schedule changes and
// owner pauses apply without a redeploy.
export const revalidate = 300;

export function generateMetadata() {
  return liveMetadata(PATH);
}

export default async function CompanyPage() {
  await requireLiveEntry(PATH);
  return (
    <div className="mx-company">
      <div className="mx-company__hero">
        <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company" }]} />
        <div className="mx-company__hero-grid">
          <div>
            <MonoLabel className="mx-mono-label--on-console">COMPANY / EXECUTION INTERFACE</MonoLabel>
            <h1>A serious interface between hardware teams and manufacturing depth.</h1>
            <p>Manufacturing OS exists for one reason: complex custom hardware deserves an accountable production partner, not a marketplace of disconnected quotes. We review the engineering, route the work to qualified capability, and coordinate quality through delivery.</p>
            <div className="mx-company__hero-actions">
              <Button href="/rfq" size="lg">Request a manufacturing review <ArrowRight size={16} /></Button>
              <TextLink href="/company/manufacturing-network">See the manufacturing network</TextLink>
            </div>
          </div>
          <Panel ticks label="WHAT WE ARE" className="mx-company__panel">
            <ul className="mx-checklist">
              <li>An engineering-reviewed manufacturing interface</li>
              <li>A coordinator of qualified manufacturing capability</li>
              <li>One accountable owner of quote, route, and quality</li>
            </ul>
            <p className="mx-company__panel-note">Not a catalog reseller. Not an open marketplace. Not a directory of unverified suppliers.</p>
          </Panel>
        </div>
      </div>

      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <MonoLabel>WHY MANUFACTURING OS</MonoLabel>
          <ol className="mx-manifesto">
            {pillars.map((pillar) => (
              <li key={pillar.index}>
                <IndexMark value={pillar.index} />
                <h2>{pillar.title}</h2>
                <p>{pillar.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <div className="mx-company__route">
        <div className="mx-company__route-inner">
          <MonoLabel className="mx-mono-label--on-console">HOW THE INTERFACE WORKS</MonoLabel>
          <div className="mx-process-rail mx-process-rail--console">
            {route.map((item) => (
              <div key={item.step} className="mx-process-rail__step">
                <IndexMark value={item.step} />
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
        <div className="mx-chapter__inner mx-chapter__inner--split">
          <div className="mx-chapter__statement">
            <MonoLabel>MANUFACTURING NETWORK</MonoLabel>
            <h2>Capability that is qualified, routed, and kept accountable.</h2>
            <p>Supplier capability is tracked at two layers — what a partner declares and what production has actually demonstrated — so routing decisions are grounded in evidence, not a sales pitch.</p>
            <TextLink href="/company/manufacturing-network">Open the manufacturing network</TextLink>
          </div>
          <Panel ticks label="NETWORK DISCIPLINE">
            <ul className="mx-checklist">
              <li>Declared capability reviewed before a part is routed</li>
              <li>Observed capability tracked from real production outcomes</li>
              <li>Revisioned CAD and drawings, never overwritten</li>
              <li>Inspection evidence attached to every completed job</li>
            </ul>
          </Panel>
        </div>
      </Reveal>

      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <MonoLabel>TALK TO THE TEAM</MonoLabel>
          <h2>Start with the engineering package.</h2>
          <p className="mx-chapter__lede">The fastest way to reach Manufacturing OS is to open a review. General and partnership inquiries are routed the same way, so nothing waits behind a contact form.</p>
          <div className="mx-index-table">
            <Link href="/rfq" className="mx-index-table__row">
              <span className="mx-index-table__code">RFQ</span>
              <span className="mx-index-table__body"><strong>Request a quote</strong><p>Upload CAD, drawings, or a BOM for an engineering-led manufacturability review.</p></span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/company/manufacturing-network" className="mx-index-table__row">
              <span className="mx-index-table__code">NETWORK</span>
              <span className="mx-index-table__body"><strong>Manufacturing network</strong><p>Understand how capability is qualified, routed, and held accountable through production.</p></span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/quality" className="mx-index-table__row">
              <span className="mx-index-table__code">QUALITY</span>
              <span className="mx-index-table__body"><strong>Quality &amp; inspection</strong><p>Review how evidence, traceability, and supplier qualification are handled end to end.</p></span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-chapter mx-chapter--console mx-chapter--close">
        <div className="mx-chapter__inner mx-chapter__inner--close">
          <div>
            <MonoLabel className="mx-mono-label--on-console">A SERIOUS PLACE TO START</MonoLabel>
            <h2 className="mx-home__closing-statement">Bring us the hardware you cannot afford to get wrong.</h2>
            <Button href="/rfq" size="lg">Upload CAD / Request quote <ArrowRight size={16} /></Button>
          </div>
        </div>
      </Reveal>
      <CornerTicks />
    </div>
  );
}
