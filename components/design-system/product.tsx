import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, FileText, Shield } from "@/components/design-system/icons";
import { Annotation, Breadcrumbs, Button, SectionHeading, StatusTag, TechnicalPanel, cx } from "@/components/design-system/primitives";
import type { FactProvenance } from "@/lib/frontend/types";

export interface TechnicalHeroProps {
  breadcrumbs: Array<{ label: string; href?: string }>;
  eyebrow: string;
  title: string;
  summary: string;
  meta: Array<{ label: string; value: string }>;
  visualLabel: string;
  visualCode: string;
  specificationHref?: string;
}

export function TechnicalHero({ breadcrumbs, eyebrow, title, summary, meta, visualLabel, visualCode, specificationHref }: TechnicalHeroProps) {
  return <div className="technical-hero"><Breadcrumbs items={breadcrumbs} /><div className="technical-hero__grid"><div className="technical-hero__copy"><p className="ds-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="technical-hero__summary">{summary}</p><div className="technical-hero__meta">{meta.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div><div className="technical-hero__actions"><Button href="/rfq" size="lg">Upload CAD / Request quote <ArrowUpRight size={16} /></Button>{specificationHref && <Link href={specificationHref} className="text-link">Review technical data</Link>}</div></div><div className="technical-figure" aria-label={visualLabel}><div className="technical-figure__grid" /><div className="technical-figure__object"><span>{visualCode}</span><div className="figure-ring figure-ring--one" /><div className="figure-ring figure-ring--two" /><div className="figure-core" /></div><div className="technical-figure__caption"><span>FIG. 01</span><span>{visualLabel}</span></div></div></div></div>;
}

export function CapabilityStrip({ items }: { items: Array<{ label: string; value: string; note?: string }> }) {
  return <div className="capability-strip">{items.map((item) => <div key={item.label} className="capability-strip__item"><span>{item.label}</span><strong>{item.value}</strong>{item.note && <small>{item.note}</small>}</div>)}</div>;
}

export function EngineeringSpecGrid({ items }: { items: Array<{ label: string; value: string; annotation?: string; provenance?: FactProvenance }> }) {
  return <div className="spec-grid">{items.map((item) => <div key={item.label} className="spec-grid__item"><span>{item.label}</span><strong>{item.value}</strong>{item.annotation && <small>{item.annotation}</small>}{item.provenance && <small className="provenance-meta" title={item.provenance.evidence}>{item.provenance.source} · {item.provenance.lastVerified}</small>}</div>)}</div>;
}

export function TechnicalSpecTable({ rows }: { rows: Array<{ label: string; value: string; status?: string; provenance?: FactProvenance }> }) {
  return <div className="spec-table-wrap"><table className="spec-table"><tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}{row.provenance && <small className="provenance-meta" title={row.provenance.evidence}>{row.provenance.source} · {row.provenance.confidence} · {row.provenance.lastVerified}</small>}</td><td>{row.status && <StatusTag tone={row.status === "verified" ? "green" : "blue"}>{row.status}</StatusTag>}</td></tr>)}</tbody></table></div>;
}

export function CriticalFeatureList({ features }: { features: Array<{ index: string; title: string; detail: string; provenance?: FactProvenance }> }) {
  return <div className="annotation-list">{features.map((feature) => <Annotation key={feature.index} index={feature.index} title={feature.title}>{feature.detail}{feature.provenance && <small className="provenance-meta" title={feature.provenance.evidence}>{feature.provenance.source} · {feature.provenance.lastVerified}</small>}</Annotation>)}</div>;
}

export function ProcessRoute({ steps }: { steps: Array<{ step: string; title: string; detail: string; provenance?: FactProvenance }> }) {
  return <div className="process-route">{steps.map((step, index) => <div key={step.step} className="process-step"><span>{step.step}</span><div><strong>{step.title}</strong><p>{step.detail}</p>{step.provenance && <small className="provenance-meta" title={step.provenance.evidence}>{step.provenance.source} · {step.provenance.lastVerified}</small>}</div>{index < steps.length - 1 && <div className="process-step__line" aria-hidden="true" />}</div>)}</div>;
}

export function InspectionMatrix({ rows }: { rows: Array<{ check: string; method: string; evidence: string; provenance?: FactProvenance }> }) {
  return <TechnicalPanel label="QUALITY / INSPECTION"><div className="inspection-intro"><Shield size={22} /><div><h3>Inspection plan is scoped to the drawing</h3><p>Final acceptance criteria are confirmed against the released revision and customer requirements.</p></div></div><TechnicalSpecTable rows={rows.map((row) => ({ label: row.check, value: `${row.method} · ${row.evidence}`, status: "verified", provenance: row.provenance }))} /></TechnicalPanel>;
}

export function FileRequirements({ formats = ["STEP", "STP", "IGES", "X_T", "PDF", "BOM"] }: { formats?: string[] }) {
  return <TechnicalPanel className="file-requirements" label="RFQ INTAKE"><div className="file-requirements__icon"><FileText size={24} /></div><div><h3>Start with the engineering files</h3><p>Upload the latest revision and we will flag missing information before routing the quote.</p><div className="format-list">{formats.map((format) => <span key={format}>{format}</span>)}</div></div><Button href="/rfq" variant="secondary">Open RFQ intake <ArrowUpRight size={15} /></Button></TechnicalPanel>;
}

export function RelatedEntityGrid({ title, items }: { title: string; items: Array<{ label: string; type: string; href?: string; detail: string; provenance?: FactProvenance }> }) {
  return <div><SectionHeading title={title} /><div className="entity-grid">{items.map((item) => <Link key={item.label} href={item.href ?? "#"} className="entity-card"><span>{item.type}</span><strong>{item.label}</strong><p>{item.detail}</p>{item.provenance && <small className="provenance-meta" title={item.provenance.evidence}>{item.provenance.source} · {item.provenance.lastVerified}</small>}<ArrowUpRight size={15} /></Link>)}</div></div>;
}

export function StickyRFQRail() {
  return <aside className="sticky-rfq"><span className="ds-eyebrow">NEXT ACTION</span><h3>Have a drawing?</h3><p>Send the current revision and receive a manufacturing route with the quote.</p><Button href="/rfq">Upload CAD / Request quote</Button><small><Check size={13} /> Files stay private during review</small></aside>;
}

export function TechnicalSection({ id, eyebrow, title, children, className }: { id?: string; eyebrow?: string; title: string; children: ReactNode; className?: string }) {
  return <section id={id} className={cx("public-section", className)}><SectionHeading eyebrow={eyebrow} title={title} />{children}</section>;
}
