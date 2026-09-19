import type { Metadata } from "next";
import type { ReactNode } from "react";

// Execution routes render private operational data (CAD/RFQ/quote/order
// references, including internal vault file refs). AGENTS.md rule 4: CAD
// and customer files must never be publicly indexed. This frontend shell
// has no auth layer yet (mock data only), so noindex is the interim
// mitigation until a real authorization boundary exists in front of these
// routes -- see the PR's Known Issues for the tracked follow-up.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ExecutionLayout({ children }: { children: ReactNode }) {
  return children;
}
