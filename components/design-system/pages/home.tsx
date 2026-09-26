import Link from "next/link";
import { ArrowRight, Check } from "@/components/design-system/icons";
import { Button, IndexMark, MonoLabel, Reveal, TextLink } from "@/components/design-system/primitives";
import {
  homeEvidenceCheckpoints as evidenceCheckpoints,
  homeRequirementSequence as requirementSequence,
  homeSystemRows as systemRows,
} from "@/lib/content/site-copy";

export function HomeExperience() {
  return (
    <div className="mx-home">
      {/* Chapter 1 — Opening statement. Console register, flagship type, a
          status line instead of a hero diagram square. */}
      <section className="mx-home__opening">
        <div className="mx-home__grid-overlay" aria-hidden="true" />
        <div className="mx-home__opening-inner">
          <MonoLabel className="mx-home__opening-eyebrow">MANUFACTURING OS / EXECUTION INTERFACE</MonoLabel>
          <h1 className="mx-home__flagship">
            The operating layer for custom hardware production.
          </h1>
          <p className="mx-home__opening-lead">
            One interface between a hardware requirement and an inspected, delivered part —
            engineering review, an intelligent manufacturing network, production, quality,
            and evidence, held together with one accountable owner.
          </p>
          <div className="mx-home__opening-actions">
            <Button href="/rfq" size="lg">
              Bring a requirement <ArrowRight size={16} />
            </Button>
            <TextLink href="/parts/robot-joint-housing">See it work on a real part</TextLink>
          </div>
        </div>
        <div className="mx-home__status-line">
          <span>SYSTEM / v2</span>
          <span>CAD → STRUCTURED REQUIREMENT → ROUTE → PRODUCTION → EVIDENCE</span>
          <span className="mx-home__status-line-live"><i /> LIVE INTAKE OPEN</span>
        </div>
      </section>

      {/* Chapter 2 — Requirement sequence. Paper register, horizontal
          numbered spine, not a 3-card grid. */}
      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <div className="mx-chapter__head">
            <MonoLabel>HOW A REQUIREMENT ENTERS THE SYSTEM</MonoLabel>
            <h2>From an idea, a drawing, or a problem — to an accountable route.</h2>
          </div>
          <ol className="mx-sequence">
            {requirementSequence.map((step) => (
              <li key={step.index} className="mx-sequence__step">
                <IndexMark value={step.index} />
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* Chapter 3 — What the system manufactures. Asymmetric split: a
          statement column and an index-table column, not a card grid. */}
      <Reveal className="mx-chapter mx-chapter--paper mx-chapter--muted">
        <div className="mx-chapter__inner mx-chapter__inner--split">
          <div className="mx-chapter__statement">
            <MonoLabel>WHAT THE SYSTEM MANUFACTURES</MonoLabel>
            <h2>Every route starts from a real object, not a category.</h2>
            <p>
              The system is organized around the objects that actually get manufactured —
              parts, the capabilities that produce them, and the applications they belong to.
              Explore any one of them the way an engineer would: by the part in front of them.
            </p>
          </div>
          <div className="mx-index-table">
            {systemRows.map((row) => (
              <Link key={row.code} href={row.href} className="mx-index-table__row">
                <span className="mx-index-table__code">{row.code}</span>
                <span className="mx-index-table__body">
                  <strong>{row.label}</strong>
                  <p>{row.detail}</p>
                </span>
                <span className="mx-index-table__example">
                  {row.example}
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Chapter 4 — Intelligence / network. Console register, full-bleed
          diagram paired with accountability copy. A different device from
          the opening chapter (a routing diagram, not a status line). */}
      <Reveal className="mx-chapter mx-chapter--console">
        <div className="mx-chapter__inner mx-chapter__inner--network">
          <div className="mx-network-diagram" aria-hidden="true">
            <div className="mx-network-diagram__grid" />
            <div className="mx-network-diagram__node mx-network-diagram__node--core">
              MOS<span>CONTROL</span>
            </div>
            <div className="mx-network-diagram__node mx-network-diagram__node--a">REQUIREMENT</div>
            <div className="mx-network-diagram__node mx-network-diagram__node--b">CAPABILITY ROUTE</div>
            <div className="mx-network-diagram__node mx-network-diagram__node--c">INSPECTION</div>
            <div className="mx-network-diagram__node mx-network-diagram__node--d">EVIDENCE</div>
            <svg className="mx-network-diagram__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="50" x2="18" y2="20" />
              <line x1="50" y1="50" x2="82" y2="20" />
              <line x1="50" y1="50" x2="18" y2="80" />
              <line x1="50" y1="50" x2="82" y2="80" />
            </svg>
          </div>
          <div className="mx-chapter__statement">
            <MonoLabel className="mx-mono-label--on-console">THE MANUFACTURING NETWORK</MonoLabel>
            <h2>An intelligent network, not a directory.</h2>
            <p>
              Requirements are routed to qualified partners by demonstrated and declared
              capability — machining, sheet metal, finishing, and assembly — with engineering
              review and inspection coordination held in one place, not scattered across
              disconnected vendor relationships.
            </p>
            <TextLink href="/company/manufacturing-network">See how routing works</TextLink>
          </div>
        </div>
      </Reveal>

      {/* Chapter 5 — Evidence & quality. Paper register, a short ledger
          excerpt (this composition belongs to /quality; this is a preview,
          not a restatement of the same layout). */}
      <Reveal className="mx-chapter mx-chapter--paper">
        <div className="mx-chapter__inner">
          <div className="mx-chapter__head mx-chapter__head--row">
            <div>
              <MonoLabel>EVIDENCE &amp; ACCOUNTABILITY</MonoLabel>
              <h2>Trust is a discipline, not a claim.</h2>
            </div>
            <TextLink href="/quality">Open the quality system</TextLink>
          </div>
          <div className="mx-evidence-row">
            {evidenceCheckpoints.map((item) => (
              <div key={item.index} className="mx-evidence-row__item">
                <IndexMark value={item.index} />
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Chapter 6 — Closing console. RFQ conversion, structurally distinct
          from the opening: an asymmetric statement + a 3-line "what
          happens next" mini index, not a repeated status line. */}
      <Reveal className="mx-chapter mx-chapter--console mx-chapter--close">
        <div className="mx-chapter__inner mx-chapter__inner--close">
          <div>
            <MonoLabel className="mx-mono-label--on-console">START WITH THE FILES</MonoLabel>
            <h2 className="mx-home__closing-statement">Bring the part you cannot afford to get wrong.</h2>
            <Button href="/rfq" size="lg">
              Upload CAD / Request a review <ArrowRight size={16} />
            </Button>
          </div>
          <ol className="mx-mini-index">
            <li><Check size={14} /> Files are used for review and route planning</li>
            <li><Check size={14} /> Missing requirements are surfaced, not assumed</li>
            <li><Check size={14} /> Inspection is scoped to the released drawing</li>
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
