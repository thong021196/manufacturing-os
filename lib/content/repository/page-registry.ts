import type { PageRegistryEntry } from "@/lib/content/types";

// Page Registry — one record per public URL (page-registry.md). A relation
// existing in the entity graph implies nothing about a URL existing; the
// renderer (lib/content/adapter.ts) only resolves a page for a path that
// has a `published` record here. This is the explicit publish gate the
// entity-publishing architecture calls for.

const SITE = "Manufacturing OS";

export const pageRegistry: PageRegistryEntry[] = [
  {
    path: "/",
    pageKind: "home",
    title: "Manufacturing OS",
    description:
      "The operating layer for custom hardware production — CAD to structured requirement, routed manufacturing, production, and evidence.",
    breadcrumbs: [],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `${SITE} | Manufacturing execution interface for custom hardware`,
      description:
        "Manufacturing OS normalizes CAD/drawing/BOM requirements, routes them into a qualified manufacturing network, and coordinates production, QC, and delivery through one accountable interface.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/parts/robot-joint-housing",
    entity: { kind: "part", id: "part-robot-joint-housing" },
    pageKind: "part",
    title: "Robot Joint Housing",
    description: "Drawing-led manufacturing for compact robotic actuator housings.",
    breadcrumbs: [{ label: "Parts", href: "/parts/robot-joint-housing" }, { label: "Robot joint housing" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Robot Joint Housing | ${SITE}`,
      description: "A technical manufacturing route for robot joint housings — bearing interfaces, datum control, and inspection evidence.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/applications/humanoid-robots",
    entity: { kind: "application", id: "application-humanoid-robots" },
    pageKind: "application",
    title: "Humanoid Robots",
    description: "A system view of the parts and processes that make humanoid motion systems manufacturable.",
    breadcrumbs: [{ label: "Applications", href: "/applications/humanoid-robots" }, { label: "Humanoid robots" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Humanoid Robots | ${SITE}`,
      description: "Manufacturing routes for humanoid robot hardware — actuator housings, shafts, links, and end effectors.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/capabilities/5-axis-machining",
    entity: { kind: "processCapability", id: "capability-5-axis-machining" },
    pageKind: "capability",
    title: "5-Axis Machining",
    description: "A practical guide to choosing 5-axis machining for complex, datum-sensitive geometry.",
    breadcrumbs: [{ label: "Capabilities", href: "/capabilities/5-axis-machining" }, { label: "5-axis machining" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `5-Axis Machining | ${SITE}`,
      description: "When and why 5-axis machining is useful for production hardware — access, workholding, and inspection.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/quality",
    contentBlockIds: [
      "cb-quality-hero",
      "cb-quality-inspection",
      "cb-quality-critical-features",
      "cb-quality-related",
      "cb-quality-cta",
    ],
    pageKind: "quality",
    title: "Quality Evidence",
    description: "A clear acceptance trail from drawing feature to inspection record.",
    breadcrumbs: [{ label: "Quality", href: "/quality" }, { label: "Quality evidence" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Quality Evidence | ${SITE}`,
      description: "How Manufacturing OS makes inspection, traceability, and acceptance evidence concrete.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/how-it-works",
    contentBlockIds: [
      "cb-how-it-works-hero",
      "cb-how-it-works-route",
      "cb-how-it-works-critical-features",
      "cb-how-it-works-related",
      "cb-how-it-works-cta",
    ],
    pageKind: "howItWorks",
    title: "How It Works",
    description: "How a CAD file, drawing, BOM, or requirement becomes a routed, inspected, delivered part.",
    breadcrumbs: [{ label: "How it works", href: "/how-it-works" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `How It Works | ${SITE}`,
      description: "Submit, normalize, route, quote, produce, inspect, deliver — the Manufacturing OS process end to end.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/resources",
    contentBlockIds: [
      "cb-resources-hero",
      "cb-resources-route",
      "cb-file-requirements-standard",
      "cb-resources-related",
      "cb-resources-cta",
    ],
    pageKind: "resources",
    title: "RFQ Intake Guide",
    description: "What to include when you want a manufacturing route you can actually inspect.",
    breadcrumbs: [{ label: "Resources", href: "/resources" }, { label: "RFQ intake guide" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `RFQ Intake Guide | ${SITE}`,
      description: "A practical guide to submitting a complete manufacturing RFQ.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/engineering",
    contentBlockIds: [
      "cb-engineering-hero",
      "cb-engineering-critical-features",
      "cb-file-requirements-standard",
      "cb-engineering-faq",
      "cb-engineering-cta",
    ],
    pageKind: "resourceArticle",
    title: "Drawing Readiness",
    description: "A compact engineering guide to preparing files for a clean manufacturing review.",
    breadcrumbs: [{ label: "Engineering", href: "/engineering" }, { label: "Drawing readiness" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Drawing Readiness | ${SITE}`,
      description: "Prepare CAD, drawings, revisions, and BOM data for manufacturing review.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/rfq",
    pageKind: "rfq",
    title: "Request a Quote",
    description: "Upload an engineering package for a drawing-led manufacturing review.",
    breadcrumbs: [{ label: "RFQ", href: "/rfq" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Request a Quote | ${SITE}`,
      description: "Upload CAD, a drawing, or a BOM to start a manufacturing RFQ review.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/company",
    pageKind: "company",
    title: "Company",
    description: "Manufacturing OS is one accountable interface between hardware teams and a qualified manufacturing network.",
    breadcrumbs: [{ label: "Company", href: "/company" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Company | ${SITE}`,
      description: "Manufacturing OS is one accountable interface between hardware teams and a qualified manufacturing network.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/company/manufacturing-network",
    pageKind: "manufacturingNetwork",
    title: "Manufacturing Network",
    description: "How Manufacturing OS routes engineering requirements through a qualified manufacturing network with inspection and evidence.",
    breadcrumbs: [{ label: "Company", href: "/company" }, { label: "Manufacturing network" }],
    publishStatus: "published",
    indexPolicy: "index",
    seo: {
      title: `Manufacturing Network | ${SITE}`,
      description: "How Manufacturing OS routes engineering requirements through a qualified manufacturing network with inspection and evidence.",
    },
    updatedAt: "2026-09-20",
  },
  {
    path: "/company/legal/privacy",
    pageKind: "company",
    title: "Privacy Policy",
    description: "Manufacturing OS privacy policy — pending formal legal review.",
    breadcrumbs: [{ label: "Company", href: "/company" }, { label: "Privacy" }],
    publishStatus: "published",
    // Placeholder legal copy pending counsel review — kept out of the
    // sitemap/index so it doesn't rank as if it were final legal text.
    indexPolicy: "noindex",
    seo: { title: `Privacy Policy | ${SITE}`, description: "Manufacturing OS privacy policy." },
    updatedAt: "2026-09-20",
  },
  {
    path: "/company/legal/terms",
    pageKind: "company",
    title: "Terms of Service",
    description: "Manufacturing OS terms of service — pending formal legal review.",
    breadcrumbs: [{ label: "Company", href: "/company" }, { label: "Terms" }],
    publishStatus: "published",
    indexPolicy: "noindex",
    seo: { title: `Terms of Service | ${SITE}`, description: "Manufacturing OS terms of service." },
    updatedAt: "2026-09-20",
  },
];

export function getPageRegistryEntry(path: string): PageRegistryEntry | undefined {
  return pageRegistry.find((entry) => entry.path === path);
}

/** Every published, indexable path — the basis for app/sitemap.ts. */
export function getIndexablePaths(): PageRegistryEntry[] {
  return pageRegistry.filter((e) => e.publishStatus === "published" && e.indexPolicy === "index");
}
