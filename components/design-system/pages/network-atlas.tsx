import Link from "next/link";
import { ArrowRight, Check } from "@/components/design-system/icons";
import { Breadcrumbs, Button, IndexMark, MonoLabel, Panel, Reveal, TextLink } from "@/components/design-system/primitives";

const stages = [
  { step: "01", title: "Scope", detail: "Turn CAD, drawings, and use case into an explicit manufacturing brief." },
  { step: "02", title: "Match", detail: "Route the geometry, material, quantity, and acceptance plan to the right capability." },
  { step: "03", title: "Control", detail: "Keep the released revision and open decisions visible through production." },
  { step: "04", title: "Prove", detail: "Return an inspection and release record that can travel with the part." },
];

/** The Company/Network page: a network atlas. Opens full-bleed with the
 * route diagram before any copy, then reads as a manifesto (numbered
 * principles at display scale) rather than a mission-statement paragraph. */
export function NetworkAtlas({ breadcrumbLabel = "Manufacturing network" }: { breadcrumbLabel?: string }) {
  return (
    <div className="mx-atlas">
      <div className="mx-atlas__hero">
        <Breadcrumbs items={[{ label: "Manufacturing OS", href: "/" }, { label: "Company", href: "/company" }, { label: breadcrumbLabel }]} />
        <div className="mx-atlas__diagram" aria-hidden="true">
          <div className="mx-atlas__diagram-grid" />
          <div className="mx-atlas__ring mx-atlas__ring--outer" />
          <div className="mx-atlas__ring mx-atlas__ring--inner" />
          <div className="mx-atlas__core">MOS<span>CONTROL LAYER</span></div>
          <div className="mx-atlas__label mx-atlas__label--a">ENGINEERING<strong>INPUT</strong></div>
          <div className="mx-atlas__label mx-atlas__label--b">CAPABILITY<strong>ROUTE</strong></div>
          <div className="mx-atlas__label mx-atlas__label--c">INSPECTION<strong>PROOF</strong></div>
        </div>
        <div className="mx-atlas__statement">
          <MonoLabel className="mx-mono-label--on-console">MANUFACTURING NETWORK / CONTROL LAYER</MonoLabel>
          <h1>Capability is only useful when it is connected to evidence.</h1>
          <p>Manufacturing OS coordinates the handoff between engineering teams and production partners so a part does not lose its intent on the way to the shop floor.</p>
          <div className="mx-atlas__actions">
            <Button href="/rfq" size="lg">Start a manufacturing review <ArrowRight size={16} /></Button>
            <TextLink href="/quality">See the quality trail</TextLink>
          </div>
        </div>
      </div>

      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <MonoLabel>THE NETWORK IS A SEQUENCE, NOT A DIRECTORY</MonoLabel>
          <ol className="mx-manifesto">
            {stages.map((stage) => (
              <li key={stage.step}>
                <IndexMark value={stage.step} />
                <h2>{stage.title}</h2>
                <p>{stage.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
        <div className="mx-chapter__inner mx-chapter__inner--split">
          <Panel ticks label="WHAT TRAVELS WITH THE PART">
            <ul className="mx-checklist">
              <li><Check size={15} /> Released CAD and drawing revision</li>
              <li><Check size={15} /> Material, finish, and process assumptions</li>
              <li><Check size={15} /> Feature-level inspection plan</li>
              <li><Check size={15} /> Shipment and release evidence</li>
            </ul>
          </Panel>
          <div className="mx-chapter__statement">
            <MonoLabel>FOR HARDWARE TEAMS</MonoLabel>
            <h2>Make the route legible before it becomes expensive.</h2>
            <p>Start with one difficult part or a complete hardware package. The first review should tell you what is known, what is open, and what the next decision costs.</p>
            <TextLink href="/rfq">Open the RFQ intake</TextLink>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-chapter mx-chapter--console mx-chapter--close">
        <div className="mx-chapter__inner mx-chapter__inner--close">
          <div>
            <MonoLabel className="mx-mono-label--on-console">READY WHEN YOU ARE</MonoLabel>
            <h2 className="mx-home__closing-statement">Bring the engineering package.</h2>
            <Button href="/rfq" size="lg">Upload CAD / Request quote <ArrowRight size={16} /></Button>
          </div>
          <ul className="mx-mini-index mx-mini-index--links">
            <li><Link href="/quality">Quality system<ArrowRight size={13} /></Link></li>
            <li><Link href="/company">About Manufacturing OS<ArrowRight size={13} /></Link></li>
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
