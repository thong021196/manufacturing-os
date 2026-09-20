# Page template rules

Part pages emphasize critical features, materials, route, and inspection. Application pages aggregate part families and capabilities without repeating every part section. Capability pages explain geometry fit, workholding, materials, and inspection. Engineering and resource pages resolve preparation questions. Quality pages make acceptance and traceability visible.

All templates share breadcrumbs, technical hero, compact metadata, related entities, file requirements, and a consistent RFQ action. The exact block order can change with the page job. Structured mock data flows through `lib/frontend/adapter.ts` into `FrontendPageModel`; copy is not embedded in the template components.

The Company page (`/company`, with a deeper `/company/manufacturing-network`) is a corporate-identity template rather than a `FrontendPageModel` template: it is hand-composed like Network and RFQ, because its job is trust and identity, not object-specific technical procurement.

## Navigation / IA scope decision

The full information architecture in the redesign brief (Capabilities, Parts, Applications, Quality, How It Works, Resources, Company) is wider than the seven reference screens built in this pass. Primary nav and footer only link to routes that exist today: `/capabilities/5-axis-machining`, `/parts/robot-joint-housing`, `/applications/humanoid-robots`, `/quality`, `/company`, `/company/manufacturing-network`, `/resources`, `/engineering`, `/rfq`, and the two legal stubs. Category leaves that are not yet built (e.g. CNC Machining, Turning, Sheet Metal, Welding, a dedicated How It Works page, individual Resources guides) are intentionally omitted from nav and footer rather than linked to a page that doesn't exist — the IA is represented by section headings and copy on the built pages instead. Add the remaining leaf pages as `FrontendPageModel` entries and wire them into nav/footer once they exist; the block-renderer/adapter pattern is built to scale to that volume without new visual rules.
