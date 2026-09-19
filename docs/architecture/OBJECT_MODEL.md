# Core Object Model

## Market / knowledge objects
- Market
- Industry
- Application
- Component
- Material
- Process
- Engineering Problem
- Geography
- Search Query
- Search Surface
- Opportunity

## Supply objects
- Supplier
- Supplier Capability
- Supplier Machine / Process Evidence
- Supplier Performance

Supplier capability must separate:
- `declared_capability`
- `observed_capability`

## Customer / execution objects
- Company
- Contact
- CAD Package
- Part
- Revision
- RFQ
- Supplier Quote
- Customer Quote
- Order
- Production Job
- Inspection / QC Result
- Outcome

## Shared metadata
Important objects should support where relevant:
- id
- status
- source
- confidence
- revision
- created_at
- updated_at
- owner
- evidence
- last_verified

## Demand maturity
Demand must not be represented as one number. Track separately:
1. Search demand
2. Visitor demand
3. CAD / RFQ demand
4. Quote demand
5. Paid demand
6. Repeat demand

## Revision rule
Released files and manufacturing definitions are immutable. Any change creates a new revision. RFQs, quotes, orders and QC records must point to the exact revision used.

## Evidence rule
Facts inferred by AI, copied from supplier marketing, verified in documentation, obtained from a quote, or proven by production must never be treated as equivalent. Preserve provenance and confidence.
