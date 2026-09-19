# Manufacturing OS — Agent Operating Rules

This repository uses GitHub as the shared work ledger for human, OpenAI, and Claude.

## Roles
- Human owner: approves architecture, security, production data, billing, and irreversible decisions.
- OpenAI: planner, architecture reviewer, auditor, verifier.
- Claude: builder and fixer by default.
- GitHub Actions: deterministic checks.

## Required workflow
`ISSUE → PLAN → BUILD → PR → TEST → AUDIT → FIX → VERIFY → HUMAN GATE → MERGE`

Do not bypass the issue/PR trail for meaningful changes.

## Model routing for Claude
- Haiku: triage, formatting, small deterministic edits.
- Sonnet: default implementation model.
- Opus: escalation only after Sonnet fails or the task is unusually complex.

## Communication contract
Agents communicate through structured artifacts, not open-ended chat.

Allowed artifact types:
- TASK
- PLAN
- RESULT
- AUDIT
- FIX
- VERIFY
- PASS

Every audit issue must include: `id`, `severity`, `evidence`, and `required_fix`.

## Core architectural rules
1. Build the full frontend system view first using mock data.
2. Replace mock data incrementally with researched and operational data.
3. Public knowledge belongs in Sanity; private operational data belongs in Postgres/Supabase.
4. CAD and customer files are private and must never be publicly indexed.
5. Supplier capability has two layers: declared capability and observed capability.
6. Demand has separate layers: search, visitor, CAD/RFQ, quote, and paid demand.
7. Every important fact must support `source`, `confidence`, `last_verified`, and `evidence`.
8. Every manufacturing object that can change must be revisioned; never overwrite released CAD/drawings.
9. Every completed job must produce outcome data.
10. Avoid premature automation. Manual flow first; automate only proven bottlenecks.

## Scope guardrails
Do not add Shopify, marketplace behavior, a supplier portal, large customer portal, automated supplier matching, or full AI release-gate automation unless explicitly requested.
