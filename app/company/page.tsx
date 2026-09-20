import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building, Globe, Layers, Shield } from "@/components/design-system/icons";
import { Breadcrumbs, Button, SectionHeading, TechnicalPanel } from "@/components/design-system/primitives";

export const metadata: Metadata = {
  title: "Company | Manufacturing OS",
  description: "Manufacturing OS is one accountable interface between hardware teams in the US and AU and a qualified China manufacturing network.",
};

const pillars = [
  { icon: Shield, title: "One accountable interface", body: "A single point of engineering, commercial, and quality ownership from CAD intake through delivery — not a directory of disconnected vendors." },
  { icon: Layers, title: "Engineering review, not guesswork", body: "Every package is reviewed for manufacturability before it is routed, so questions surface as decisions rather than as production risk." },
  { icon: Globe, title: "China manufacturing depth", body: "A coordinated network of qualified partners across machining, sheet metal, finishing, and assembly, routed by demonstrated and declared capability." },
  { icon: Building, title: "Quality coordinated, not assumed", body: "Inspection plans, evidence, and release records are carried with the part, so acceptance is explicit at every handoff." },
];

const route = [
  { step: "01", title: "US / AU customer", detail: "Custom hardware need, CAD, drawing, or BOM" },
  { step: "02", title: "Engineering review", detail: "Manufacturability and requirement normalization" },
  { step: "03", title: "Supplier routing", detail: "Qualified China manufacturing network" },
  { step: "04", title: "Production & QC", detail: "Coordinated build with inspection evidence" },
  { step: "05", title: "Delivery", detail: "One accountable interface, start to finish" },
];

export default function CompanyPage() {
  return (
    <div className="company-page">
      <div className="company-hero">
        <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company" }]} />
        <div className="company-hero__grid">
          <div>
            <p className="ds-eyebrow">COMPANY / GLOBAL MANUFACTURING PARTNER</p>
            <h1>A serious interface between hardware teams and China manufacturing depth.</h1>
            <p>Manufacturing OS exists for one reason: complex custom hardware deserves an accountable production partner, not a marketplace of disconnected quotes. We review the engineering, route the work to qualified capability, and coordinate quality through delivery.</p>
            <div className="company-hero__actions">
              <Button href="/rfq" size="lg">Request a manufacturing review <ArrowRight size={16} /></Button>
              <Link href="/company/manufacturing-network" className="text-link">See the manufacturing network <ArrowRight size={15} /></Link>
            </div>
          </div>
          <TechnicalPanel className="company-hero__panel" label="WHAT WE ARE">
            <ul className="company-hero__list">
              <li>An engineering-reviewed manufacturing interface</li>
              <li>A coordinator of qualified China production capability</li>
              <li>One accountable owner of quote, route, and quality</li>
            </ul>
            <p className="company-hero__list-note">Not a catalog reseller. Not an open marketplace. Not a directory of unverified suppliers.</p>
          </TechnicalPanel>
        </div>
      </div>

      <section className="public-section company-pillars">
        <SectionHeading eyebrow="WHY MANUFACTURING OS" title="Depth on both sides of the handoff" description="Engineering credibility on intake, manufacturing depth on production — held together by one accountable interface." />
        <div className="company-pillar-grid">
          {pillars.map(({ icon: PillarIcon, title, body }) => (
            <div className="company-pillar" key={title}>
              <PillarIcon size={20} />
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="company-route-band">
        <div className="company-route-band__inner">
          <p className="ds-eyebrow">HOW THE INTERFACE WORKS</p>
          <div className="company-route">
            {route.map((item, index) => (
              <div className="company-route__step" key={item.step}>
                <span>{item.step}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                {index < route.length - 1 && <i className="company-route__line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section company-network-callout">
        <div className="company-network-callout__grid">
          <div>
            <p className="ds-eyebrow">MANUFACTURING NETWORK</p>
            <h2>Capability that is qualified, routed, and kept accountable.</h2>
            <p>Supplier capability is tracked at two layers — what a partner declares and what production has actually demonstrated — so routing decisions are grounded in evidence, not a sales pitch.</p>
            <Link href="/company/manufacturing-network" className="text-link">Open the manufacturing network <ArrowRight size={15} /></Link>
          </div>
          <TechnicalPanel label="NETWORK DISCIPLINE">
            <ul className="company-network-callout__list">
              <li>Declared capability reviewed before a part is routed</li>
              <li>Observed capability tracked from real production outcomes</li>
              <li>Revisioned CAD and drawings, never overwritten</li>
              <li>Inspection evidence attached to every completed job</li>
            </ul>
          </TechnicalPanel>
        </div>
      </section>

      <section className="public-section company-contact">
        <SectionHeading eyebrow="TALK TO THE TEAM" title="Start with the engineering package" description="The fastest way to reach Manufacturing OS is to open a review. General and partnership inquiries are routed the same way, so nothing waits behind a contact form." />
        <div className="company-contact-grid">
          <div className="company-contact-card">
            <strong>Request a quote</strong>
            <p>Upload CAD, drawings, or a BOM for an engineering-led manufacturability review.</p>
            <Link href="/rfq" className="text-link">Open RFQ intake <ArrowRight size={15} /></Link>
          </div>
          <div className="company-contact-card">
            <strong>Manufacturing network</strong>
            <p>Understand how capability is qualified, routed, and held accountable through production.</p>
            <Link href="/company/manufacturing-network" className="text-link">See how routing works <ArrowRight size={15} /></Link>
          </div>
          <div className="company-contact-card">
            <strong>Quality &amp; inspection</strong>
            <p>Review how evidence, traceability, and supplier qualification are handled end to end.</p>
            <Link href="/quality" className="text-link">See the quality system <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="public-section public-section--cta">
        <div className="cta-band">
          <div>
            <p className="ds-eyebrow">A SERIOUS PLACE TO START</p>
            <h2>Bring us the hardware you cannot afford to get wrong.</h2>
            <p>Engineering review, supplier routing, and quality coordination — held to one accountable interface.</p>
          </div>
          <Button href="/rfq" size="lg">Upload CAD / Request quote</Button>
        </div>
      </section>
    </div>
  );
}
