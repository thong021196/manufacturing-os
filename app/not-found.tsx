import { ArrowRight } from "@/components/design-system/icons";
import { Button, MonoLabel, TextLink } from "@/components/design-system/primitives";

export const metadata = {
  title: "Page not found | Manufacturing OS",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-knowledge" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <MonoLabel>404 / NOT FOUND</MonoLabel>
      <h1>This page doesn&apos;t exist.</h1>
      <p className="mx-knowledge__lede">
        The route you followed isn&apos;t part of Manufacturing OS, or it may have moved. Start from the
        homepage, or bring a requirement straight to the RFQ intake.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem", alignItems: "center" }}>
        <Button href="/" size="lg">
          Back to Manufacturing OS <ArrowRight size={16} />
        </Button>
        <TextLink href="/rfq">Start an RFQ</TextLink>
      </div>
    </div>
  );
}
