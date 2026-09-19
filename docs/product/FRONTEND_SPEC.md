# Frontend Shell Specification

The first implementation is a complete system-view frontend using mock data. It is not the final product and should be easy to replace with researched/operational data later.

## Navigation

### Overview
- System health
- Active opportunities
- RFQ pipeline
- Supplier coverage
- Search signals
- Margin / outcome summary

### Discovery
- Market Intelligence
- Demand Graph
- Opportunity Map
- Competitors

### Knowledge
- Ontology
- Components
- Materials
- Processes
- Engineering Problems
- Applications
- Geographies
- Search Surfaces

### Supply
- Suppliers
- Capability Graph
- Supplier Performance

### Execution
- CAD Packages
- RFQs
- Supplier Quotes
- Customer Quotes
- Orders
- Production
- QC / Inspection

### Intelligence
- Search Performance
- Demand Learning
- Supplier Learning
- Economics
- Evidence
- Revisions

## Required relationship view
The UI must make relationships navigable. Example: a Component detail page should expose linked demand, processes, materials, engineering problems, suppliers, search surfaces, RFQs, and outcomes.

## Initial design direction
- Light enterprise interface
- Deep navy brand
- White workspace
- Neutral infrastructure/engineering tone
- Tables, panels, sections and dividers over giant SaaS cards
- Dense but readable operational information
- Clear status, evidence, revision and confidence indicators

## Mock-first rule
Mock data should exercise the whole flow:
`Market → Opportunity → Component → Supplier → CAD → RFQ → Quote → Order → QC → Outcome`.

Do not hard-code the UI around the current mock schema. Components should tolerate new fields and additional relationships as the domain model matures.
