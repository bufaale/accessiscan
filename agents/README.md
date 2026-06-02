# AccessiScan — engineering agent layer

Thin domain layer over the shared base at `../../.shared/agents/engineering/`.
Use the shared agents as-is; this file injects AccessiScan-specific context the
architect + specialists must know before working on this app.

## Product
AccessiScan = WCAG 2.1 AA accessibility scanner. Free lite scanner (regex over
initial HTML) + paid full scanner (Playwright crawl, AI fix-code, VPAT export,
GitHub Action). Repo `bufaale/accessiscan`, prod `accessiscan.piposlab.com`,
Supabase project APP04 (`snenfdbwuowscztwdpsd`). Stripe Pro/Agency tiers.

## Current strategic context (2026-05-30)
Revenue bet #1, current focus = web-agency ICP. The conversion fix shipped: the
free scanner shows the DIAGNOSIS free but GATES remediation (fix steps + code +
VPAT) behind free signup (`FREE_FIX_COUNT=1`, `utm_campaign=fix_unlock`). Do
NOT un-gate the fixes — that gate is the conversion mechanism being measured.

## Domain specifics every agent needs
- **Scanner engine**: lite = regex on initial HTML (`/api/free/wcag-scan`);
  full = Playwright render. Lite can't see JS-rendered content, contrast, focus
  order — the copy must be honest about that.
- **SSRF is critical here** (URL input): security-reviewer enforces the
  url-validator (block private IPs, DNS rebinding, http/https only).
- **Key surfaces**: `(marketing)/free/wcag-scanner` (the wedge),
  `scan-result/[token]` (public shareable permalink + leadgen capture + gate),
  `(marketing)/v2` landing, `/pricing`, `/enterprise`, `(dashboard)/*`.
- **public_scan_results** table holds free scans + `email_captured` leadgen.
- **Stripe tiers** in `src/lib/stripe/plans.ts` (brand string "AccessiScan";
  "ADA" only as the regulatory term in body copy).
- **Marketing CTAs route to `/free/wcag-scanner`** (the no-signup wedge), NOT
  `/signup` — except pricing-tier CTAs (high intent). Don't regress this.
- **E2E** is mature: `tests/e2e/` + `tests/helpers/test-utils.ts` +
  `tests/e2e/exhaustive/` + nightly CI. Any new feature gets a spec here.

## When the architect works on AccessiScan
Read this file + the shared architect + the app `CLAUDE.md` first. Honor the
freemium gate, the marketing-CTA routing, and the SSRF requirement. Everything
else inherits the shared engineering rules.
