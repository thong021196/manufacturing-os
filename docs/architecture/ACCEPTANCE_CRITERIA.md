# Acceptance Criteria

## Frontend shell v1
The first frontend shell is accepted only when:

- All primary navigation areas from `FRONTEND_SPEC.md` exist.
- Mock data demonstrates the complete business flow.
- Core objects link to related objects rather than existing as isolated screens.
- Source, confidence, revision and evidence are visible where relevant.
- Declared and observed supplier capability are visually distinct.
- Search demand and paid demand are not conflated.
- RFQ, quote, order, production and QC states are understandable from the UI.
- Responsive layout works on desktop and mobile widths.
- No sensitive CAD/customer files are represented as public URLs.
- No Shopify, marketplace, autonomous purchasing, or full supplier portal is introduced.
- Type/lint/build checks pass once the application scaffold exists.

## Review severity
- P0: security, data loss, wrong revision, public customer/CAD exposure, destructive behavior.
- P1: architectural violation, broken critical workflow, materially misleading business logic.
- P2: important UX/data consistency issue that does not block the core flow.
- P3: polish, cleanup, minor consistency.

A PR cannot be marked PASS with unresolved P0/P1 issues.
