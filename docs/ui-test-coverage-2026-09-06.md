# AccessiScan — 100% UI test coverage pass (live)

**Target:** `https://accessiscan.piposlab.com` — production, commit `6821707`
("fix(free-scan): don't offer a browser scan as the cure for a 404").
**Date:** 2026-09-06
**Method:** headless Chromium via Playwright 1.58.2 (resolved with `createRequire`
from `app-04-ada-scanner/node_modules`), driven by one-off scripts. Own browser
instance — no CDP attach to the operator's Chrome, no MCP browser. Every row below
was exercised against the LIVE deployment. Nothing is marked PASS from a unit test,
a local dev server, an E2E spec, or by reading source.

**Why this exists:** standing rule
`~/.claude/rules/common/ui-test-every-feature.md` — every user-reachable
functionality must be exercised through the deployed UI before it counts as done.
The rule was written after Costback shipped its differentiated CSV path having
never been touched by a browser while paid traffic was pointed at that page. The
parallel Costback pass on the same day found 5 real bugs including a completely
broken signup. AccessiScan's `/free/wcag-scanner` is the same shape of risk: it is
the paid-traffic landing page and it just received a behavioural change (the
honest blocked-site state) that had only been verified by specs.

**Enumeration was done BEFORE execution.** Routes were read from `src/app`, the
live site was walked structurally (h1 / forms / buttons / `data-testid` inventory
per route), and every row below was written with `Result = PENDING` and saved to
disk before a single assertion ran — so coverage is deliberate rather than
"whatever I happened to try".

---

## Scoreboard

| Metric | Value |
| --- | --- |
| Total rows | PENDING |
| PASS | PENDING |
| FAIL | PENDING |
| Not covered | PENDING |
| Bugs found | PENDING |

Screenshots: `…/scratchpad/uicov/`.

---

## Coverage sheet

### Landing `/`

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 1 | Landing | Page renders with the hero headline | GET + read `h1` | PENDING | | |
| 2 | Landing | Primary hero CTA navigates where it claims | click, assert landed URL | PENDING | | |
| 3 | Landing | Secondary hero CTA navigates | click, assert landed URL | PENDING | | |
| 4 | Landing | Navbar anchor `#features` target exists + scrolls | click, read `location.hash` + section rect | PENDING | | |
| 5 | Landing | Navbar anchor `#comparison` target exists + scrolls | same | PENDING | | |
| 6 | Landing | Navbar anchor `#pricing` target exists + scrolls | same | PENDING | | |
| 7 | Landing | Navbar anchor `#faq` target exists + scrolls | same | PENDING | | |
| 8 | Landing | Footer anchor `#cta` target exists (2 footer links point at it) | GET `/#cta`, assert element with that id | PENDING | | |
| 9 | Landing | Navbar route links navigate (`/enterprise`, `/overlay-detector`, `/login`, `/signup`) | click each, assert URL | PENDING | | |
| 10 | Landing | Every footer link resolves (no 404) — 23 links incl. 3 external | HTTP GET each unique href | PENDING | | |
| 11 | Landing | No false customer / certification claims in rendered copy | regex the rendered text for banned phrases | PENDING | | |
| 12 | Landing | Mobile navbar toggle opens/closes at 390px | click "Open menu" twice, read state | PENDING | | |
| 12a | Landing | DOJ countdown banner renders and ticks (hydrates off `0/00/00/00`) | read counter, wait, re-read | PENDING | | |
| 12b | Landing | Landing FAQ accordion (8 items) opens/closes | click 2 items, assert body toggles | PENDING | | |
| 12c | Landing | Landing pricing cards' CTAs navigate | click each of the 3, assert URL | PENDING | | |
| 12d | Landing | "Install GitHub App" CTA target from an anonymous page | click, observe where an anonymous visitor lands | PENDING | | |

### Pricing `/pricing`

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 13 | Pricing | 5 tier cards render with names + prices | read `tier-name-*` / `tier-price-*` | PENDING | | |
| 14 | Pricing | Prices match current pricing (Pro $39, Agency $99) — no stale pricing | compare to `src/lib/stripe/plans.ts` | PENDING | | |
| 15 | Pricing | Monthly ↔ Annual toggle changes the displayed prices | click `billing-toggle-annual`, re-read prices | PENDING | | |
| 16 | Pricing | Each tier CTA navigates where it claims | click `cta-free`, assert URL; read hrefs of all 5 | PENDING | | |
| 17 | Pricing | ROI calculator recomputes on input | fill the 3 number inputs, read the output | PENDING | | |
| 18 | Pricing | Pricing FAQ items expand/collapse | click 2 questions, assert content toggles | PENDING | | |
| 19 | Pricing | Comparison table renders | read table rows | PENDING | | |
| 20 | Pricing | Honest CTA copy (no "free trial" if Stripe charges) | read CTA labels + billing FAQ | PENDING | | |

### Other marketing pages

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 21 | `/vpat` | Renders + h1 + primary CTAs navigate | GET, read h1, click CTA | PENDING | | |
| 22 | `/agencies` | Renders + h1 + primary CTAs navigate | GET, read h1, click CTA | PENDING | | |
| 23 | `/trust` | Renders + per-property scores + badge embed | GET, read h1 + sections | PENDING | | |
| 24 | `/scorecards` | Renders + lists public scorecards, each links to a real result | GET, read cards, follow one | PENDING | | |
| 25 | `/why-not-overlays` | Renders + CTA navigates | GET, read h1, click CTA | PENDING | | |
| 26 | `/enterprise` | Renders + lead form present | GET, read h1 + form fields | PENDING | | |
| 27 | `/blog` | Index lists all posts, each card links to a real article | GET, count cards, GET each slug | PENDING | | |
| 28 | `/blog/[slug]` | An article renders (h1 + body + CTA) | GET one article | PENDING | | |
| 29 | `/blog/[slug]` | Unknown slug → 404 | GET `/blog/definitely-not-a-post` | PENDING | | |
| 30 | Legal | `/terms`, `/privacy`, `/refund` render with real content | GET each, read h1 + length | PENDING | | |

### Free WCAG scanner `/free/wcag-scanner` — the paid-traffic surface

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 31 | Free scan | Page renders with the URL form + honest "what this does NOT do" block | GET, read h1 + form | PENDING | | |
| 32 | Free scan | Normal site scans fine → real score | type `https://www.indy.gov/`, submit, read score | PENDING | | |
| 33 | Free scan | Issue list renders with rule + WCAG ref + severity + count | read issue `li`s | PENDING | | |
| 34 | Free scan | First fix is unlocked, the rest are gated (`fix-gate`) | count unlocked vs `fix-gate` | PENDING | | |
| 35 | Free scan | Unlock CTA card shows the correct remaining-fix count | read `scan-unlock-cta` | PENDING | | |
| 36 | Free scan | "Unlock fixes free" navigates to `/signup` with UTM | click `scan-unlock-signup`, assert URL | PENDING | | |
| 37 | Free scan | "Get the Legal Evidence Pack ($149)" navigates to `/audit` with UTM | click `scan-unlock-audit`, assert URL | PENDING | | |
| 38 | Free scan | **Bot-blocked site → honest blocked state** (`scan-blocked`) | scan a 403-returning host, read the panel | PENDING | | |
| 39 | Free scan | Blocked: **no score anywhere** — no `0/100`, no `null/100` | regex the whole result panel | PENDING | | |
| 40 | Free scan | Blocked: **no issue list** | assert 0 issue items | PENDING | | |
| 41 | Free scan | Blocked: **no share/permalink box** | assert `scan-permalink-share` absent | PENDING | | |
| 42 | Free scan | Blocked: **no email capture form** | assert `scan-claim-prompt` absent | PENDING | | |
| 43 | Free scan | Blocked: CTA offers the browser-based scan | read `scan-blocked-cta` label + href | PENDING | | |
| 44 | Free scan | Unreachable / non-existent domain → honest failed state (`scan-failed`) | scan a dead domain | PENDING | | |
| 45 | Free scan | 404 page (host resolves, path missing) → failed state, and does NOT claim a browser scan fixes it | scan a real host + missing path, read CTA label | PENDING | | |
| 46 | Free scan | Failed: no score, no issues, no share box, no email form | assert all four absent | PENDING | | |
| 47 | Free scan | Empty input → submit blocked, no request fired | click submit with empty field, count requests | PENDING | | |
| 48 | Free scan | Not-a-URL input (`not a url`) → honest error, no crash | submit, read `scan-error` | PENDING | | |
| 49 | Free scan | `javascript:` scheme rejected | submit `javascript:alert(1)` | PENDING | | |
| 50 | Free scan | `localhost` rejected (SSRF guard) | submit `http://localhost:3000` | PENDING | | |
| 51 | Free scan | Private IP rejected (SSRF guard) | submit `http://169.254.169.254/` | PENDING | | |
| 52 | Free scan | Share/permalink box appears on a measured scan | assert `scan-permalink-share` + input value | PENDING | | |
| 53 | Free scan | Copy-permalink button gives copied feedback | click `scan-permalink-copy`, read label | PENDING | | |
| 54 | Free scan | Share on X / LinkedIn / Email links are well-formed and carry the permalink | read the 3 hrefs | PENDING | | |
| 55 | Free scan | Email capture: valid email → success state | fill `scan-claim-email`, submit, read `scan-claim-sent` | PENDING | | |
| 56 | Free scan | **The promised email is actually SENT** (copy vs code) | inspect the claim response + Resend id + DB row | PENDING | | |
| 57 | Free scan | Email capture: invalid email blocked | fill `not-an-email`, submit | PENDING | | |
| 58 | Free scan | Email capture: re-claim with a different email → 409 handled in UI | second claim on same token | PENDING | | |
| 59 | Free scan | `free_tool_events` funnel rows are written (scan + capture) | service-role read before/after | PENDING | | |

### Share / permalink `/scan-result/[token]`

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 60 | Permalink | Renders in a FRESH logged-out context | `browser.newContext()`, goto | PENDING | | |
| 61 | Permalink | Score + issue count match the scan that produced it | read score card | PENDING | | |
| 62 | Permalink | Same freemium gate (1 fix free, rest gated) | count unlocked vs gated | PENDING | | |
| 63 | Permalink | Page leaks no PII | grep rendered HTML for the capture email / email-shaped strings | PENDING | | |
| 64 | Permalink | Invalid token → friendly state (not a stack trace) | goto a bogus token | PENDING | | |
| 65 | Permalink | Lead-capture block on the permalink page works | fill + submit | PENDING | | |
| 66 | Permalink | A blocked scan's permalink (fetched directly) shows the unmeasured card, never `0/100` | insert-free: request the blocked scan's token directly | PENDING | | |
| 67 | Permalink | Unmeasured permalink is `noindex` | read the robots meta | PENDING | | |

### Auth

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 68 | Signup | `/signup` renders the form | GET, read fields | PENDING | | |
| 69 | Signup | Invalid email blocked client-side | fill `not-an-email`, submit, count auth calls | PENDING | | |
| 70 | Signup | Weak password (<8) blocked | fill `1234567`, submit | PENDING | | |
| 71 | Signup | Terms checkbox required | submit unchecked | PENDING | | |
| 72 | Signup | **Valid signup completes** (does AccessiScan have Costback's 429 defect?) | real signup on the live site, then verify the user row via admin API | PENDING | | |
| 73 | Signup | Existing-email signup → "already exists", not a silent login | signup twice with the same address | PENDING | | |
| 74 | Login | Valid login → `/dashboard` | admin-created confirmed throwaway user | PENDING | | |
| 75 | Login | Wrong password → inline error, no enumeration leak | same user, bad password | PENDING | | |
| 76 | Login | Empty-field validation | submit empty | PENDING | | |
| 77 | Forgot pw | Reset request → non-enumerating success state | valid address | PENDING | | |
| 78 | Auth | Google OAuth button redirects to Google with a `client_id` | click, follow to final URL | PENDING | | |
| 79 | Auth | GitHub OAuth button behaves correctly (provider is DISABLED in Supabase config) | click, observe | PENDING | | |
| 80 | Auth | `/dashboard` logged-out → redirected to `/login` | fresh context, GET | PENDING | | |
| 81 | Auth | `/settings` and `/admin` logged-out → redirected | fresh context, GET each | PENDING | | |

### Authenticated app

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 82 | Dashboard | First render after login (no error card) | read h1 + `dashboard-error` absence | PENDING | | |
| 83 | Dashboard | Sidebar renders all nav items | read sidebar links | PENDING | | |
| 84 | Dashboard | `/dashboard/scans/new` reachable + renders | click sidebar item | PENDING | | |
| 85 | Dashboard | `/dashboard/scans` (history) reachable + empty state | click sidebar item | PENDING | | |
| 86 | Dashboard | `/dashboard/monitored` reachable | click sidebar item | PENDING | | |
| 87 | Dashboard | `/dashboard/pdf-scans` reachable | click sidebar item | PENDING | | |
| 88 | Settings | `/settings/profile`, `/billing`, `/github`, `/branding`, `/api-keys` all render for a free user | GET each as the logged-in user | PENDING | | |
| 89 | Tier gating | A FREE user cannot run a deep scan | attempt deep scan on `/dashboard/scans/new` | PENDING | | |
| 90 | Tier gating | A FREE user does not get admin (`/admin` blocked) | GET `/admin` as the free user | PENDING | | |
| 91 | Tier gating | Billing page shows the Free plan + upgrade path | read `/settings/billing` | PENDING | | |
| 92 | Auth | Sign out works and re-gates `/dashboard` | click sign out, re-request `/dashboard` | PENDING | | |

### Paid funnels

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 93 | `/audit` | $149 form validates + reaches Stripe checkout | fill `audit-url` + `audit-email`, submit, follow redirect | PENDING | | |
| 94 | `/audit` | Invalid input rejected (bad URL / bad email) | submit garbage | PENDING | | |
| 95 | `/snapshot` | $79 form validates + reaches Stripe checkout | fill `snapshot-url` + `snapshot-email`, submit | PENDING | | |
| 96 | `/enterprise` | Lead form submits and is persisted | fill + submit, verify DB row | PENDING | | |
| 97 | `/overlay-detector` | URL check returns a real verdict | submit a known-overlay-free URL | PENDING | | |
| 98 | Pricing→checkout | A logged-in free user clicking a paid tier CTA reaches Stripe | click `cta-pro` while logged in | PENDING | | |

### Mobile 390px

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 99 | Mobile | Landing: zero horizontal overflow | 390×844, measure + list offenders | PENDING | | |
| 100 | Mobile | Free scanner: zero horizontal overflow | 390×844, measure | PENDING | | |
| 101 | Mobile | Free scanner: a real scan completes and the result panel fits | run a scan at 390px | PENDING | | |
| 102 | Mobile | Pricing: zero horizontal overflow | 390×844, measure | PENDING | | |

### Cross-cutting

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 103 | X-cut | Zero unexpected console errors on every public route | walk all public routes, collect `console[error]` + `pageerror` | PENDING | | |
| 104 | X-cut | `/sitemap.xml` 200 and every URL in it resolves | GET + parse + GET each `<loc>` | PENDING | | |
| 105 | X-cut | `/robots.txt` 200 and does not block AI crawlers | GET | PENDING | | |
| 106 | X-cut | Security headers present on `/` | read response headers | PENDING | | |
| 107 | X-cut | `/api/health` reports healthy | GET | PENDING | | |

### Copy integrity & cross-page consistency (visible-in-UI claims)

| # | Surface | Functionality | How tested | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 108 | `/pricing` vs `/refund` | Refund window is consistent | read both pages' rendered text | PENDING | | |
| 109 | Landing FAQ | The tiers named in the FAQ actually exist on `/pricing` | read FAQ text, compare to tier names | PENDING | | |
| 110 | `/trust` | No unsupported customer claims | regex rendered text for "our customers" etc. | PENDING | | |
| 111 | `/pricing` | Certification claims are honest (SOC 2 etc.) | read the rendered badge list | PENDING | | |
| 112 | Landing vs `/pricing` | "Most popular" badge sits on the same tier | read both | PENDING | | |
| 113 | `/pricing` | ROI calculator's stated AccessiScan cost matches real pricing | read the computed output | PENDING | | |
| 114 | Cross-page | Navbar hash anchors resolve from a non-landing page | click `#features` from `/pricing`, measure scroll | PENDING | | |
| 115 | `/trust`, `/scorecards` | Navbar + footer present (they live outside the marketing group) | GET each, assert nav/footer | PENDING | | |
| 116 | Landing | Hard statistics carry a source the reader can see | read the stats strip + captions | PENDING | | |

---

## Bugs found

PENDING — filled in as rows are executed.

---

## Not covered

PENDING.

---

## Test-artifact cleanup

PENDING.
