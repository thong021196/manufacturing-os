# Weekly operating rhythm — an owner who logs in twice a week

Designed for **two visits a week, 20–30 minutes each** (default Monday and
Thursday — change with the `admin_visit_days` Terraform variable), plus
same-day email alerts for new RFQs in between.

## What runs without you

| Thing | How | Where you see it |
|---|---|---|
| New RFQ alert | Email to your inbox within seconds of a submission (SES) | inbox; link opens the RFQ in `/admin` |
| RFQ storage | Saved to RDS + private S3 before the customer sees their reference number | `/admin/rfqs` |
| Scheduled pages go live | At their `publishAt`, within ~5 min, no deploy | `/admin` §3, `/admin/content` |
| Sitemap / nav links | Follow what's live automatically | — |
| Content drafting | Weekly Claude routine opens a `content` PR (suggested: Wednesday) | `/admin` §2, GitHub |
| Deploys | Every merge to `main`: build → migrate DB → roll → health check; auto-rollback if unhealthy | GitHub Actions; version in `/admin` §4 |
| Backups | RDS automated backups, 7 days | AWS console |

## Reply-time target

- **First reply to a new RFQ: within 1 business day** of submission. The
  email alert makes this possible between visits: reply from your phone
  ("received, reviewing, here's what we still need…"), then do the real
  review at the next visit.
- The dashboard flags any `New` RFQ older than 24 h in red.
- A quote that has sat in `Quoted` for 14 days is flagged for follow-up
  (mark it Won/Lost when you know — that outcome data is how the business
  learns, AGENTS.md rule 9).

## Each visit (Monday and Thursday)

Open `https://<your-domain>/admin` → **This week**. Work top to bottom:

1. **New RFQs needing a reply** (~10–15 min). For each, oldest first:
   open it, read the requirement and files (Download is re-authorised and
   uses a 5-minute link), reply to the customer by email, add a one-line
   internal note ("asked for rev B drawing", "sent to supplier shortlist"),
   move it to **Reviewing** (or **Archived** if spam/out of scope).
   Then glance at *Reviewing* and *Quoted*: anything to chase? Mark
   **Quoted** when a quote goes out, **Won/Lost** when you hear back.
2. **Content waiting for approval** (~5 min, mostly Thursday). Open the
   `content` PR(s): read each page as a customer would; check nothing claims
   a number or capability you can't stand behind. Merge to approve (it
   publishes itself on its date), edit the date/wording in the PR, or close
   it with a reason.
3. **Publishing before your next visit** (~1 min). This is what will appear
   on the site before you're back. Anything wrong → **Pause** it in
   *Content calendar*.
4. **Health** (~30 s). All dots green? Store reachable, alerts **on**,
   version = the latest merge. Amber alerts dot = email not configured/
   verified (see LAUNCH-RUNBOOK §9.4). Red = see "If something looks wrong".

Monday tends to be RFQ-heavy (the weekend's submissions); Thursday adds
the content PR review.

## If something looks wrong

- **Site down / health red**: GitHub → Actions → last *Deploy production
  (AWS)* run. A failed deploy never replaces the running version; a
  crash-looping one is rolled back automatically. Ask an agent session to
  investigate with the logs (`/ecs/manufacturing-os-app`).
- **Didn't get an alert for an RFQ you can see in /admin**: check spam; then
  logs for `owner alert FAILED`. RFQs are never lost because of email.
- **A page shouldn't be live**: `/admin/content` → Pause. Fix via PR, then
  Resume.
- **Locked out after typos**: wait 15 minutes. Lost your authenticator:
  LAUNCH-RUNBOOK "Day-2 operations".

## What this deliberately does not do

No customer or supplier logins, no marketplace, no automatic supplier
matching or quoting, no auto-publishing of unreviewed text. Every public
word goes through a PR you merge; every customer file stays behind your
login.
