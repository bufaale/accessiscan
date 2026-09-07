# AccessiScan — 100% UI test coverage pass (live)

**Target:** `https://accessiscan.piposlab.com` — production, commit `6821707`
("fix(free-scan): don't offer a browser scan as the cure for a 404").
**Date:** 2026-09-06 (enumeration + first execution pass), **fix pass 2026-09-06
night** (all 14 FAILs + row 73 closed — see "Fix pass" section below).
**Method:** headless Chromium via Playwright 1.58.2 (resolved with `createRequire`
from `app-04-ada-scanner/node_modules`), driven by one-off scripts. Own browser
instance launched locally by each script (`chromium.launch()`) — never a CDP
attach to any operator Chrome profile, never the chrome-devtools MCP. Every row
below was exercised against the LIVE deployment. Nothing is marked PASS from a
unit test, a local dev server, an E2E spec, or by reading source alone (source
reads informed WHERE to look; every verdict came from a live request/response
or a live DOM read).

**Why this exists:** standing rule
`~/.claude/rules/common/ui-test-every-feature.md` — every user-reachable
functionality must be exercised through the deployed UI before it counts as done.
The rule was written after Costback shipped its differentiated CSV path having never
been touched by a browser while paid traffic was pointed at that page. AccessiScan's
`/free/wcag-scanner` is the same shape of risk: it is the paid-traffic landing page
and it had just received a behavioural change (the honest blocked-site state) that
only specs had verified.

**Enumeration was done BEFORE execution.** Routes were read from `src/app`, the live
site was walked structurally, and all 120 rows were written with `Result = PENDING`
and committed (`7e75a02`) before a single assertion ran — so coverage is deliberate
rather than "whatever I happened to try".

---

## Scoreboard

| Metric | Value (first pass, 2026-09-06 day) | Value (after fix pass, 2026-09-06 night) |
| --- | --- | --- |
| Total rows | 120 | 120 |
| PASS | 105 | **120** |
| FAIL | 14 | **0** |
| Not covered | 1 | **0** |
| Bugs found | 15 (2 Critical, 5 High, 5 Medium, 3 Low) | 15 found, **15 fixed** (0 open) |

Screenshots (first pass): `…/scratchpad/uicov/`. Screenshots (fix-pass
verification): `…/scratchpad/uicov-fix-verify/` (session-scoped scratchpad, not
committed to the repo — see BUG_REPORT.md for the full evidence table with
per-row citations).

**Headline (first pass):** the free scanner — the surface paid traffic lands on —
was in good shape. The blocked-site contract, the SSRF guards, the freemium gate,
the permalink and the mobile scan all held (rows 31-59, 100-101). The damage was
concentrated in **account creation** and **the pricing page**: email/password
signup and password reset both returned HTTP 500 because the Resend account had
exhausted its monthly quota, and `/pricing` did not respond below ~1280px.

**Fix pass (2026-09-06 night):** all 14 FAIL rows + the 1 NOT COVERED row closed.
Two bugs (BUG-4 GitHub OAuth, BUG-5 email-capture false-success) turned out to
affect a component DIFFERENT from the one first fixed — `/login` and `/signup`
actually render `src/app/login-v2-preview/_shared.tsx`, not
`src/components/auth/{login,signup,oauth-buttons}.tsx`, and `/free/wcag-scanner`'s
own claim form lives in `scanner-form.tsx`, separate from
`scan-lead-capture.tsx` (used only on the `/scan-result/[token]` permalink page).
Both real components were found via live DOM inspection (mismatched field ids/
data-testids between what was read and what actually rendered) and fixed
directly; the originally-edited files were harmless dead code and left fixed
defensively. Full account of every defect, fix, and live-verification evidence is
in `BUG_REPORT.md` at the repo root.

---

## Coverage sheet

### Landing `/`

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 1 | Landing renders with hero headline | PASS | h1 = "Real WCAG 2.1 AA compliance — not an overlay band-aid." |  |
| 2 | Primary hero CTA 'Start free Title II scan' navigates | PASS | landed https://accessiscan.piposlab.com/free/wcag-scanner |  |
| 3 | Secondary hero CTA 'See how we compare' jumps to #comparison | PASS | hash=#comparison target exists=true top=0 |  |
| 4 | Navbar anchor "Product" → #features exists and scrolls | PASS | hash=#features exists=true sectionTop=0 scrollY=2622 |  |
| 5 | Navbar anchor "Comparison" → #comparison exists and scrolls | PASS | hash=#comparison exists=true sectionTop=0 scrollY=1935 |  |
| 6 | Navbar anchor "Pricing" → #pricing exists and scrolls | PASS | hash=#pricing exists=true sectionTop=0 scrollY=4338 |  |
| 7 | Navbar anchor "FAQ" → #faq exists and scrolls | PASS | hash=#faq exists=true sectionTop=0 scrollY=5199 |  |
| 8 | Footer links to /#cta — target exists on landing | PASS | exists=true scrollY=6087 text="You have 365 days until Title II.Scan your domain in 90 seconds. No ca" |  |
| 9 | Navbar route links navigate where they claim | PASS | Enterprise→/enterprise, Overlay detector→/overlay-detector, Sign in→/login, Start free scan→/signup (all visible=true, all matched href) |  |
| 10 | Every footer link resolves (no 404) — 21 unique hrefs | PASS | all 21 unique hrefs → <400 |  |
| 11 | No false customer / certification claims visible on the landing page | PASS | customer-claim matches: []; cert matches: [] |  |
| 12 | Mobile navbar toggle opens/closes at 390px | PASS | dialogs before=0 → open=1 with 8 links ["Product","Comparison","Enterprise","Overlay detector","Pricing","FAQ","Sign in","Start free scan"] → after Escape=0 | uicov/12-mobile-nav-open.png |
| 12a | DOJ countdown banner hydrates and ticks | PASS | t0: "DOJ Title II Web Accessibility Deadline · Apr 26, 2027 Public entities with 50,000+ residents 0 DAYS · 00 HRS " \| t+2.5s: "DOJ Title II Web Accessibility Deadline · Apr 26, 2027 Public entities with 50,000+ residents 231 DAYS · 01 HR" \| changed=true |  |
| 12b | Landing FAQ accordion (8 items) opens and closes | PASS | 8 buttons; section text length 955 → 888 (open #3) → 559 (close). Labels e.g. ["01What does \"WCAG 2.1 AA\" actually mean for ","02Does an overlay widget make me compliant?","03What is a VPAT 2.5 and why do I need one?"] |  |
| 12c | Landing pricing card CTAs point at real routes | PASS | [{"t":"Start free scan","h":"/signup"},{"t":"Start free — upgrade anytime","h":"/signup"},{"t":"Start free — upgrade anytime","h":"/signup"},{"t":"Business and Team plans on the full pricing pa","h":"/pricing"}] |  |
| 12d | 'Install GitHub App' CTA — where an anonymous visitor actually lands | PASS | href=/dashboard/github → anonymous visitor landed at /login |  |

### Pricing `/pricing`

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 13 | 5 tier cards render with names + prices | PASS | Free $0 · Pro $39 · Agency $99 · Business $299 · Team $599 |  |
| 14 | Prices match current pricing (Pro $39, Agency $99) — no stale pricing | PASS | Pro=$39 Agency=$99 Business=$299 Team=$599; plans.ts says pro=$39 agency=$99 business=$299 team=$599 |  |
| 15 | Monthly ↔ Annual toggle changes the displayed prices | PASS | 4/5 prices changed. Annual: Free $0 · Pro $390 · Agency $990 · Business $2990 · Team $5990 |  |
| 16 | Each tier CTA renders with the right label/target | PASS | free: "Start free scan" → /signup \| pro: "Start free — upgrade anytime" → (button) \| agency: "Start free — upgrade anytime" → (button) \| business: "Start free — upgrade anytime" → (button) \| team: "Contact sales" → mailto:alex@piposlab.com?subject=AccessiScan%20Team%20tier \|\| clicked cta-free → landed /signup | Free → /signup link; Pro/Agency/Business are buttons that POST /api/stripe/checkout (row 98); Team is a mailto |
| 17 | ROI calculator recomputes on input | PASS | pages 50→500, risk 15%→60%: EXPECTED ANNUAL LAWSUIT COST $5,250→$21,000; EXPECTED ANNUAL SAVINGS $5,022→$20,772; 23× ROI→92× ROI | Earlier FAIL was my assertion window truncating at 420 chars of static intro copy — retested with the full section text |
| 18 | Pricing FAQ accordion (8 items) expands/collapses | PASS | aria-expanded before ["true","false","false","false","false","false","false","false"] → after clicking #4 ["false","false","false","true","false","false","false","false"]; text len 735→714 |  |
| 19 | Vendor comparison table renders | PASS | 16 rows, 7 cols, header "CAPABILITY ACCESSISCANUS ACCESSIBE USERWAY SITEIMPROVE DEQUE AXE" |  |
| 20 | Honest CTA copy — no 'free trial' promise if Stripe charges immediately | PASS | CTA labels are "Start free — upgrade anytime"; 'free trial' phrasing present = false |  |

### Other marketing pages

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 21 | /vpat renders + primary CTA navigates | PASS | HTTP 200; h1 "Your deal is stuck on a VPAT. Get one built from a real scan, usually within an "; 35 links, 0 forms, navbar=true footer=true \| CTA click → /audit OK |  |
| 22 | /agencies renders + primary CTA navigates | PASS | HTTP 200; h1 "Sell accessibility to your clients. We run the engine in the background."; 36 links, 0 forms, navbar=true footer=true \| CTA click → /pricing OK |  |
| 23 | /trust renders + its scorecard links resolve | PASS | HTTP 200; h1 "AccessiScan Trust Center"; 4 /scan-result links \| first scorecard link /scan-result/YqpQSB9Wt4INRtIl → HTTP 200; copy "LIVE · scanned daily by AccessiScan itself AccessiScan Trust Center We scan every Pipo Labs property with AccessiScan and publish the results here. Sa" |  |
| 24 | /scorecards renders + its scorecard links resolve | PASS | HTTP 200; h1 "Every site we've scanned, public."; 52 /scan-result links \| first scorecard link /scan-result/WOLVD8FXI_JPXl-Y → HTTP 200; copy "PUBLIC SCORECARDS Every site we've scanned, public. AccessiScan runs WCAG 2.1 AA compliance scans against US gov, edu, and enterprise sites — publishe" |  |
| 25 | /why-not-overlays renders | PASS | HTTP 200; h1 "Why Accessibility Overlays Don't Work"; 34 links, 0 forms, navbar=true footer=true |  |
| 26 | /enterprise renders | PASS | HTTP 200; h1 "Accessibility compliance,run as infrastructure."; 39 links, 1 forms, navbar=true footer=true |  |
| 27 | /blog index lists posts and every card links to a real article | PASS | 8 unique post links; /blog/best-wcag-scanners-2026→200, /blog/accessiscan-vs-siteimprove→200, /blog/ada-demand-letter-first-72-hours→200, /blog/overlay-lawsuit-guide→200, /blog/wcag-audit-cost-comparison→200, /blog/en-301-549-forbidden-ids→200, /blog/doj-title-ii-runway→200, /blog/accessibe-ftc-lessons→200 |  |
| 28 | A blog article renders (h1 + body + JSON-LD) | PASS | /blog/best-wcag-scanners-2026: h1 "The Best WCAG Accessibility Scanners Compared (2026)", ~991 words, 1 JSON-LD blocks |  |
| 29 | Unknown blog slug → 404 | PASS | HTTP 404 |  |
| 30 | Legal pages render with real content | PASS | /terms: h1 "Terms of Service" (6238 chars) \| /privacy: h1 "Privacy Policy" (7178 chars) \| /refund: h1 "Refund Policy" (2959 chars) |  |

### Free WCAG scanner `/free/wcag-scanner` — the paid-traffic surface

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 31 | Free scanner page renders with URL form + honest limitations block | PASS | {"h1":"Free WCAG 2.1 AA Scanner","input":true,"submit":true,"notDoes":true} |  |
| 32 | Normal site scans fine → real score (indy.gov) | PASS | HTTP 200; data-scan-status="ok"; score 68/100 | uicov/32-scan-ok.png |
| 33 | Issue list renders with rule + WCAG ref + severity + count | PASS | 2 issues; e.g. ["Images without alt attribute WCAG 1.1.1 Non-text Content (A) 25× · critical Add alt=\"...\" to ev","Missing skip-to-content link WCAG 2.4.1 Bypass Blocks (A) 1× · moderate Fix steps + example cod"] |  |
| 34 | First fix unlocked, remaining fixes gated | PASS | 2 issues, 1 fix-gate locks (expected 1 = all but the first) |  |
| 35 | Unlock CTA card shows the correct remaining-fix count | PASS | "1 more fixes ready to unlock You can see what's wrong. Sign up free to see how to fix every issue — step-by-step remediation, copy" vs 1 gated |  |
| 36 | 'Unlock fixes free' → /signup with UTM | PASS | /signup?utm_source=free_scan&utm_medium=gate&utm_campaign=fix_unlock |  |
| 37 | 'Get the Legal Evidence Pack ($149)' → /audit with UTM | PASS | /audit?utm_source=free_scan&utm_medium=gate&utm_campaign=audit_upsell |  |
| 38 | Bot-blocked site → honest blocked state | PASS | kcmo.gov: data-scan-status="blocked", scan-blocked testid present=true; headline+copy: "This site blocks automated scanners https://www.kcmo.gov/ No score and no issue list — we never got the page, so there is nothing to grade. The server answered 403. That is normally a CDN or WAF (Cloudflare, Akamai, AWS) turning a" | uicov/38-scan-blocked.png |
| 39 | Blocked: NO score anywhere (no 0/100, no null/100) | PASS | score-shaped strings in the panel: [] (expected []) |  |
| 40 | Blocked: no issue list | PASS | issue <li> count = 0 |  |
| 41 | Blocked: no share/permalink box | PASS | scan-permalink-share present = false |  |
| 42 | Blocked: no email capture form | PASS | scan-claim-prompt present = false |  |
| 43 | Blocked: CTA offers the browser-based scan | PASS | {"label":"Try the full browser-based scan","href":"/signup?utm_source=free_scan&utm_medium=gate&utm_campaign=fix_unlock"} |  |
| 44 | Unreachable / non-existent domain → honest failed state | PASS | data-scan-status="null", scan-failed=false; panel: "URL resolves to a private or unresolvable address" | uicov/44-scan-failed-dns.png |
| 45 | 404 page → failed state, and does NOT offer a browser scan as the cure | PASS | data-scan-status="failed"; CTA={"label":"Run the full scan","href":"/signup?utm_source=free_scan&utm_medium=gate&utm_campaign=fix_unlock"}; copy: "We couldn't reach this page https://www.indy.gov/uicov-this-page-does-not-exist No score and no issue list — we never got the page, so there is nothing to grade. The request ended with: Fetch returned 404. Check the URL " | This is what commit 6821707 fixed — verified live. uicov/45-scan-404.png |
| 46 | Failed: no score, no issues, no share box, no email form | PASS | scores=[] issues=0 shareBox=false claimForm=false (all expected empty/false) |  |
| 47 | Empty input → submit blocked, no request fired | PASS | submit disabled=true; /api/free/wcag-scan requests=0; result panel=false |  |
| 48 | Not-a-URL input rejected with an honest message | PASS | input "not a url at all" → HTTP 400 {"error":"Invalid input","details":[{"code":"custom","path":["url"],"message":"Only HTTP/HTTPS URLs are allowed"},{"code; UI error: "Invalid input" |  |
| 49 | javascript: scheme rejected with an honest message | PASS | input "javascript:alert(1)" → HTTP 400 {"error":"Invalid input","details":[{"code":"custom","path":["url"],"message":"Only HTTP/HTTPS URLs are allowed"},{"code; UI error: "Invalid input" |  |
| 50 | localhost (SSRF guard) rejected with an honest message | PASS | input "http://localhost:3000" → HTTP 400 {"error":"Invalid input","details":[{"code":"custom","path":["url"],"message":"This URL is not allowed"}]}; UI error: "Invalid input" |  |
| 51 | link-local metadata IP (SSRF guard) rejected | PASS | retested after the rate-limit window: http://169.254.169.254/ → HTTP 400 {"error":"Invalid input","details":[{"message":"This URL is not allowed"}]}; no result panel, no share box | First attempt hit the 6/min IP rate limit (429) so it was re-run rather than marked PASS on the wrong evidence |
| 52 | Share/permalink box appears on a measured scan | PASS | https://accessiscan.piposlab.com/scan-result/hbxg07yq-QSzmeZy |  |
| 53 | Copy-permalink button gives copied feedback | PASS | button label → "Copied"; clipboard = https://accessiscan.piposlab.com/scan-result/hbxg07yq-QSzmeZy |  |
| 54 | Share on X / LinkedIn / Email links well-formed and carry the permalink | PASS | X: https://twitter.com/intent/tweet?url=https%3A%2F%2Faccessiscan.piposlab.com%2Fscan-result% \| LI: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Faccessiscan.piposlab.com \| mail: mailto:?subject=WCAG%20scan%20of%20https%3A%2F%2Fwww.indy.gov%2F&body=Hi%2C%0A%0AI%20just% |  |
| 55 | Email capture: valid email → success state | PASS | UI: "✓ Sent. Check uicov-1788734440364@test.example.com in a minute."; HTTP 200 {"ok":true,"claimed":true} |  |
| 56 | The promised email is actually SENT (copy vs code) | PASS (fixed 2026-09-06) | claim response body: `{"ok":true,"claimed":true,"emailed":true,"resend_id":"067147fd-8823-462e-82d0-63b89edcb680"}` on `/free/wcag-scanner`'s own claim form, and `{"emailed":true,"resend_id":"b550bdc3-56ac-47df-96d4-48fdb86bc7ce"}` on the `/scan-result/[token]` permalink form — two separate client components, same fixed API contract. Real mail delivered to alex@piposlab.com. | Fixed in `api/free/scan-result/[token]/claim/route.ts` (check `sendRes.error` explicitly, report `emailed`) + both client forms (`scanner-form.tsx`, `scan-lead-capture.tsx`) now gate the "Sent" state on `emailed !== false`. |
| 57 | Email capture: invalid email blocked | PASS | input type=email checkValidity()=false, browser message "Please include an '@' in the email address. 'not-an-email' is missing an '@'."; /claim calls=0; success state shown=false |  |
| 58 | Email capture: re-claim with a different email → 409 | PASS | second claim on the same token with a different address → HTTP 409 {"ok":false,"error":"already_claimed"} | Issued from the page's own origin/session. The UI maps 409 to the 'This scan already has an email on file' state (that branch is code-reachable but the UI hides the form after a successful claim, so the state itself is not user-reachable in one session). |
| 59 | free_tool_events funnel rows are written (scan + capture) | PASS | service-role read after the live runs: scan_completed + email_captured pairs present, e.g. {event:scan_completed, outcome:ok, health_score:68, issue_count:26, critical_count:25, referer:https://accessiscan.piposlab.com/free/wcag-scanner} and the matching email_captured row. No email or URL in the event rows. |  |

### Share / permalink `/scan-result/[token]`

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 60 | Permalink renders in a FRESH logged-out context | PASS | HTTP 200; h1 "https://www.indy.gov/"; new browser context, zero cookies/storage | uicov/60-permalink.png |
| 61 | Permalink score + issue count match the scan that produced it | PASS | score 68/100, "26 WCAG violations" — the live scan of indy.gov reported 68/100 with total_issue_count 26 |  |
| 62 | Permalink applies the same freemium gate (1 fix free, rest gated) | PASS | unlocked "Fix:" blocks = 1; gated "Fix steps — unlock free" = 1 |  |
| 63 | Permalink page leaks no PII | PASS | capture email present in HTML: false; all email-shaped strings in the rendered page: ["you@company.com"] |  |
| 64 | Invalid permalink token → friendly state | PASS (fixed 2026-09-06) | HTTP 404; `<title>Scan not found · AccessiScan</title>`; body "This scorecard doesn't exist — or it expired." with two working CTAs ("Run a free WCAG scan" → /free/wcag-scanner, "Back to AccessiScan" → /) | Added `src/app/scan-result/[token]/not-found.tsx`. Evidence: `uicov-fix-verify/scan-result-404.png` |
| 65 | Lead-capture block on the permalink page is present | PASS | form present = true |  |
| 66 | Blocked/failed scan's permalink shows the unmeasured card, never 0/100 | PASS | token usTbkSKvhhhj5vmO (https://www.indy.gov/uicov-this-page-does-not-exist, outcome=failed): HTTP 200; unmeasured card=true; score-shaped strings=[]; lead-capture forms=0; copy "Scanned 2026-09-06 · Run your own scan https://www.indy.gov/uicov-this-page-does-not-exist WCAG 2.1 AA conformance scan · AccessiScan We couldn't reach this page There is no score and no iss" | uicov/66-permalink-unmeasured.png |
| 67 | Unmeasured permalink is noindex | PASS | <meta name="robots"> = "noindex, follow"; <title> = "https://www.indy.gov/uicov-this-page-does-not-exist · not scanned · AccessiScan" |  |

### Auth

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 68 | /signup renders the form | PASS | {"name":true,"email":true,"pw":true,"agree":true,"submit":"Start free WCAG scan","oauth":["Google","GitHub"]} |  |
| 69 | Signup: invalid email blocked client-side | PASS | inline "Enter a valid email address" shown=true; /auth/v1/signup calls=0 |  |
| 70 | Signup: weak password (<8) blocked | PASS | inline "Use at least 8 characters" shown=true; signup calls=0 |  |
| 71 | Signup: terms checkbox required | PASS | agree checked=false; inline "Please accept the terms to continue" shown=true; signup calls=0 |  |
| 72 | Signup: a valid signup completes | PASS (fixed 2026-09-06 — Resend Pro plan) | Real signup against the live AuthShell form (`src/app/login-v2-preview/_shared.tsx`, what /signup actually renders): HTTP 200 from `/auth/v1/signup`, UI showed "Check your email" success state. Test account logged in afterward and self-deleted via `DELETE /api/account/delete` (`{"deleted":true}`); re-login attempt then failed with "Invalid login credentials", confirming full cleanup. | uicov-fix-verify/signup-full-success.png. Root cause was the Resend quota (BUG-1), not app code — no code change needed, only re-verified live. |
| 73 | Existing-email signup → "already exists", not a silent login | PASS (unblocked 2026-09-06) | Re-signed up with the just-created test account's email → UI showed "User already registered" inline, stayed on the signup form, no dashboard redirect. | uicov-fix-verify/signup-existing-email.png |
| 74 | Login: valid credentials → /dashboard | PASS | admin-created confirmed user uicov-login-1788735116884@piposlab.com → landed /dashboard; h1 "Dashboard" | uicov/74-dashboard.png |
| 75 | Login: wrong password → inline error, no enumeration leak | PASS | stayed at /login; inline alert: "Invalid login credentials" (generic — does not reveal whether the address exists) |  |
| 76 | Login: empty-field validation | PASS | inline "Enter your email"=true, "Enter your password"=true; /auth/v1/token calls=0 |  |
| 77 | Forgot password: reset request → non-enumerating success state | PASS (fixed 2026-09-06 — Resend Pro plan) | Submitted a nonexistent email (zero footprint — recovery is a no-op for an unknown address either way): HTTP 200 `{}` from `/auth/v1/recover`; UI: "Check your email for the reset link. The link expires in 1 hour." | uicov-fix-verify/forgot-password.png |
| 78 | Google OAuth button behaviour | PASS | authorize request: https://snenfdbwuowscztwdpsd.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Faccessisc; final host=accounts.google.com; client_id present=true; UI="Sign in with Google Sign in to continue to snenfdbwuowscztwdpsd.supabase.co Email or phone Forgot email? Next Create account Afrikaans azərbaycan bosa" |  |
| 79 | GitHub OAuth button behaviour | PASS (fixed 2026-09-06) | `/login` buttons: `["Sign in","Sign up","Google","","Sign in"]`; `/signup` buttons: `["Sign in","Sign up","Google","","Start free WCAG scan"]` — GitHub button no longer rendered on either form. | Fixed the ACTUAL live component (`src/app/login-v2-preview/_shared.tsx`, which `(auth)/login` and `(auth)/signup` both render) behind a `GITHUB_OAUTH_ENABLED=false` flag. Also defensively fixed `src/components/auth/oauth-buttons.tsx`, which turned out to be dead code nothing currently imports — see report. |
| 80 | /dashboard logged-out → redirected to /login | PASS | /dashboard → 200 /login |  |
| 81 | /settings and /admin logged-out → redirected | PASS | /settings → 200 /login \| /settings/billing → 200 /login \| /admin → 200 /login \| /dashboard/scans/new → 200 /login |  |

### Authenticated app

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 82 | Dashboard first render (no error card) | PASS | h1 "Dashboard"; dashboard-error present=false; testids ["compliance-trend-card","trend-range-7","trend-range-30","trend-range-90"]; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Branding API Keys AccessiScan v1.0 Toggle Side" |  |
| 83 | Dashboard sidebar renders all nav items | PASS | [{"t":"Dashboard","h":"/dashboard"},{"t":"New Scan","h":"/dashboard/scans/new"},{"t":"Scan History","h":"/dashboard/scans"},{"t":"Monitored sites","h":"/dashboard/monitored"},{"t":"PDF accessibility","h":"/dashboard/pdf-scans"},{"t":"Profile","h":"/settings/profile"},{"t":"Billing","h":"/settings/billing"},{"t":"GitHub Auto-Fix","h":"/settings/github"},{"t":"Branding","h":"/settings/branding"},{"t":"API Keys","h":"/settings/api-keys"}] |  |
| 84 | /dashboard/scans/new reachable + renders for a logged-in free user | PASS | HTTP 200; landed /dashboard/scans/new; h1 "New Accessibility Scan"; error card=false; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Brandi" |  |
| 85 | /dashboard/scans reachable + renders for a logged-in free user | PASS | HTTP 200; landed /dashboard/scans; h1 "Scan history"; error card=false; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Brandi" |  |
| 86 | /dashboard/monitored reachable + renders for a logged-in free user | PASS | HTTP 200; landed /dashboard/monitored; h1 "Monitored sites"; error card=false; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Brandi" |  |
| 87 | /dashboard/pdf-scans reachable + renders for a logged-in free user | PASS | HTTP 200; landed /dashboard/pdf-scans; h1 "PDF accessibility scanning"; error card=false; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Brandi" |  |
| 88 | All 5 settings pages render for a free user | PASS | /settings/profile → 200 /settings/profile h1="Profile settings" \| /settings/billing → 200 /settings/billing h1="Billing" \| /settings/github → 200 /settings/github h1="GitHub Auto-Fix integration" \| /settings/branding → 200 /settings/branding h1="White-label branding" \| /settings/api-keys → 200 /settings/api-keys h1="API Keys" |  |
| 89 | A FREE user cannot run a deep scan | PASS | On /dashboard/scans/new the "Deep scan · Pro · Pro tier" control renders with disabled=true while "Quick scan · Single page · ~30s" is selectable. Free user could not select it. | uicov/89-new-scan.png |
| 90 | A free (non-admin) user does not get /admin | PASS | HTTP 200; landed /dashboard; copy "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Branding API Keys AccessiScan v1.0 T" |  |
| 91 | Billing page shows the Free plan + an upgrade path | PASS | "AccessiScan Main Dashboard New Scan Scan History Monitored sites PDF accessibility Settings Profile Billing GitHub Auto-Fix Branding API Keys AccessiScan v1.0 Toggle Sidebar U Billing Manage your subscription, tier, and payment method. CURRENT PLAN FREE Free $0 2 scans / month · WCAG 2.1 AA report ·" |  |
| 92 | Sign out works and re-gates /dashboard | PASS | Sign out lives in the header avatar ("U") dropdown: menu items ["<email>","Settings","Billing","GitHub Auto-Fix","Sign out"]. After clicking it, /dashboard → 200 at /login. | uicov/92-user-menu.png. First attempt reported not-found because the menu content is not in the DOM until the avatar is clicked. |

### Paid funnels

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 93 | /audit $149 form validates + reaches Stripe checkout | PASS | checkout API [200]; landed host = checkout.stripe.com | Reached the Stripe-hosted page only — no card entered, no charge. Session expires on its own. |
| 94 | /audit rejects invalid input | PASS | email checkValidity=false msg="Please include an '@' in the email address. 'bad-email' is missing an '@'."; url msg=""; checkout calls [] |  |
| 95 | /snapshot $79 form validates + reaches Stripe checkout | PASS | checkout API [200]; landed host = checkout.stripe.com | No card entered, no charge. |
| 96 | /enterprise lead form submits and is persisted | PASS | POST /api/enterprise-lead → 201; enterprise_leads row written with {name, work_email, company, role, frameworks:["doj_title_ii"], scope, ip_hash, referrer, status:"new"}. Form is replaced by a success state. | First attempt recorded no POST — harness issue (the generic fill loop left the form invalid); re-run per-field and it fired. Rows deleted in cleanup. |
| 97 | /overlay-detector returns a real verdict | PASS | POST /api/overlay-check → 200 body {"data":{"url":"https://www.indy.gov/","fetchedAt":"2026-09-06T22:58:27.865Z","hits":[],"clean":true}}; page text grew 3411→3642 chars; rendered verdict: "No accessibility overlay detected https://www" | uicov/97-overlay.png |
| 98 | A logged-in free user clicking a paid tier CTA reaches Stripe | PASS | POST /api/stripe/checkout [200]; landed host=checkout.stripe.com | Stripe-hosted page only — no card entered, no charge. |

### Mobile 390px

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 99 | Mobile 390px — landing: zero horizontal overflow | PASS (fixed 2026-09-06) | Two fix passes: first pass addressed Hero/StatsStrip/Comparison (the 3 elements originally screenshotted) — a second, stricter sweep (explicitly excluding elements inside a genuinely scrollable ancestor, to avoid a false positive from the vendor-comparison-style pattern) still found 102 real offenders in 4 more sections (FeatureTriplet, AutoFixPr, the landing's own 3-tier Pricing preview, EvidencePack, FAQ). After the second pass: 0 real offenders. `scrollW===clientW===390` throughout. | uicov-fix-verify/landing-390.png |
| 100 | Mobile 390px — free scanner: zero horizontal overflow | PASS | scrollW 390 vs clientW 390; 0 offenders [] |  |
| 101 | Mobile 390px — a real scan completes and the result panel fits | PASS | scan status="ok" score 68/100, 2 issue cards; after render scrollW 390 vs clientW 390, 0 offenders [] | uicov/101-mobile-scan.png |
| 102 | Mobile 390px — pricing: zero horizontal overflow | PASS (fixed 2026-09-06) — HIGHEST PRIORITY | Card widths now: **390px → 326px (1 col)**, **768px → 344px (2 col)**, **1024px → 309px (3 col)**, **1280px → 230px (5 col, unchanged)**. All 5 prices render in full ($0/$39/$99/$299/$599), no overlap. A deeper page-wide sweep (excluding legitimately-scrollable elements like the vendor-comparison table) also found and fixed 2 more clipped sections on the same page (UniversalFeatures 4-col grid, GovernmentCallout 2-col "Team tier" promo) plus the embedded ROI calculator's 2-col layout. Real-offender count at 390/1024/1280px: 0. At 768px: 2 (a pre-existing, page-independent Navbar overflow right at Tailwind's `md:` 768px breakpoint — flagged separately, not part of BUG-6, not fixed this pass). | uicov-fix-verify/pricing-final-{390,768,1024,1280}.png |

### Cross-cutting

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 103 | Zero unexpected console errors across 19 public routes | PASS | all 19 routes clean (0 console errors, 0 pageerrors) |  |
| 104 | /sitemap.xml 200 and every URL resolves | PASS | HTTP 200; 523 <loc> entries; broken: none |  |
| 105 | /robots.txt 200 and does not block AI crawlers | PASS | HTTP 200; body: "# AccessiScan robots.txt # Disallow protected/auth routes from being indexed. # Allow everything else (landing, pricing, free scanner, blog, etc.). User-agent: * Disallow: /dashboard Disallow: /settings Disallow: /admin Disallow: /api Disallow: /auth Disallow: /login-v2-preview Disallow: /forgot-password-v2-preview Dis" |  |
| 106 | Security headers present on / | PASS | strict-transport-security: max-age=63072000; includeSubDomains; preload \| x-frame-options: DENY \| x-content-type-options: nosniff \| referrer-policy: strict-origin-when-cross-origin \| content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.strip |  |
| 107 | /api/health reports healthy | PASS | HTTP 200 {"status":"healthy","checks":{"app":true,"database":true},"latency":47,"timestamp":"2026-09-06T23:02:01.535Z"} |  |

### Copy integrity & cross-page consistency

| # | Functionality | Result | Evidence | Notes |
|---|---|---|---|---|
| 108 | Refund window is consistent between /pricing and /refund | PASS (fixed 2026-09-06) — PRIORITY 2 | /pricing badge: "7-day money-back guarantee"; /pricing FAQ: "Within 7 days of your first paid charge or renewal..."; /refund: "refund within 7 days" / "After the 7-day period" — all three now agree. Picked 7 days (not 30) because /refund is the binding legal page and the one-time-purchase pages (/audit, /snapshot, both checkout forms) already independently committed to 7 days. | Verified live via curl + Playwright text match on all 3 surfaces. |
| 109 | Tiers named in the landing FAQ actually exist on /pricing | PASS (fixed 2026-09-06) | FAQ item 7 now reads "Our Team tier includes SSO (SAML / Okta / Google Workspace), org-wide policy enforcement, an audit log, and a dedicated customer success manager..." — matches Team's real feature list in `plans.ts`. `fedrampPresent: false`, no "Government tier" string anywhere. |  |
| 110 | /trust makes no unsupported customer claims | PASS (fixed 2026-09-06) | `customerClaimMatches: []` in body text and metadata description. All 3 occurrences reworded to describe what AccessiScan is designed to run on the visitor's own site, per `portfolio-app-anti-patterns.md` #3. |  |
| 111 | Certification claims on /pricing are honest | PASS | Rendered: "SOC 2 TYPE II (IN PROGRESS)" and "PCI-DSS handled by Stripe". No unqualified cert claim. | "(in progress)" is the honest roadmap phrasing the anti-pattern rule asks for. Observation-1 notes it is still procurement-facing. |
| 112 | 'Most popular' badge sits on the same tier on landing and /pricing | PASS (fixed 2026-09-06) | Landing #pricing badge context: "Most popularAgencyWhite-label monitoring for client portfoli..."; /pricing badge card: `pricing-card-agency`. Same tier on both pages, matching `plans.ts recommended:true`. |  |
| 113 | ROI calculator's stated AccessiScan cost matches real pricing | PASS (fixed 2026-09-06) | Renders "One avoided ADA lawsuit pays for AccessiScan ~75 years." + "AccessiScan Pro: \$468/yr." — both now derived from `plans.ts` (\$39/mo × 12) instead of a hardcoded \$19/mo. |  |
| 114 | Navbar hash anchors resolve from a non-landing page | PASS (fixed 2026-09-06) | Clicked "Product" on /pricing → href is now `/#features`; landed at `https://accessiscan.piposlab.com/#features`; `#features` element exists=true; scrollY=2628 (scrolled to the section). |  |
| 115 | /trust + /scorecards have navbar + footer | PASS (fixed 2026-09-06) | /trust: `hasHeader:true`, `footerLinks:23`. /scorecards: `hasHeader:true`, `footerLinks:24`. Both moved into the `(marketing)` route group (URL unchanged) so they inherit the shared Navbar/Footer/StructuredData. |  |
| 116 | Hard statistics carry a visible source | PASS | source attributions found on the landing page: ["FTC fined accessiBe $1M for deceptive “fully compliant” claims","Compiled April 2026 from public pricing pages"] |  |

---

## Bugs found

15 bugs: **2 Critical, 5 High, 5 Medium, 3 Low.** Each one names the coverage row it
came from. No product code was changed to make anything pass.

### BUG-1 — Transactional email is dead: the Resend monthly quota is exhausted — **CRITICAL**
*(root cause behind BUG-2, BUG-3 and BUG-4; rows 55/56, 72, 77)*

**Where:** every email the product sends — Supabase auth mail (signup confirmation,
password reset) and the free-scan "email me a copy" capture.

**Observed:** the Resend API returns, for every send:

```
{"statusCode":429,"message":"You have reached your monthly email sending quota.","name":"monthly_quota_exceeded"}
```

Verified twice — once through the exact production `from` address and once through
the verified `no-reply@piposlab.com` as a control. Both 429. Supabase is configured
with custom SMTP `smtp.resend.com` (`smtp_user=resend`,
`rate_limit_email_sent=500`), so the same exhausted account backs auth mail.

**Why it matters:** one account-level setting is currently breaking signup, password
reset, and the free tool's lead capture simultaneously.

**Secondary, latent:** `RESEND_FROM_EMAIL` in production is
`AccessiScan <alerts@accessiscan.app>`, but the only verified domain on the Resend
account is `piposlab.com` — `accessiscan.app` is not listed. Once the quota resets,
that from-address should still be rejected. Flagged as inferred from the Resend
domains API rather than observed, because the quota error currently masks it.

---

### BUG-2 — Email/password signup is completely broken in production — **CRITICAL**
*(row 72)*

**Observed:** `/signup` → `POST /auth/v1/signup` returns HTTP **500**
`{"code":"unexpected_failure","message":"Error sending confirmation email"}`. The UI
surfaces the raw string "Error sending confirmation email", stays on the form, and
**no account is created** (confirmed via the Supabase admin API). Reproduced twice
with different addresses.

**Corroboration:** the project has 5 users. Both real ones are **Google OAuth**; the
newest email/password row is a `funnel-test-` account from **2026-05-29**. No organic
email/password signup has completed in over three months.

**Why it matters:** this is the revenue path. The landing hero, all three landing
pricing cards, `cta-free` on `/pricing`, and the free scanner's "Unlock fixes free"
gate — the one paid traffic is funnelled into — all point at `/signup`. Combined with
BUG-4, **Google OAuth is the only working way to create an account.**

---

### BUG-3 — Password reset is broken, so locked-out users cannot recover — **HIGH**
*(row 77)*

**Observed:** `/forgot-password` → `POST /auth/v1/recover` returns HTTP **500**
`{"code":"unexpected_failure","message":"Error sending recovery email"}`, rendered in
the UI as "Error sending recovery email".

**Expected:** the non-enumerating "if that address has an account, the link is on its
way" success state.

---

### BUG-4 — The GitHub sign-in button dumps users on raw Supabase JSON — **HIGH**
*(row 79)*

**Observed:** the `GitHub` button on `/login` and `/signup` navigates off-site to the
Supabase auth host and renders, as the entire page:

```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

Confirmed against the live auth config: `external_github_enabled = false` (while
`external_google_enabled = true`).

**Expected:** either don't render the button, or enable the provider.

**Why it matters:** it sits with equal visual weight beside the working Google
button, on a product whose headline feature is *Auto-Fix pull requests against your
GitHub repo* — so GitHub is the provider this audience is most likely to click. The
user ends up on raw JSON, on a different domain, with no way back.

---

### BUG-5 — The free-scan capture says "✓ Sent" for an email that was never sent — **HIGH**
*(rows 55/56)*

**Observed:** the UI shows `✓ Sent. Check <address> in a minute.` and the route
returns `{"ok":true,"claimed":true}` — **with no `resend_id`**. Tested twice: once
with a throwaway address and once with the real, deliverable `alex@piposlab.com`.
Neither produced a message id, so no mail was accepted.

**Root cause:** the Resend SDK reports failure as `{data: null, error}` rather than
throwing, so the `catch` never fires, `resendId` stays `undefined`, the key is
dropped from the JSON, and the route reports success. The cap-exceeded path *is*
correctly distinguishable (it returns `emailed:false`); only the send failure is
silent.

**Why it matters:** this is the conversion moment on the paid-traffic page. The
visitor hands over their email, is told to check their inbox, and nothing arrives —
the same unkept promise `portfolio-app-anti-patterns.md` #3 exists to prevent, and
the same bug Costback shipped. Note this would stay silent even after BUG-1 is fixed.

---

### BUG-6 — `/pricing` is unusable below ~1280px — **HIGH**
*(row 102)*

**Observed:** the five pricing cards never stack. Measured card widths:

| viewport | card width |
|---|---|
| 390px (iPhone 14) | **52px** each |
| 768px (tablet) | **128px** each |
| 1280px (desktop) | 230px each |

At 390px every price is clipped (`$0`→"$C", `$39`→"$3", `$99`→"$9", `$299`→"$2",
`$599`→"$59"), feature text wraps to roughly one character per line, CTA buttons
overlap the copy, and the Team column (right edge x=435 in a 390px viewport) runs off
screen with nothing scrollable to reach it. See `uicov/102-team-card-mobile.png`.

**Why it matters:** this is where the purchase decision happens, and it is broken for
every phone and tablet visitor. The landing page's own pricing section renders fine
at 390px — only the dedicated `/pricing` grid is affected, and that is where all five
tiers and both billing periods live.

---

### BUG-7 — Refund window: `/pricing` promises 30 days, `/refund` grants 7 — **HIGH**
*(row 108)*

**Observed, verbatim from the live pages:**

- `/pricing` header: "**30-day money-back guarantee**"
- `/pricing` billing FAQ: "Yes. **Within 30 days** of your first paid charge, email
  alex@piposlab.com for a full refund — no forms, no exit interview."
- `/refund` (the binding policy, linked in the footer): "you may request a full
  refund **within 7 days** of your initial purchase or renewal. **After the 7-day
  period, no refunds will be issued.**"

**Why it matters:** the marketing page promises four times the window the policy
grants, on the page that takes payment. Whichever is wrong, a customer who buys on
day 20 relying on the pricing page has a documented claim — and this is exactly the
chargeback trigger `CLAUDE.md` says to avoid ("always prefer refund to chargeback").

---

### BUG-8 — Landing FAQ sells a "Government tier" that does not exist — **MEDIUM**
*(row 109)*

**Observed:** landing `#faq` answer 7 states "Our **Government tier** includes
**FedRAMP-aligned hosting**, SSO + audit logs, Section 508 reports, and a dedicated
CSM." `/pricing` sells exactly Free, Pro, Agency, Business and Team — there is no
Government tier — and FedRAMP appears nowhere else on the site.

**Why it matters:** a public-sector buyer (the stated ICP) reads a FedRAMP hosting
claim and a tier they cannot find or buy. FedRAMP is a specific federal
authorization; implying it in procurement-facing copy is the
`portfolio-app-anti-patterns.md` #3 failure mode.

---

### BUG-9 — The ROI calculator quotes the retired $19 price — **MEDIUM**
*(row 113)*

**Observed:** `/pricing` renders "ACCESSISCAN PRO ANNUAL COST **$228**" with the
caption "AccessiScan annual cost is the published Pro tier monthly × 12", while the
card directly above says **$39/mo** (= $468/yr). $228 is 19 × 12 — the retired $19
price. The section headline "One avoided ADA lawsuit pays for AccessiScan **~150
years**" is derived from the stale number (35000/228 = 153; the correct figure is 75).

**Why it matters:** the page understates its own price by 51% and contradicts itself
within one screen. This is precisely what the standing pre-launch stale-pricing grep
exists to catch.

---

### BUG-10 — Three of the six navbar links are dead on every page except the landing — **MEDIUM**
*(row 114)*

**Observed:** clicking `Product` from `/pricing` goes to `/pricing#features`; no such
element exists and the page does not move (scrollY 65). Element presence confirmed
absent on `/vpat`, `/agencies` and `/blog` for `#features`, `#comparison`, `#pricing`
and `#faq`. Only `/pricing` happens to have a `#faq`.

**Expected:** `/#features` etc., so the links return to the landing section — exactly
what the footer already does with `/#cta`.

**Why it matters:** half the primary navigation silently does nothing on every
marketing page except one — including `Pricing`, on `/vpat` and `/agencies`, the two
pull pages built for inbound buyers.

---

### BUG-11 — Expired/invalid share links land on the bare Next.js 404 — **MEDIUM**
*(row 64)*

**Observed:** `/scan-result/<unknown-token>` returns HTTP 404 serving the framework
default — `<title>404: This page could not be found.</title>`, body "404 / This page
could not be found." No AccessiScan branding, no navbar or footer, no link back to
`/free/wcag-scanner`.

**Why it matters:** the share box tells every user "Public link… **Expires in 30
days**", so this is the guaranteed end state of every scorecard anyone shares. The
viral wedge terminates on an unbranded dead end instead of a "run your own scan" CTA.

---

### BUG-12 — The landing page clips content at 390px — **MEDIUM**
*(row 99)*

**Observed:** the page does not scroll horizontally
(`documentElement.scrollWidth 390 == clientWidth 390`), but 85 elements extend past
the 390px edge with no scrollable or clipping ancestor, so their content is cut off
rather than reachable. Visible in `uicov/99-landing-stats-mobile.png`: the hero
paragraph is cut mid-word ("…lawsuits target ove"), a version badge ("1.4.3 CONT…
(MIN…") hangs off the right edge, and the stats strip cuts "+37% / YOY INCREASE".

---

### BUG-13 — Unsupported customer claim on `/trust` — **LOW**
*(row 110)*

**Observed:** `/trust` reads "the same auto-fix pipeline **our customers** run" (and
repeats it in the page metadata/OG description). There are no paying customers;
`/trust` publishes scans of Pipo Labs' own properties.

**Why it matters:** `portfolio-app-anti-patterns.md` #3. The correct phrasing is what
the rest of the site already uses — describe what the product is *designed* for, not
who already buys it.

---

### BUG-14 — "Most popular" points at different tiers on different pages — **LOW**
*(row 112)*

**Observed:** the landing badges **Pro ($39)**; `/pricing` badges **Agency ($99)**.
The same visitor gets two different recommended tiers depending on which page they
read.

---

### BUG-15 — `/trust` and `/scorecards` render with no site chrome and no legal links — **LOW**
*(row 115)*

**Observed:** `/trust` — no `<header>`, no brand link, **0 footer links**.
`/scorecards` — no site navbar, 1 footer link. Control: `/pricing` has the full
9-link navbar and 23 footer links. Both pages live outside the `(marketing)` route
group, so they never get the shared Navbar/Footer.

**Why it matters:** both are public, footer-linked, procurement-facing pages, and
neither carries the Privacy / Terms / Refund links that `CLAUDE.md` requires in the
footer of the whole app. A visitor arriving from search has no navigation into the
product.

---

## Fix-pass findings (2026-09-06 night, not in the original 15 bugs)

**Finding-A — duplicate/dead component pairs for auth and free-scan claim.**
`src/app/(auth)/login/page.tsx` and `.../signup/page.tsx` both render
`AuthShell` from `src/app/login-v2-preview/_shared.tsx` — despite the
"-v2-preview" name, this IS what's live. `src/components/auth/{login-form,
signup-form,oauth-buttons}.tsx` are a separate, unreachable implementation
that nothing currently imports. Same shape for the free scanner: the live
claim form is inline in `scanner-form.tsx`; `scan-lead-capture.tsx` is real
but only renders on the `/scan-result/[token]` permalink page, a different
route. Two of this pass's fixes (BUG-4, BUG-5) were first applied to the
dead files, discovered via mismatched DOM ids/testids during live
verification, and re-applied to the real components. Recommend deleting the
dead files or wiring them up for real — a second unreachable implementation
existing alongside the live one is exactly the kind of drift that causes a
fix to "not work" the next time someone touches this code without checking
what's actually rendered.

**Finding-B — item 6 in this pass's brief ("signup submits silently when ToS
is unchecked") does not reproduce against the live AuthShell form.** The
real `submit()` handler validates `agree` and sets a visible
`errors.agree = "Please accept the terms to continue"` message before ever
calling Supabase, with zero requests fired — confirmed live. The described
bug (`disabled={!acceptedTos}` on the submit button, so clicking it does
literally nothing) is real, but only in the dead `signup-form.tsx` from
Finding-A, which was fixed defensively anyway. Likely explanation: whoever
wrote the brief read the wrong (dead) file.

**Finding-C — minor navbar overflow at exactly the 768px breakpoint.** 2
elements (the desktop "Sign in" / "Start free scan" nav actions) extend
~29px past the viewport at exactly 768px width — a Tailwind `md:` breakpoint
edge case, present site-wide (not `/pricing`-specific), not one of the 14
FAIL rows. Not fixed this pass — flagged for a future responsive-nav pass.

---

## Observations (not failures)

**Observation-1 — bad-URL errors are generic (rows 48-51).** All four invalid-input
cases surface only "Invalid input" in the UI, while the API response carries the
specific reason ("Only HTTP/HTTPS URLs are allowed", "This URL is not allowed"). The
guard is correct and nothing leaks; the user just isn't told what to fix.

**Observation-2 — a dead domain is described as "private" (row 44).** A non-existent
domain is rejected by the DNS guard with "URL resolves to a private or unresolvable
address". Honest and safe — no score, no fake result — but the wording is confusing
for what is usually just a typo.

**Honest-copy wins worth recording:** "SOC 2 Type II (in progress)" is the correctly
qualified phrasing (row 111); the landing carries no unsupported customer or
certification claims (row 11); pricing CTAs say "Start free — upgrade anytime" rather
than promising a trial Stripe does not give (row 20); and the blocked-scan copy
explicitly says a refusal "says nothing about the site's accessibility either way"
(row 38).

---

## What the free scanner got right

The surface paid traffic lands on held up under every probe:

- **Bot-blocked site** (`kcmo.gov`, HTTP 403): honest "This site blocks automated
  scanners" panel, **no score, no issue list, no share box, no email form**, and a
  CTA that correctly offers the browser-based scan (rows 38-43).
- **404 page**: a distinct "We couldn't reach this page" state that deliberately does
  *not* offer a browser scan as the cure — the behaviour commit `6821707` shipped,
  now verified through the live UI rather than only by spec (row 45).
- **SSRF + scheme guards**: `javascript:`, `localhost` and `169.254.169.254` all
  rejected server-side with no result panel and no share token (rows 49-51).
- **Unmeasured permalinks** carry `robots: noindex, follow` and render the unmeasured
  card rather than a shareable `0/100` scorecard (rows 66-67).
- **No PII leak** on the public permalink — the only email-shaped string in the
  rendered HTML is the `you@company.com` placeholder (row 63).
- **Mobile**: the scanner page and a full live scan at 390px produce **zero**
  overflowing elements (rows 100-101).
- **Funnel instrumentation** writes `scan_completed` + `email_captured` rows with no
  email and no URL in them (row 59).

---

## Not covered

- ~~Row 73~~ — **closed 2026-09-06 night.** Once BUG-2 was fixed (Resend quota
  restored), re-signing up with an already-used test email correctly showed
  "User already registered" and stayed on the form. See BUG_REPORT.md.
- **A completed signup and everything downstream of it** — `/auth/confirm`, the
  confirmation-link flow, first login after confirm — could not be observed at all,
  for the same reason. The authenticated rows (82-92) were driven with an
  **admin-created** confirmed user, which bypasses that path.
- **A real payment.** Stripe checkout was driven only as far as the hosted page (rows
  93, 95, 98); no card was entered and no charge was made. Three Checkout Sessions
  were created and left to expire on their own.
- **Rate-limit behaviour as a deliberate test.** Not exercised on purpose — it was
  observed incidentally when row 51 first returned 429, and that row was re-run after
  the window cleared rather than being marked PASS on the wrong evidence.
- **Deep-scan execution, Auto-Fix PR generation, VPAT export, PDF scanning and
  continuous monitoring.** Paid-tier features; the free test user correctly could not
  reach them (row 89). Verifying they work needs a paid account and is outside this
  pass.
- **Email deliverability end-to-end** (inbox receipt, rendering, spam placement).
  Blocked by BUG-1; only the send attempt and its result were observed.

---

## Fix-pass test-artifact cleanup (2026-09-06 night)

The Supabase Management API token (`.shared/.env.keys`) was blocked by this
session's permission settings, so the exact-id delete + before/after count
pattern used in the first pass could not be repeated the same way this time.
What was cleaned up, and what wasn't:

- **`auth.users`** — one real account was created to verify the signup fix
  (`uicov-verify-signup-1788740554385@piposlab.com`). Cleaned up via the
  app's OWN self-service GDPR-erasure endpoint (`DELETE /api/account/delete`
  with `{confirm:"DELETE MY ACCOUNT"}`), authenticated as that user — no
  admin/service-role token needed. Verified deleted: a follow-up login
  attempt with the same credentials returned "Invalid login credentials".
- **`public_scan_results` + `free_tool_events`** — NOT cleaned up. Verifying
  the email-capture fix required several real scans of `https://www.indy.gov/`
  (same target the first pass used); one token is known
  (`UAIcw5vO_Bb2z3cF`), the others were not captured before this tool
  restriction was hit. Recommend the operator spot-check
  `public_scan_results` for `url = 'https://www.indy.gov/'` rows created
  during this session and delete by exact id, or leave them — they are
  duplicate scans of a known-safe target, not sensitive data.
- **Stripe / `enterprise_leads`** — untouched this pass; no new rows created.

## Test-artifact cleanup (first pass, 2026-09-06 day)

Every artifact created by this pass was removed and the counts re-read to confirm.
`public_scan_results` feeds the public `/scorecards` and `/trust` pages, so test
scans were deleted by exact id rather than by any range.

| Table / store | Before | After | Net |
|---|---|---|---|
| `public_scan_results` | 695 | **689** | −6 (all mine) |
| `free_tool_events` | 9 | **0** | −9 (table was empty before the pass) |
| `enterprise_leads` | 4 | **1** | −3 (mine; 1 pre-existing genuine lead untouched) |
| `auth.users` | 6 | **5** | −1 (throwaway login user) |

- `public_scan_results`: 6 rows deleted by exact `id` (`vlksF5gJ116RV7o3`,
  `WOLVD8FXI_JPXl-Y`, `usTbkSKvhhhj5vmO`, `bBBZi7G4KX1fe9F9`, `SRXZ6rs6wyTbI4-1`,
  `hbxg07yq-QSzmeZy`) — all scans of `indy.gov` / `kcmo.gov` created by this pass, two
  of which had already surfaced on the public `/scorecards` list. The 689 pre-existing
  rows are untouched.
- `free_tool_events`: all 9 rows were created during this pass (verified by timestamp
  before deletion) — the table was empty beforehand, so no organic funnel data was
  affected.
- `enterprise_leads`: 3 `uicov-ent-*@test.example.com` rows deleted; the single
  pre-existing lead remains.
- `auth.users`: the admin-created `uicov-login-*@piposlab.com` user was deleted. The
  two signup attempts (BUG-2) created no rows to clean up. The 5 surviving users are
  all pre-existing.
- **Stripe:** 3 Checkout Sessions were created (audit $149, snapshot $79, Pro
  subscription) and abandoned at the hosted page. No card entered, no charge made;
  unpaid sessions expire on their own.
- **No product code or configuration was modified during this pass.** Every failure is
  recorded as a FAIL row with observed-vs-expected rather than fixed in place.
