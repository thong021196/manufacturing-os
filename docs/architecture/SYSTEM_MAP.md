# System Map

## Three operating layers

### Discovery
- Market Intelligence
- Demand Graph
- Competitors
- Opportunity Map

### Execution
- CAD Packages
- RFQs
- Supplier Matching
- Supplier Quotes
- Customer Quotes
- Orders
- Production
- QC / Inspection

### Intelligence
- Ontology / Knowledge Graph
- Supplier Capability Graph
- Search Performance
- Demand Learning
- Supplier Learning
- Economics
- Evidence
- Revisions

## End-to-end system flow

`MARKET → DEMAND → OPPORTUNITY → ONTOLOGY → SEARCH SURFACES → CAD → RFQ → SUPPLIER MATCH → QUOTE → CUSTOMER QUOTE → ORDER → PRODUCTION → QC → OUTCOME → LEARNING → LOOP`

## Data maturity loop

Initial knowledge:
- what buyers appear to need
- what suppliers claim they can do

Operational knowledge:
- what buyers actually upload
- what buyers actually request quotes for
- what buyers actually buy
- what suppliers actually quote
- what suppliers actually deliver
- actual price, lead time, QC, rework and repeat behavior

Operational outcomes must continuously update demand, supplier capability, opportunity scoring, ontology and public search surfaces.

## Cross-cutting primitives
Every major object must support:
- SOURCE
- VERSION
- EVIDENCE
- OUTCOME

These primitives must remain visible in the UI and data model rather than being treated as afterthoughts.
