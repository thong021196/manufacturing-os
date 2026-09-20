import { FileRequirements, InspectionMatrix, ProcessRoute, RelatedEntityGrid, TechnicalSpecTable, CriticalFeatureList, EngineeringSpecGrid, CapabilityStrip } from "@/components/design-system/product";
import { TechnicalPanel } from "@/components/design-system/primitives";
import type { FrontendBlock } from "@/lib/frontend/types";

export function BlockRenderer({ blocks }: { blocks: FrontendBlock[] }) {
  return <div className="block-stack">{blocks.map((block, index) => {
    switch (block.type) {
      case "capabilityStrip": return <CapabilityStrip key={index} items={block.items} />;
      case "specGrid": return <section key={index} className="public-section public-section--compact" id="specification"><EngineeringSpecGrid items={block.items} /></section>;
      case "criticalFeatures": return <section key={index} className="public-section"><div className="section-heading"><div><p className="ds-eyebrow">FEATURE ANNOTATION</p><h2>What controls the outcome</h2></div></div><CriticalFeatureList features={block.features} /></section>;
      case "materials": return <section key={index} className="public-section"><div className="section-heading"><div><p className="ds-eyebrow">MATERIAL / FINISH</p><h2>Requirements stay drawing-specific</h2></div></div><TechnicalPanel><TechnicalSpecTable rows={block.rows} /></TechnicalPanel></section>;
      case "manufacturingRoute": return <section key={index} className="public-section"><div className="section-heading"><div><p className="ds-eyebrow">MANUFACTURING ROUTE</p><h2>From released file to inspected part</h2></div></div><ProcessRoute steps={block.steps} /></section>;
      case "inspection": return <section key={index} className="public-section"><InspectionMatrix rows={block.rows} /></section>;
      case "applications": return <section key={index} className="public-section"><RelatedEntityGrid title={block.title} items={block.items} /></section>;
      case "relatedEntities": return <section key={index} className="public-section"><RelatedEntityGrid title={block.title} items={block.items} /></section>;
      case "fileRequirements": return <section key={index} className="public-section"><FileRequirements formats={block.formats} /></section>;
      case "faq": return <section key={index} className="public-section"><div className="section-heading"><div><p className="ds-eyebrow">FAQ</p><h2>Questions before you send the package</h2></div></div><div className="faq-list">{block.items.map((item) => <details key={item.question} className="faq-item"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>;
      case "cta": return <section key={index} className="public-section public-section--cta"><div className="cta-band"><div><p className="ds-eyebrow">READY WHEN YOU ARE</p><h2>{block.title}</h2><p>{block.body}</p></div><a className="ds-button ds-button--primary ds-button--lg" href="/rfq">Upload CAD / Request quote</a></div></section>;
      case "hero": return null;
    }
  })}</div>;
}
