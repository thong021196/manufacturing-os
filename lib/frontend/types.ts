export type FrontendBlock =
  | { type: "hero"; eyebrow: string; title: string; summary: string; meta: Array<{ label: string; value: string }>; visualLabel: string; visualCode: string }
  | { type: "capabilityStrip"; items: Array<{ label: string; value: string; note?: string }> }
  | { type: "specGrid"; items: Array<{ label: string; value: string; annotation?: string }> }
  | { type: "criticalFeatures"; features: Array<{ index: string; title: string; detail: string }> }
  | { type: "materials"; rows: Array<{ label: string; value: string; status?: string }> }
  | { type: "manufacturingRoute"; steps: Array<{ step: string; title: string; detail: string }> }
  | { type: "inspection"; rows: Array<{ check: string; method: string; evidence: string }> }
  | { type: "applications"; title: string; items: Array<{ label: string; type: string; href?: string; detail: string }> }
  | { type: "relatedEntities"; title: string; items: Array<{ label: string; type: string; href?: string; detail: string }> }
  | { type: "fileRequirements"; formats?: string[] }
  | { type: "faq"; items: Array<{ question: string; answer: string }> }
  | { type: "cta"; title: string; body: string };

export interface FrontendPageModel {
  kind: "part" | "application" | "capability" | "engineering" | "resource" | "quality";
  slug: string;
  title: string;
  description: string;
  seo: { title: string; description: string };
  breadcrumbs: Array<{ label: string; href?: string }>;
  blocks: FrontendBlock[];
}
