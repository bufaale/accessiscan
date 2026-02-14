# App #4 - ADA/WCAG Scanner Design

## Overview

AI-powered ADA/WCAG compliance scanner that checks websites against WCAG 2.1 guidelines (A, AA, AAA) and generates AI fix suggestions. Reuses app-01's architecture pattern (Railway worker + Supabase + Vercel) with axe-core for accessibility analysis instead of SEO analyzers.

**Pricing**: Free (2 scans/mo, quick only) | Pro $29/mo (30 scans, quick + deep) | Agency $99/mo (unlimited, quick + deep)

## Architecture

```
User -> Next.js Frontend -> POST /api/scans -> Supabase (status: pending)
                                                    |
Railway Worker (polls every 5s) <- picks up pending scans
    |
    Playwright (load page) -> axe-core (inject + run) -> AI analysis (Claude Haiku)
    |
    Results -> Supabase (status: completed) -> Realtime -> Frontend updates
```

- Separate Railway project (not shared with app-01)
- axe-core only (no Lighthouse)
- Reports all WCAG levels (A/AA/AAA), user filters in UI

## Scan Modes

- **Quick Scan** (all users): Single page, axe-core analysis
- **Deep Scan** (Pro/Agency only): Crawls up to 10 internal pages, aggregates issues. Counts as 1 credit.

## Database Schema

### profiles (from boilerplate)
Standard auth profile with Stripe fields, subscription_plan, role.

### sites
```
id, user_id, domain, name, latest_score, latest_scan_id, scan_count
UNIQUE(user_id, domain)
```

### scans
```
id, user_id, site_id, url, domain
status: pending | crawling | analyzing | completed | failed
scan_type: quick | deep
progress: 0-100
pages_scanned: integer
compliance_score: integer (0-100, weighted)
level_a_score, level_aa_score, level_aaa_score: integer
total_issues, critical_count, serious_count, moderate_count, minor_count: integer
ai_summary: text (paid only)
ai_recommendations: jsonb
raw_data: jsonb
error_message: text
completed_at: timestamptz
```

Realtime enabled on scans table.

### scan_issues
```
id, scan_id
wcag_level: A | AA | AAA
severity: critical | serious | moderate | minor
impact: text
rule_id: text (e.g., "color-contrast", "image-alt")
rule_description: text
help_url: text
html_snippet: text
selector: text
page_url: text (for deep scans)
fix_suggestion: text (AI-generated)
position: integer
```

### scan_pages (deep scans only)
```
id, scan_id, url, status, issue_count, score
```

## Railway Worker

### Quick Scan Flow
1. Pick up pending scan (poll every 5s)
2. Launch page with Playwright (0-20%)
3. Inject axe-core and run analysis (20-60%)
4. Process results: map violations to WCAG levels, calculate scores (60-75%)
5. AI remediation with Claude Haiku 4.5 - fix suggestions per issue (75-95%, paid only)
6. Insert issues, update scan with scores, status=completed (95-100%)

### Deep Scan Flow
Same as quick but after loading main page:
- Extract internal links from the page
- Visit up to 9 more pages (10 total max)
- Run axe-core on each
- Aggregate and deduplicate issues
- Progress distributed across pages

### axe-core Integration
```javascript
await page.evaluate(axeSource);  // inject axe-core
const results = await page.evaluate(() => axe.run());
// results.violations, results.passes, results.incomplete
```

### Scoring
- compliance_score = (passes / (passes + violations)) * 100, weighted by severity
- Per-level scores: same formula filtered by WCAG level tag
- Severity maps directly from axe-core impact (critical/serious/moderate/minor)

### Dependencies
playwright, axe-core, cheerio, @anthropic-ai/sdk, @supabase/supabase-js

### Dockerfile
Same as app-01: node:22-slim + system Chromium + Playwright

## Frontend Pages

### Landing Page (/)
Hero: "AI-Powered ADA/WCAG Compliance Scanner"
Value props, pricing (3 tiers), CTA

### New Scan (/dashboard/scans/new)
URL input + scan type toggle (Quick/Deep, deep locked for free with upgrade badge)
Real-time progress via Supabase Realtime + polling fallback
Auto-redirect to results on completion

### Scan Results (/dashboard/scans/[id])
- Compliance score gauge (0-100) + per-level badges (A/AA/AAA scores)
- Issue summary: critical/serious/moderate/minor counts
- Filter bar: by WCAG level, severity, category
- Issue cards: severity icon, rule name, description, HTML snippet, CSS selector, WCAG ref link, AI fix (paid, copyable)
- Deep scan tab: per-page breakdown
- Actions: Re-scan, Download PDF

### Dashboard (/dashboard)
Stats cards, sites grid, recent scans list

### Settings
Profile, billing, admin - copied from app-01

### PDF Report
@react-pdf/renderer: compliance score, level breakdown, issue summary, AI summary (paid), issues by level/severity

## Credits System
- Free: 2/month (quick only)
- Pro: 30/month (quick + deep)
- Agency: unlimited (quick + deep)
- Deep scan = 1 credit regardless of pages crawled
- Enforced in POST /api/scans

## What's Copied from App-01
- Auth system, middleware, OAuth, signup/login
- Settings pages, admin panel
- Stripe integration (webhook, checkout, portal, plans config)
- Credits/usage tracking
- Dashboard layout
- PDF generation pattern
- Real-time progress UI pattern

## What's New
- Worker: axe-core instead of Lighthouse + SEO analyzers
- Deep scan: multi-page crawling + issue aggregation
- Results UI: WCAG level filters, HTML snippet display
- Scoring: compliance-based
- scan_issues schema with WCAG-specific fields
- scan_pages table
- Landing page content
