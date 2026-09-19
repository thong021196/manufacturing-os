import type {
  CapabilityLayer,
  ConfidenceLevel,
  DemandStage,
  SourceType,
} from "@/lib/types";
import { Tag, type TagTone } from "@/components/ui/tag";

const confidenceTone: Record<ConfidenceLevel, TagTone> = {
  low: "warning",
  medium: "info",
  high: "accent",
  verified: "success",
};

const confidenceLabel: Record<ConfidenceLevel, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
  verified: "Verified",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return <Tag tone={confidenceTone[level]}>{confidenceLabel[level]}</Tag>;
}

const sourceLabel: Record<SourceType, string> = {
  ai_inferred: "AI inferred",
  supplier_marketing: "Supplier marketing",
  documentation_verified: "Documentation verified",
  quote_derived: "Quote derived",
  production_proven: "Production proven",
  manual_entry: "Manual entry",
};

const sourceTone: Record<SourceType, TagTone> = {
  ai_inferred: "neutral",
  supplier_marketing: "warning",
  documentation_verified: "info",
  quote_derived: "accent",
  production_proven: "success",
  manual_entry: "neutral",
};

export function SourceBadge({ source, title }: { source: SourceType; title?: string }) {
  return (
    <Tag tone={sourceTone[source]} title={title}>
      {sourceLabel[source]}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.replace(/_/g, " ");
  const tone: TagTone = /won|complete|delivered|pass|accepted|qualified|verified|closed_won/.test(status)
    ? "success"
    : /lost|fail|cancelled|declined|rejected/.test(status)
      ? "danger"
      : /active|open|quoting|in_progress|in_production|rfq_active/.test(status)
        ? "accent"
        : "neutral";
  return <Tag tone={tone}>{normalized}</Tag>;
}

const capabilityLayerLabel: Record<CapabilityLayer, string> = {
  declared: "Declared capability",
  observed: "Observed capability",
};

const capabilityLayerTone: Record<CapabilityLayer, TagTone> = {
  declared: "warning",
  observed: "success",
};

export function CapabilityLayerBadge({ layer }: { layer: CapabilityLayer }) {
  return <Tag tone={capabilityLayerTone[layer]}>{capabilityLayerLabel[layer]}</Tag>;
}

const demandStageLabel: Record<DemandStage, string> = {
  search: "Search demand",
  visitor: "Visitor demand",
  cad_rfq: "CAD / RFQ demand",
  quote: "Quote demand",
  paid: "Paid demand",
  repeat: "Repeat demand",
};

const demandStageTone: Record<DemandStage, TagTone> = {
  search: "neutral",
  visitor: "info",
  cad_rfq: "accent",
  quote: "warning",
  paid: "success",
  repeat: "navy",
};

export function DemandStageBadge({ stage }: { stage: DemandStage }) {
  return <Tag tone={demandStageTone[stage]}>{demandStageLabel[stage]}</Tag>;
}
