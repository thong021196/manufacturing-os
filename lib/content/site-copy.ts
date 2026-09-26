// Structured copy for bespoke chapter-composition pages (home, company)
// that are not built from the generic FrontendPageModel/ContentBlock
// pipeline (see lib/content/compose.ts) because their layout is a one-off
// composition, not a reusable page template. Per issue #25 ("do not
// scatter long content blocks through JSX"), the copy for these still
// lives in a plain data module, not inline in the component, even though
// it isn't (yet) modeled as full ContentBlock/Evidence entities. Promote
// any of these into lib/content/repository/content-blocks.ts if/when they
// need to be reused across more than one page.

export const homeRequirementSequence = [
  { index: "01", title: "Understand", detail: "CAD, drawing, BOM, or an unsolved problem is structured into an explicit manufacturing requirement — interfaces, datums, and acceptance criteria made explicit, not assumed." },
  { index: "02", title: "Route", detail: "Geometry, material, quantity, and timeline are matched to a manufacturing route and a qualified partner in the network — not the first available quote." },
  { index: "03", title: "Produce & inspect", detail: "Production is coordinated against the released revision, with inspection scoped to the features that actually control the outcome." },
  { index: "04", title: "Deliver with evidence", detail: "The part ships with the record that proves it — measurement results, release evidence, and a revision history that survives the next order." },
];

export const homeSystemRows = [
  { code: "PARTS", label: "Technical objects", detail: "Drawing-led routes for the interfaces that make hardware work — start from a real part, not a category page.", href: "/parts/robot-joint-housing", example: "Robot joint housing" },
  { code: "CAPABILITIES", label: "Manufacturing competence", detail: "Process guidance grounded in geometry, workholding, and inspection — a recommendation, not a keyword page.", href: "/capabilities/5-axis-machining", example: "5-axis machining" },
  { code: "APPLICATIONS", label: "System context", detail: "The part families and processes behind a complete product — how the pieces of a system connect.", href: "/applications/humanoid-robots", example: "Humanoid robots" },
];

export const homeEvidenceCheckpoints = [
  { index: "A", title: "Source", detail: "Every technical fact carries a source, a confidence level, and the date it was last verified." },
  { index: "B", title: "Revision", detail: "CAD and drawings are never overwritten — a new release creates a new, traceable inspection context." },
  { index: "C", title: "Observed vs. declared", detail: "Supplier capability is tracked at two layers: what a partner declares, and what production has actually proven." },
];

export const companyPillars = [
  { index: "01", title: "One accountable interface", body: "A single point of engineering, commercial, and quality ownership from CAD intake through delivery — not a directory of disconnected vendors." },
  { index: "02", title: "Engineering review, not guesswork", body: "Every package is reviewed for manufacturability before it is routed, so questions surface as decisions rather than as production risk." },
  { index: "03", title: "Manufacturing network depth", body: "A coordinated network of qualified partners across machining, sheet metal, finishing, and assembly, routed by demonstrated and declared capability." },
  { index: "04", title: "Quality coordinated, not assumed", body: "Inspection plans, evidence, and release records are carried with the part, so acceptance is explicit at every handoff." },
];

export const companyRoute = [
  { step: "01", title: "Requirement", detail: "Custom hardware need, CAD, drawing, or BOM" },
  { step: "02", title: "Engineering review", detail: "Manufacturability and requirement normalization" },
  { step: "03", title: "Network routing", detail: "Qualified manufacturing capability" },
  { step: "04", title: "Production & QC", detail: "Coordinated build with inspection evidence" },
  { step: "05", title: "Delivery", detail: "One accountable interface, start to finish" },
];
