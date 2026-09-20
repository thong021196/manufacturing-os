import Link from "next/link";
import { ArrowRight, Check } from "@/components/design-system/icons";
import { Breadcrumbs, Button, SectionHeading, TechnicalPanel } from "@/components/design-system/primitives";

const stages = [
  ["01", "Scope", "Turn CAD, drawings, and use case into an explicit manufacturing brief."],
  ["02", "Match", "Route the geometry, material, quantity, and acceptance plan to the right capability."],
  ["03", "Control", "Keep the released revision and open decisions visible through production."],
  ["04", "Prove", "Return an inspection and release record that can travel with the part."],
] as const;

export function NetworkPageContent({ breadcrumbLabel = "Network" }: { breadcrumbLabel?: string }) {
  return (
    <div className="network-page">
      <div className="network-hero">
        <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company", href: "/company" }, { label: breadcrumbLabel }]} />
        <div className="network-hero__grid">
          <div>
            <p className="ds-eyebrow">MANUFACTURING NETWORK / CONTROL LAYER</p>
            <h1>Capability is useful when it is connected to evidence.</h1>
            <p>Manufacturing OS coordinates the handoff between engineering teams and production partners so a part does not lose its intent on the way to the shop floor.</p>
            <div className="network-hero__actions">
              <Button href="/rfq" size="lg">Start a manufacturing review <ArrowRight size={16} /></Button>
              <Link href="/quality" className="text-link">See the quality trail <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="network-map">
            <div className="network-map__grid" />
            <div className="network-map__rings" />
            <div className="network-map__core">MOS<span>CONTROL</span></div>
            <div className="network-map__label network-map__label--a">ENGINEERING<br /><strong>INPUT</strong></div>
            <div className="network-map__label network-map__label--b">CAPABILITY<br /><strong>ROUTE</strong></div>
            <div className="network-map__label network-map__label--c">INSPECTION<br /><strong>PROOF</strong></div>
          </div>
        </div>
      </div>
      <section className="public-section network-principles">
        <SectionHeading eyebrow="THE CONTROL LAYER" title="The network is a sequence, not a directory." description="A supplier list is only useful when the route, decision owner, and evidence expected from it are clear." />
        <div className="network-stage-grid">{stages.map(([step, title, body]) => <div key={step}><span>{step}</span><h3>{title}</h3><p>{body}</p></div>)}</div>
      </section>
      <section className="public-section network-proof">
        <div className="network-proof__grid">
          <TechnicalPanel label="WHAT TRAVELS WITH THE PART">
            <ul>
              <li><Check size={15} /> Released CAD and drawing revision</li>
              <li><Check size={15} /> Material, finish, and process assumptions</li>
              <li><Check size={15} /> Feature-level inspection plan</li>
              <li><Check size={15} /> Shipment and release evidence</li>
            </ul>
          </TechnicalPanel>
          <div>
            <p className="ds-eyebrow">FOR HARDWARE TEAMS</p>
            <h2>Make the route legible before it becomes expensive.</h2>
            <p>Start with one difficult part or a complete hardware package. The first review should tell you what is known, what is open, and what the next decision costs.</p>
            <Link href="/rfq" className="text-link">Open the RFQ intake <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
      <section className="public-section public-section--cta">
        <div className="cta-band">
          <div>
            <p className="ds-eyebrow">READY WHEN YOU ARE</p>
            <h2>Bring the engineering package.</h2>
            <p>We will connect the geometry to a route and make acceptance explicit.</p>
          </div>
          <Button href="/rfq" size="lg">Upload CAD / Request quote</Button>
        </div>
      </section>
    </div>
  );
}
