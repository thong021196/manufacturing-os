import type { ContentBlock, Provenance } from "@/lib/content/types";
import { allGuidePages } from "@/lib/content/repository/guides";

const launchCopy: Provenance = {
  source: "structured_fixture",
  confidence: "medium",
  lastVerified: "2026-09-20",
  evidenceId: "ev-launch-copy-2026-09",
};

const processGeneral: Provenance = {
  source: "documentation_verified",
  confidence: "medium",
  lastVerified: "2026-09-20",
  evidenceId: "ev-5-axis-process-general",
};

const businessModel: Provenance = {
  source: "manual_entry",
  confidence: "verified",
  lastVerified: "2026-09-20",
  evidenceId: "ev-business-model-issue-25",
};

/** Shared, reusable blocks — authored once, referenced from multiple
 * entities/pages. This is the concrete instance of architecture-decision.md
 * §5's "edit once, every referencing page picks it up" reuse pattern. */
export const sharedBlocks: ContentBlock[] = [
  {
    id: "cb-file-requirements-standard",
    kind: "knowledge",
    blockType: "fileRequirements",
    data: { formats: ["STEP", "STP", "IGES", "X_T", "PDF", "ZIP", "XLSX (BOM)"] },
    provenance: launchCopy,
    appliesTo: [
      { kind: "part", id: "part-robot-joint-housing" },
      { kind: "application", id: "application-humanoid-robots" },
      { kind: "processCapability", id: "capability-5-axis-machining" },
    ],
  },
  {
    id: "cb-cta-bring-requirement",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Bring the current revision",
      body: "We will review the interfaces, identify missing requirements, and propose a manufacturing route.",
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
];

/** part-robot-joint-housing */
export const partBlocks: ContentBlock[] = [
  {
    id: "cb-part-rjh-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "PART / ROBOTICS",
      title: "Robot Joint Housing",
      summary:
        "A drawing-led manufacturing route for compact actuator housings where bearing interfaces, datum control, and inspection evidence determine the outcome.",
      meta: [
        { label: "Family", value: "Actuator housing" },
        { label: "Route", value: "5-axis CNC" },
        { label: "Acceptance", value: "Per drawing" },
      ],
      visualLabel: "Bearing housing / section view",
      visualCode: "RJH-001 / REV B",
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-capstrip",
    kind: "knowledge",
    blockType: "capabilityStrip",
    data: {
      items: [
        { label: "Typical lot", value: "1–500 pcs", note: "Prototype to repeat" },
        { label: "Materials", value: "Al 6061 / 7075", note: "Source required" },
        { label: "Inspection", value: "CMM + visual", note: "Drawing-specific" },
        { label: "File intake", value: "STEP / PDF", note: "Revision-aware" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-specgrid",
    kind: "knowledge",
    blockType: "specGrid",
    data: {
      items: [
        { label: "Primary interface", value: "Bearing bore", annotation: "Critical feature" },
        { label: "Process family", value: "5-axis milling", annotation: "Complex access" },
        { label: "Surface finish", value: "Per drawing", annotation: "Source required" },
        { label: "Traceability", value: "Revisioned", annotation: "Released CAD" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-critical-features",
    kind: "knowledge",
    blockType: "criticalFeatures",
    data: {
      features: [
        { index: "A", title: "Bearing bore", detail: "Verify size, roundness, and coaxial relationship against the released drawing." },
        { index: "B", title: "Reducer interface", detail: "Machine in one controlled setup where access and datum strategy allow." },
        { index: "C", title: "Motor mounting face", detail: "Flatness and hole pattern are reviewed before quote release." },
        { index: "D", title: "Datum plane", detail: "Reference scheme is confirmed from the drawing; no universal tolerance is assumed." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-materials",
    kind: "knowledge",
    blockType: "materials",
    data: {
      rows: [
        { label: "Base material", value: "Aluminium 6061-T6 · source required", status: "drawing-specific" },
        { label: "Alternative", value: "Aluminium 7075-T6 · engineering review", status: "optional" },
        { label: "Finish", value: "Per drawing / customer confirmation", status: "source required" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-route",
    kind: "knowledge",
    blockType: "manufacturingRoute",
    data: {
      steps: [
        { step: "01", title: "Review", detail: "Revision, datums, and critical features." },
        { step: "02", title: "Plan", detail: "Workholding and access strategy." },
        { step: "03", title: "Machine", detail: "Controlled 5-axis material removal." },
        { step: "04", title: "Inspect", detail: "CMM and drawing-specific checks." },
        { step: "05", title: "Release", detail: "Pack evidence with the shipment." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-inspection",
    kind: "knowledge",
    blockType: "inspection",
    data: {
      rows: [
        { check: "Bearing bore", method: "CMM / air gauge", evidence: "Dimensional report" },
        { check: "Mounting face", method: "CMM", evidence: "Flatness record" },
        { check: "Visual / finish", method: "Visual + sample", evidence: "Release photos" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-applications",
    kind: "relational",
    blockType: "applications",
    data: {
      title: "Where this part appears",
      items: [
        { type: "APPLICATION", label: "Humanoid robots", href: "/applications/humanoid-robots", detail: "Actuator and joint architectures." },
        { type: "APPLICATION", label: "Collaborative arms", detail: "Compact repeatable motion assemblies." },
        { type: "SYSTEM", label: "Servo modules", detail: "Bearing and motor alignment stack." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-related",
    kind: "relational",
    blockType: "relatedEntities",
    data: {
      title: "Related capability routes",
      items: [
        { type: "CAPABILITY", label: "5-axis machining", href: "/capabilities/5-axis-machining", detail: "Access complex interfaces in fewer setups." },
        { type: "QUALITY", label: "Inspection planning", href: "/quality", detail: "Make acceptance evidence explicit." },
        { type: "RESOURCE", label: "Drawing readiness guide", href: "/resources", detail: "Prepare the right files before intake." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
  {
    id: "cb-part-rjh-faq",
    kind: "knowledge",
    blockType: "faq",
    data: {
      items: [
        { question: "What tolerance should I specify?", answer: "Use the released drawing. Where a tolerance is not stated, we flag the gap before the quote is finalized." },
        { question: "Can this be prototyped first?", answer: "Yes. The same revisioned route can start with a small lot and carry inspection evidence into production." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "part", id: "part-robot-joint-housing" }],
  },
];

/** application-humanoid-robots */
export const applicationBlocks: ContentBlock[] = [
  {
    id: "cb-app-hr-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "APPLICATION / HUMANOID ROBOTICS",
      title: "Humanoid Robots",
      summary:
        "A system view of actuator housings, shafts, links, enclosures, and gripper parts — connected to the capabilities and inspection evidence behind them.",
      meta: [
        { label: "System focus", value: "Motion hardware" },
        { label: "Part families", value: "6 routes" },
        { label: "RFQ mode", value: "Upload-first" },
      ],
      visualLabel: "Humanoid motion stack",
      visualCode: "APP-HR / SYSTEM VIEW",
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
  {
    id: "cb-app-hr-capstrip",
    kind: "knowledge",
    blockType: "capabilityStrip",
    data: {
      items: [
        { label: "Joint hardware", value: "Housing + shafts" },
        { label: "Structure", value: "Links + brackets" },
        { label: "End effectors", value: "Gripper parts" },
        { label: "Control", value: "Revisioned files" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
  {
    id: "cb-app-hr-components",
    kind: "relational",
    blockType: "applications",
    data: {
      title: "System components",
      items: [
        { type: "PART", label: "Robot joint housing", href: "/parts/robot-joint-housing", detail: "Bearing and reducer interfaces." },
        { type: "PART", label: "Actuator housing", detail: "Compact motor alignment." },
        { type: "PART", label: "Precision shafts", detail: "Coaxial rotating elements." },
        { type: "PART", label: "Structural links", detail: "Lightweight load paths." },
        { type: "PART", label: "Gripper parts", detail: "Contact geometry and repeatability." },
        { type: "CAPABILITY", label: "5-axis machining", href: "/capabilities/5-axis-machining", detail: "Complex access with fewer setups." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
  {
    id: "cb-app-hr-route",
    kind: "knowledge",
    blockType: "manufacturingRoute",
    data: {
      steps: [
        { step: "01", title: "System context", detail: "Map interfaces and load paths." },
        { step: "02", title: "Part intake", detail: "Validate CAD, drawing, and BOM." },
        { step: "03", title: "Route", detail: "Match geometry to process." },
        { step: "04", title: "Evidence", detail: "Plan inspection at the feature level." },
        { step: "05", title: "Scale", detail: "Carry the revision into repeat runs." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
  {
    id: "cb-app-hr-related",
    kind: "relational",
    blockType: "relatedEntities",
    data: {
      title: "Explore the manufacturing layer",
      items: [
        { type: "CAPABILITY", label: "5-axis machining", href: "/capabilities/5-axis-machining", detail: "Use when access and datum control matter." },
        { type: "QUALITY", label: "Quality evidence", href: "/quality", detail: "Make acceptance inspectable." },
        { type: "RFQ", label: "Start an RFQ", href: "/rfq", detail: "Upload the current engineering package." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
  {
    id: "cb-app-hr-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Start from the system you are building",
      body: "Upload one part or the complete hardware package. We will separate the routes and surface the decisions.",
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "application", id: "application-humanoid-robots" }],
  },
];

/** capability-5-axis-machining */
export const capabilityBlocks: ContentBlock[] = [
  {
    id: "cb-cap-5x-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "CAPABILITY / CNC",
      title: "5-Axis Machining",
      summary:
        "Use simultaneous or indexed 5-axis work when geometry, access, or datum control makes multiple 3-axis setups expensive or risky.",
      meta: [
        { label: "Best for", value: "Complex access" },
        { label: "Primary gain", value: "Fewer setups" },
        { label: "Acceptance", value: "Per drawing" },
      ],
      visualLabel: "5-axis tool access diagram",
      visualCode: "CAP-5X / ROUTE GUIDE",
    },
    provenance: processGeneral,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-capstrip",
    kind: "knowledge",
    blockType: "capabilityStrip",
    data: {
      items: [
        { label: "Geometry", value: "Deep / angled", note: "Access matters" },
        { label: "Workholding", value: "Datum-led", note: "Plan early" },
        { label: "Materials", value: "Al / steel", note: "Source required" },
        { label: "Evidence", value: "CMM ready", note: "Feature checks" },
      ],
    },
    provenance: processGeneral,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-critical-features",
    kind: "knowledge",
    blockType: "criticalFeatures",
    data: {
      features: [
        { index: "01", title: "Complex tool access", detail: "Reach angled walls, deep pockets, and compound surfaces without stacking avoidable setups." },
        { index: "02", title: "Datum continuity", detail: "Carry a controlled reference scheme through machining and inspection." },
        { index: "03", title: "Workholding", detail: "Confirm where the part can be held without masking critical features." },
        { index: "04", title: "Inspection", detail: "Define how the feature will be proven before a route is quoted." },
      ],
    },
    provenance: processGeneral,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-materials",
    kind: "knowledge",
    blockType: "materials",
    data: {
      rows: [
        { label: "Aluminium", value: "6061-T6 / 7075-T6", status: "common" },
        { label: "Steel", value: "Source required", status: "drawing-specific" },
        { label: "Finish", value: "Anodize / coating per drawing", status: "source required" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-route",
    kind: "knowledge",
    blockType: "manufacturingRoute",
    data: {
      steps: [
        { step: "01", title: "Geometry review", detail: "Identify access and datum risks." },
        { step: "02", title: "Workholding", detail: "Choose a stable reference strategy." },
        { step: "03", title: "Simulation", detail: "Check reach and collision risk." },
        { step: "04", title: "Machine", detail: "Run the controlled route." },
        { step: "05", title: "Inspect", detail: "Prove critical features." },
      ],
    },
    provenance: processGeneral,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-part-families",
    kind: "relational",
    blockType: "applications",
    data: {
      title: "Common part families",
      items: [
        { type: "PART", label: "Robot joint housing", href: "/parts/robot-joint-housing", detail: "Bearing and reducer interfaces." },
        { type: "PART", label: "Manifolds", detail: "Angled ports and internal channels." },
        { type: "PART", label: "Structural brackets", detail: "Lightweight webs and compound faces." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
  {
    id: "cb-cap-5x-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Let the geometry choose the route",
      body: "Send the CAD and drawing. We will explain where 5-axis is useful and where a simpler route is safer.",
    },
    provenance: launchCopy,
    appliesTo: [{ kind: "processCapability", id: "capability-5-axis-machining" }],
  },
];

/** Editorial pages: quality, resources (RFQ intake guide), engineering
 * (drawing readiness), how-it-works. Not owned by a single Part/
 * Application/ProcessCapability entity, so these are referenced directly
 * from PageRegistryEntry.contentBlockIds rather than an entity's
 * contentBlockIds. */
export const editorialBlocks: ContentBlock[] = [
  // Quality
  {
    id: "cb-quality-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "QUALITY / TRACEABILITY",
      title: "Quality Evidence",
      summary: "Quality is a handoff system: the released revision, inspection method, result, and evidence travel with the part.",
      meta: [
        { label: "Reference", value: "Released revision" },
        { label: "Method", value: "Feature-level" },
        { label: "Record", value: "Traceable" },
      ],
      visualLabel: "Inspection evidence map",
      visualCode: "QLT-001 / EVIDENCE",
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-quality-inspection",
    kind: "knowledge",
    blockType: "inspection",
    data: {
      rows: [
        { check: "Revision", method: "Document control", evidence: "Released file ID" },
        { check: "Critical dimensions", method: "CMM / gauge", evidence: "Measurement report" },
        { check: "Finish / visual", method: "Visual record", evidence: "Release photos" },
        { check: "Shipment", method: "Traveler review", evidence: "Signed handoff" },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-quality-critical-features",
    kind: "knowledge",
    blockType: "criticalFeatures",
    data: {
      features: [
        { index: "A", title: "Source", detail: "Every requirement points back to a drawing, specification, or approved decision." },
        { index: "B", title: "Confidence", detail: "Declared capability is kept separate from evidence observed in production." },
        { index: "C", title: "Revision", detail: "A new release creates a new inspection context; old records remain intact." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-quality-related",
    kind: "relational",
    blockType: "relatedEntities",
    data: {
      title: "Continue through the system",
      items: [
        { type: "PART", label: "Robot joint housing", href: "/parts/robot-joint-housing", detail: "See a feature-level route." },
        { type: "RFQ", label: "RFQ intake", href: "/rfq", detail: "Attach the acceptance plan early." },
        { type: "RESOURCE", label: "Intake guide", href: "/resources", detail: "Prepare the evidence trail." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-quality-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Make acceptance explicit",
      body: "Bring the drawing and we will turn the critical requirements into a route and inspection plan.",
    },
    provenance: launchCopy,
    appliesTo: [],
  },

  // Resources (RFQ intake guide)
  {
    id: "cb-resources-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "RESOURCE / PROCUREMENT",
      title: "RFQ Intake Guide",
      summary: "The fastest way to get a useful quote is to make the engineering decision trail visible from the start.",
      meta: [
        { label: "Start with", value: "Released files" },
        { label: "Add", value: "Quantities" },
        { label: "Expect", value: "Clarifying questions" },
      ],
      visualLabel: "RFQ intake sequence",
      visualCode: "RES-001 / INTAKE",
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-resources-route",
    kind: "knowledge",
    blockType: "manufacturingRoute",
    data: {
      steps: [
        { step: "01", title: "Upload", detail: "CAD, drawing, and BOM." },
        { step: "02", title: "Describe", detail: "Use case and timing." },
        { step: "03", title: "Clarify", detail: "Resolve open requirements." },
        { step: "04", title: "Route", detail: "Select process and supplier." },
        { step: "05", title: "Review", detail: "Compare quote and evidence." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-resources-related",
    kind: "relational",
    blockType: "relatedEntities",
    data: {
      title: "Useful next steps",
      items: [
        { type: "ENGINEERING", label: "Drawing readiness", href: "/engineering", detail: "Prepare the engineering package." },
        { type: "CAPABILITY", label: "5-axis machining", href: "/capabilities/5-axis-machining", detail: "Understand process fit." },
        { type: "RFQ", label: "Open RFQ intake", href: "/rfq", detail: "Start with your files." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-resources-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Start with the package you have",
      body: "We can separate known requirements from the decisions that still need an owner.",
    },
    provenance: launchCopy,
    appliesTo: [],
  },

  // Engineering / drawing readiness
  {
    id: "cb-engineering-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "ENGINEERING GUIDE",
      title: "Drawing Readiness",
      summary: "A quote is only as clear as the current revision, critical features, and acceptance criteria attached to it.",
      meta: [
        { label: "Input", value: "CAD + drawing" },
        { label: "Focus", value: "Revision control" },
        { label: "Output", value: "Route-ready RFQ" },
      ],
      visualLabel: "Drawing annotation system",
      visualCode: "ENG-001 / CHECKLIST",
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-engineering-critical-features",
    kind: "knowledge",
    blockType: "criticalFeatures",
    data: {
      features: [
        { index: "01", title: "Current revision", detail: "Name the released revision and keep superseded files out of the package." },
        { index: "02", title: "Critical features", detail: "Mark interfaces, datums, and any acceptance-critical dimensions." },
        { index: "03", title: "Material and finish", detail: "State the intended material and surface treatment or flag it as open." },
        { index: "04", title: "Quantity and timing", detail: "Separate prototype, pilot, and repeat production intent." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-engineering-faq",
    kind: "knowledge",
    blockType: "faq",
    data: {
      items: [
        { question: "What if the drawing is incomplete?", answer: "Submit it anyway. The intake should surface missing information before a supplier route is selected." },
        { question: "Should I upload a BOM?", answer: "Yes when the package contains multiple parts or a production assembly." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-engineering-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Make the unknowns visible",
      body: "A fast review is more useful than a fast assumption. Send the package and we will return the questions.",
    },
    provenance: launchCopy,
    appliesTo: [],
  },

  // How it works
  {
    id: "cb-how-it-works-hero",
    kind: "knowledge",
    blockType: "hero",
    data: {
      eyebrow: "HOW IT WORKS",
      title: "One requirement, one accountable interface, one delivered part.",
      summary:
        "Manufacturing OS is not a marketplace and not a catalog reseller. A customer submits a CAD file, drawing, BOM, or an unsolved requirement; we normalize it into a structured manufacturing requirement, route it into a qualified China manufacturing network, obtain and compare quotes, coordinate production and QC, and deliver through one accountable interface.",
      meta: [
        { label: "Customers", value: "US / AU" },
        { label: "Network", value: "China manufacturing" },
        { label: "Model", value: "Not a marketplace" },
      ],
      visualLabel: "Requirement → route → production → delivery",
      visualCode: "HIW-001 / PROCESS",
    },
    provenance: businessModel,
    appliesTo: [],
  },
  {
    id: "cb-how-it-works-route",
    kind: "knowledge",
    blockType: "manufacturingRoute",
    data: {
      steps: [
        { step: "01", title: "Submit", detail: "Upload CAD, drawing, BOM, or describe the requirement if files aren't ready yet." },
        { step: "02", title: "Normalize", detail: "We turn the submission into a structured manufacturing requirement — geometry, material, quantity, tolerance, timing, and acceptance criteria made explicit." },
        { step: "03", title: "Route", detail: "The requirement is routed to qualified capability inside our China manufacturing network, matched on declared and observed capability, not the first available quote." },
        { step: "04", title: "Quote", detail: "We obtain and compare supplier quotes and return one clear, reviewed quote — not a raw pass-through." },
        { step: "05", title: "Produce & inspect", detail: "Production is coordinated against the released revision, with inspection scoped to the features that actually control the outcome." },
        { step: "06", title: "Deliver", detail: "Parts ship through one accountable interface, with the inspection evidence and traceability record attached." },
      ],
    },
    provenance: businessModel,
    appliesTo: [],
  },
  {
    id: "cb-how-it-works-critical-features",
    kind: "knowledge",
    blockType: "criticalFeatures",
    data: {
      features: [
        { index: "A", title: "Not a marketplace", detail: "You do not pick a supplier off a list and negotiate alone. We route, quote, and stay accountable through delivery." },
        { index: "B", title: "Not a catalog reseller", detail: "Every job starts from your actual CAD/drawing/BOM or requirement, not a fixed part catalog." },
        { index: "C", title: "One interface", detail: "Engineering review, sourcing, production coordination, and QC are handled through a single point of contact." },
        { index: "D", title: "Private by default", detail: "Your CAD and customer files are never publicly indexed or exposed; they are used only for review and production." },
      ],
    },
    provenance: businessModel,
    appliesTo: [],
  },
  {
    id: "cb-how-it-works-related",
    kind: "relational",
    blockType: "relatedEntities",
    data: {
      title: "See it in the system",
      items: [
        { type: "PART", label: "Robot joint housing", href: "/parts/robot-joint-housing", detail: "A worked example of a routed, inspected part." },
        { type: "COMPANY", label: "Manufacturing network", href: "/company/manufacturing-network", detail: "How capability is qualified and routed." },
        { type: "QUALITY", label: "Quality evidence", href: "/quality", detail: "What travels with a delivered part." },
      ],
    },
    provenance: launchCopy,
    appliesTo: [],
  },
  {
    id: "cb-how-it-works-cta",
    kind: "knowledge",
    blockType: "cta",
    data: {
      title: "Start with what you have",
      body: "CAD, a drawing, a BOM, or just a description of the requirement — the intake works from any of them.",
    },
    provenance: launchCopy,
    appliesTo: [],
  },
];

export const allContentBlocks: ContentBlock[] = [
  ...sharedBlocks,
  ...partBlocks,
  ...applicationBlocks,
  ...capabilityBlocks,
  ...editorialBlocks,
  ...allGuidePages().flatMap((g) => g.blocks),
];

export function getContentBlock(id: string): ContentBlock | undefined {
  return allContentBlocks.find((b) => b.id === id);
}
