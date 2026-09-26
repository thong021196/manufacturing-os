import type { Application, Part, ProcessCapability } from "@/lib/content/types";

const publishedNow: Part["provenance"] = {
  source: "structured_fixture",
  confidence: "medium",
  lastVerified: "2026-09-20",
  evidenceId: "ev-launch-copy-2026-09",
};

export const parts: Part[] = [
  {
    kind: "part",
    id: "part-robot-joint-housing",
    slug: "robot-joint-housing",
    name: "Robot Joint Housing",
    summary: "Drawing-led manufacturing for compact robotic actuator housings.",
    status: "published",
    provenance: publishedNow,
    family: "Actuator housing",
    applicationIds: ["application-humanoid-robots"],
    processCapabilityIds: ["capability-5-axis-machining"],
    materialIds: [],
    contentBlockIds: [
      "cb-part-rjh-hero",
      "cb-part-rjh-capstrip",
      "cb-part-rjh-specgrid",
      "cb-part-rjh-critical-features",
      "cb-part-rjh-materials",
      "cb-part-rjh-route",
      "cb-part-rjh-inspection",
      "cb-part-rjh-applications",
      "cb-part-rjh-related",
      "cb-file-requirements-standard",
      "cb-part-rjh-faq",
      "cb-cta-bring-requirement",
    ],
  },
];

export const applications: Application[] = [
  {
    kind: "application",
    id: "application-humanoid-robots",
    slug: "humanoid-robots",
    name: "Humanoid Robots",
    summary: "A coordinated view of the parts and processes that make humanoid motion systems manufacturable.",
    status: "published",
    provenance: publishedNow,
    partIds: ["part-robot-joint-housing"],
    processCapabilityIds: ["capability-5-axis-machining"],
    contentBlockIds: [
      "cb-app-hr-hero",
      "cb-app-hr-capstrip",
      "cb-app-hr-components",
      "cb-app-hr-route",
      "cb-app-hr-related",
      "cb-file-requirements-standard",
      "cb-app-hr-cta",
    ],
  },
];

export const processCapabilities: ProcessCapability[] = [
  {
    kind: "processCapability",
    id: "capability-5-axis-machining",
    slug: "5-axis-machining",
    name: "5-Axis Machining",
    summary: "A practical guide to choosing 5-axis machining for complex, datum-sensitive geometry.",
    status: "published",
    provenance: {
      source: "documentation_verified",
      confidence: "medium",
      lastVerified: "2026-09-20",
      evidenceId: "ev-5-axis-process-general",
    },
    category: "CNC machining",
    partIds: ["part-robot-joint-housing"],
    contentBlockIds: [
      "cb-cap-5x-hero",
      "cb-cap-5x-capstrip",
      "cb-cap-5x-critical-features",
      "cb-cap-5x-materials",
      "cb-cap-5x-route",
      "cb-cap-5x-part-families",
      "cb-file-requirements-standard",
      "cb-cap-5x-cta",
    ],
  },
];

export function getPart(id: string): Part | undefined {
  return parts.find((p) => p.id === id);
}
export function getPartBySlug(slug: string): Part | undefined {
  return parts.find((p) => p.slug === slug);
}
export function getApplication(id: string): Application | undefined {
  return applications.find((a) => a.id === id);
}
export function getProcessCapability(id: string): ProcessCapability | undefined {
  return processCapabilities.find((c) => c.id === id);
}
