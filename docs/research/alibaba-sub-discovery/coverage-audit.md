# Coverage audit — Alibaba supply-side sub discovery (Issue #18)

## Status: BLOCKED before Phase 1 smoke test could execute — no Apify calls succeeded, no data collected, $0 spent

This pass could not reach the Apify REST API from this session's execution environment.
Every deliverable below reflects that: the folder, schema and query-generation work are
real; the listings/supplier/sub-candidate/supply-density CSVs are **header-only, zero
rows**, because no actual scrape ran. Nothing in this dataset is fabricated.

## What happened, in order

1. Read the Apify API token from the local secret file at the path the task specified,
   via shell indirection (`APIFY_API_TOKEN="$(cat <path>)"`), exactly as instructed. The
   token was never echoed, printed, logged, or written to any file by this session.
2. Attempted a minimal, read-only sanity call — `GET https://api.apify.com/v2/users/me`
   with the token as a Bearer header, via `curl --silent` (no `-v`), to confirm the
   account and check available credit/usage before touching the Actor at all.
3. That call failed at the TCP/TLS level: this session's outbound HTTPS goes through a
   policy-enforcing egress proxy (`http://127.0.0.1:35041`, documented at
   `/root/.ccr/README.md`), and the proxy's own status endpoint
   (`GET http://127.0.0.1:35041/__agentproxy/status`) recorded the rejection explicitly:

   ```
   "recentRelayFailures": [
     {
       "ts": "2026-09-20T06:11:28.753Z",
       "kind": "connect_rejected",
       "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
       "host": "api.apify.com:443"
     }
   ]
   ```

   `curl` itself returned exit code 56 (connection reset by the proxy) with
   `HTTP_STATUS:000` — no response body was ever returned by Apify, because the
   connection to `api.apify.com` was never established.
4. Per the proxy's own operating instructions (`/root/.ccr/README.md`, "403 / 407 from
   the proxy" section): *"The destination host is not allowed by your organization's
   egress policy for this session. Do not retry or route around it — report the blocked
   host."* This session therefore made exactly one connection attempt to `api.apify.com`
   and stopped, rather than retrying or trying an alternate hostname/IP for the same
   service (which would have been routing around an explicit organization policy
   decision, not a transient fault).
5. Checked whether an Apify MCP tool existed as an alternative path (`ToolSearch` for
   "apify") — none does. The task's own instructions anticipated this ("you likely don't
   have an Apify MCP tool, so do this via Bash/curl"), which is exactly the path the
   egress policy blocks for this session.
6. No Actor input-schema inspection, no smoke test, no batch run, and no dataset/run-cost
   query against Apify happened as a result. Nothing downstream of step 3 could be real
   data, so nothing downstream was fabricated to fill the gap.

## What this means against the issue's required outputs

| Deliverable | Status |
|---|---|
| `README.md` | Present — documents the blocker and the flow-correction relative to Issue #17 |
| `queries.csv` | Present — 18 real queries (5 Phase-1 smoke + 13 Phase-2 expansion), each mapped to one of the 12 RFQ families per the issue's query-generation rule. Built entirely from Issue #11/#13/#15 research already in the repo (branches `claude/issue-11-...`, `claude/issue-13-...`, `claude/issue-15-...`), not from any Alibaba call. |
| `alibaba-listings-raw.csv` | Present, header-only (23-column schema per issue spec), 0 rows |
| `alibaba-listings-clean.csv` | Present, header-only, 0 rows |
| `supplier-dedup.csv` | Present, header-only, 0 rows |
| `sub-candidates.csv` | Present, header-only, 0 rows — **no sub candidates were formed**, because the issue is explicit that a sub candidate "phải hình thành từ pattern supply-side lặp lại, không phải agent tự nghĩ ra" (must form from a repeated supply-side pattern, not be invented by the agent). With zero real listings, forming even one candidate would mean inventing the evidence, which this pass will not do. |
| `supply-density.csv` | Present, header-only, 0 rows |
| `coverage-audit.md` | This file |

## Cost / credit accounting

- **Apify credit spent: $0.00** (of the $5.00 free-tier monthly budget). No Actor run was
  ever started, so no run cost, dataset-storage cost, or proxy/residential-IP surcharge
  was incurred.
- Apify account balance/usage could not be checked either (the `users/me` and any
  usage/limits endpoint calls failed for the same network reason), so this report cannot
  independently confirm the owner's current remaining credit — only that this session
  spent none of it.

## Relationship to Issue #17

Issue #17 ("Pass 5 — Sub-market discovery + 30–100 page search pilot") currently
instructs, under "Không làm trong phase này": *"không chạy Alibaba supplier deep-dive
trong task này"* (do not run an Alibaba supplier deep-dive in that task) — i.e. Issue #17
as filed still assumes a Google/SERP-first flow for sub selection. Issue #18 is the
explicit correction: Alibaba supply-side reality must come before Google/SERP demand
validation (`RFQ family → Alibaba supply reality → sub candidates → Google/SERP demand →
pilot sub → page pilot`). This pass could not produce the Alibaba-derived sub candidates
that correction depends on, so **Issue #17's Phase A (sub-market shortlist) should not be
started from Google/SERP alone until a working Alibaba data pass exists** — otherwise
Issue #17 would repeat exactly the ordering mistake Issue #18 was opened to fix. This
note is informational only; per the task scope this session did not modify Issue #17 or
any of its artifacts (issue #17 has not been worked on yet — no branch or PR exists for
it in this repo as of this pass).

## Recommendation to the owner (human gate)

This is an infrastructure/environment blocker, not a data-quality or cost-control
decision, so it is escalated rather than worked around:

1. **Allowlist `api.apify.com:443` (HTTPS, standard REST) in the egress policy** for
   whatever environment class this task runs in — this is the only endpoint the task
   needs; no other new host access is required.
2. Alternatively, **run this task from an environment with direct/allowed internet
   egress** (e.g. a local machine or a differently-configured session) using the same
   token, the same Actor choice, and the same phased smoke-test-first plan described in
   Issue #18 and reflected in `queries.csv` here.
3. Once either of those is true, this folder's structure and `queries.csv` can be reused
   as-is — rerun Phase 1 smoke test with `Q01`–`Q05`, audit per the issue's checklist,
   then decide on Phase 2 scaling against the real $5 credit budget, exactly as the issue
   specifies. No planning work needs to be redone.
4. **Do not treat the empty CSVs in this PR as "no supply found."** They mean "not yet
   queried," not "Alibaba has no capability clusters for these RFQ families."

## Token handling — explicit confirmation

The Apify API token was read once, from the exact local secret file path given in the
task, only via shell indirection into an environment variable inside a script file (never
typed literally into any tool call, file, commit, or message). It was used only as an
`Authorization: Bearer` header value in a single `curl --silent` invocation that never
completed (proxy-level TCP/TLS rejection before any HTTP request left this container). It
was never echoed, printed, logged to stdout/stderr in a way this session captured as
output, written into any CSV/README/commit/PR text, or persisted anywhere beyond the
original secret file and the one-shot script that read it. Before every commit on this
branch, the staged diff was checked with `grep -r` for the token's known literal-prefix
substring (per this task's mandatory pre-commit rule) and no match was found. **The
token did not leak into any output, file, commit, or report.**
