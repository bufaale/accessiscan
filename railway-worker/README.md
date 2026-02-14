# ADA Scanner Worker

Railway worker service for processing ADA/WCAG accessibility scans using Playwright and axe-core.

## Architecture

### Core Components

1. **Browser Management** (`src/crawler/browser.ts`)
   - Singleton Chromium instance via Playwright
   - Returns live Page objects for axe-core injection
   - User-Agent: "ADAScanner/1.0"

2. **axe-core Runner** (`src/scanner/axe-runner.ts`)
   - Injects axe-core library into browser context
   - Runs WCAG 2.0/2.1/2.2 Level A/AA/AAA checks
   - Returns violations, passes, incomplete, and inapplicable results

3. **WCAG Mapping** (`src/scanner/wcag-mapper.ts`)
   - Maps axe-core tags to WCAG levels (A, AA, AAA)
   - Orders issues by severity (critical > serious > moderate > minor)

4. **Scoring System** (`src/scanner/scorer.ts`)
   - Overall compliance score (0-100)
   - Per-level scores (A, AA, AAA)
   - Counts by severity (critical, serious, moderate, minor)

5. **Link Extraction** (`src/scanner/link-extractor.ts`)
   - Finds internal links for deep scans
   - Max 10 pages total (1 main + 9 additional)

6. **AI Summarizer** (`src/ai/summarizer.ts`)
   - Claude Haiku 4.5 for cost efficiency
   - Executive summary + 5 prioritized recommendations
   - Per-rule fix suggestions (max 15 rules to control costs)
   - **Only runs for paid users**

### Scan Types

#### Quick Scan
- Single page analysis
- Progress: 0-20% (load) → 20-60% (axe) → 60-75% (process) → 75-95% (AI) → 95-100% (save)
- AI analysis only for paid plans

#### Deep Scan
- Up to 10 pages (main page + 9 internal links)
- Progress: 0-10% (main) → 10-15% (extract) → 15-60% (scan pages) → 60-75% (aggregate) → 75-95% (AI) → 95-100% (save)
- Deduplicates issues: same rule + selector + page = one issue
- Aggregates scores across all pages
- Creates `scan_pages` records for tracking
- AI analysis only for paid plans

### Data Flow

```
Supabase `scans` table (status: pending)
    ↓
Worker polls every 5s
    ↓
Update status to "crawling"
    ↓
Load page(s) with Playwright
    ↓
Inject axe-core and run analysis
    ↓
Update status to "analyzing"
    ↓
Calculate scores + process issues
    ↓
[PAID ONLY] Generate AI summary + fix suggestions
    ↓
Insert issues to `scan_issues` (batches of 50)
    ↓
Update scan with final results (status: completed)
```

## Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Bypasses RLS
ANTHROPIC_API_KEY=your-anthropic-api-key         # For AI summaries
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium  # Auto-set in Railway
```

## Database Schema

### scans
- `status`: pending | crawling | analyzing | completed | failed
- `progress`: 0-100
- `scan_type`: quick | deep
- `compliance_score`: Overall 0-100 score
- `level_a_score`, `level_aa_score`, `level_aaa_score`: Per-level scores
- `total_issues`, `critical_count`, `serious_count`, `moderate_count`, `minor_count`
- `ai_summary`: Executive summary (paid only)
- `ai_recommendations`: Array of recommendations (paid only)
- `raw_data`: Full axe-core results (JSONB)
- `error_message`: If status = failed

### scan_issues
- `scan_id`: FK to scans
- `wcag_level`: A | AA | AAA | null (best-practice)
- `severity`: critical | serious | moderate | minor
- `rule_id`: axe-core rule ID (e.g., "color-contrast")
- `rule_description`: Human-readable description
- `help_url`: Link to axe documentation
- `html_snippet`: First 500 chars of failing HTML
- `selector`: CSS selector path
- `page_url`: Where issue was found
- `fix_suggestion`: AI-generated fix (paid only)
- `position`: Sort order by severity

### scan_pages (deep scans only)
- `scan_id`: FK to scans
- `url`: Page URL
- `status`: pending | scanning | completed | failed
- `issue_count`: Number of issues found
- `score`: Overall score for this page

## Development

```bash
# Install dependencies
npm install

# Run locally (needs .env file)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## Railway Deployment

1. **Create Railway Project**
   - New project from GitHub repo
   - Select `app-04-ada-scanner/railway-worker` as root directory

2. **Set Environment Variables**
   - Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`
   - `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is set automatically by Dockerfile

3. **Deploy**
   - Railway auto-detects Dockerfile
   - Builds: installs system Chromium → npm install → npm run build
   - Runs: `node dist/index.js`

4. **Monitor**
   - Watch logs for scan processing
   - Check for "Polling for scans..." on startup
   - Each scan logs: `[scan_id] Loading page...` → `Score: X/100`

## Cost Optimization

- Uses Claude Haiku 4.5 (cheapest model)
- AI summary: ~1000 tokens input, ~1024 tokens output per scan
- Fix suggestions: ~500 tokens per rule, max 15 rules per scan
- **Total AI cost per deep scan: ~$0.02-0.04 for paid users**
- Free users get no AI analysis (just raw axe-core data)

## Error Handling

- Network timeouts: 30s per page load
- Failed pages in deep scans: marked as failed in `scan_pages`, continue with others
- Scan failures: set `status = failed`, `error_message` in `scans` table
- Browser crashes: graceful shutdown on SIGINT/SIGTERM

## Key Differences from SEO Worker

1. **No Lighthouse** - uses axe-core instead (accessibility-focused)
2. **Returns Page objects** - browser.ts returns live Page for axe injection
3. **WCAG scoring** - three separate scores (A, AA, AAA) + overall
4. **Link extraction** - shallow crawl for deep scans (max 10 pages)
5. **AI only for paid** - Free tier gets raw data, paid gets analysis + fixes
