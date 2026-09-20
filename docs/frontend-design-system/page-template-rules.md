# Page template rules

Part pages emphasize critical features, materials, route, and inspection. Application pages aggregate part families and capabilities without repeating every part section. Capability pages explain geometry fit, workholding, materials, and inspection. Engineering and resource pages resolve preparation questions. Quality pages make acceptance and traceability visible.

All templates share breadcrumbs, technical hero, compact metadata, related entities, file requirements, and a consistent RFQ action. The exact block order can change with the page job. Structured mock data flows through `lib/frontend/adapter.ts` into `FrontendPageModel`; copy is not embedded in the template components.
