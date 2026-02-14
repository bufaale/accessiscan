# ADA/WCAG Scanner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready ADA/WCAG compliance scanner SaaS app that checks websites against WCAG 2.1 guidelines using axe-core and generates AI fix suggestions via Claude Haiku.

**Architecture:** Next.js 16 frontend on Vercel + Railway worker (Playwright + axe-core) polling Supabase for pending scans. Supabase Realtime for progress updates. Stripe for subscriptions. Copy-and-adapt from app-01-seo-audit.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth + RLS + Realtime), Playwright, axe-core, Claude Haiku 4.5, Stripe, @react-pdf/renderer, Railway (worker)

**Reference app:** `c:/Projects/apps-portfolio/app-01-seo-audit/` — copy files from here and adapt.

---

## Task 1: Project Scaffolding + shadcn/ui Setup

**Goal:** Initialize Next.js 16 project with Tailwind CSS 4, shadcn/ui, and all boilerplate config. This is identical to what app-01 has.

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `components.json`
- Create: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

**Step 1: Initialize Next.js project**

```bash
cd c:/Projects/apps-portfolio/app-04-ada-scanner
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Accept defaults. This creates the base Next.js 16 project.

**Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js @react-pdf/renderer @ai-sdk/anthropic ai zod lucide-react next-themes sonner
npm install -D @types/node
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc color, CSS variables enabled.

**Step 4: Install shadcn/ui components**

```bash
npx shadcn@latest add button card input label badge tabs separator dropdown-menu avatar sheet sidebar dialog alert-description progress tooltip select textarea accordion
```

**Step 5: Copy config files from app-01**

Copy and adapt these files from `app-01-seo-audit/`:
- `src/lib/utils.ts` (cn utility — copy as-is)
- `src/components/theme-provider.tsx` (copy as-is)
- `src/components/theme-toggle.tsx` (copy as-is)
- `src/app/layout.tsx` — copy, change metadata title to "ADA Scanner - AI-Powered WCAG Compliance Checker", description accordingly
- `src/app/globals.css` — copy as-is (shadcn theme)
- `next.config.ts` — copy as-is

**Step 6: Create site config**

Create `src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "ADA Scanner",
  description: "AI-powered ADA/WCAG compliance scanner. Check your website against WCAG 2.1 guidelines and get actionable fix suggestions.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
} as const;
```

**Step 7: Create .env.example**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with shadcn/ui and dependencies"
```

---

## Task 2: Supabase Auth + Middleware

**Goal:** Set up Supabase client/server utilities, auth middleware, OAuth callback, login/signup pages, and signout route. Copy directly from app-01.

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/auth/confirm/route.ts`
- Create: `src/app/api/auth/signout/route.ts`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/signup-form.tsx`
- Create: `src/components/auth/oauth-buttons.tsx`

**Step 1: Copy Supabase utilities from app-01**

Copy these files exactly from `app-01-seo-audit/src/lib/supabase/`:
- `client.ts` — browser-side Supabase client
- `server.ts` — server-side client + `createAdminClient()` (service role)
- `middleware.ts` — session refresh + auth redirect logic

**Step 2: Create middleware.ts**

Copy from app-01 `src/middleware.ts`. Ensure explicit matchers:
```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
```

CRITICAL: No catch-all matcher.

**Step 3: Copy auth components from app-01**

Copy from `app-01-seo-audit/src/components/auth/`:
- `login-form.tsx` — copy as-is (includes created_at duplicate check)
- `signup-form.tsx` — copy as-is (includes created_at duplicate check)
- `oauth-buttons.tsx` — copy as-is (includes `prompt: "select_account"`)

**Step 4: Copy auth pages from app-01**

- `src/app/(auth)/layout.tsx` — copy as-is (includes "Back to home" ArrowLeft link)
- `src/app/(auth)/login/page.tsx` — copy, update metadata title to "Sign In - ADA Scanner"
- `src/app/(auth)/signup/page.tsx` — copy, update metadata title to "Sign Up - ADA Scanner"
- `src/app/(auth)/forgot-password/page.tsx` — copy, update metadata
- `src/app/(auth)/auth/confirm/route.ts` — copy as-is (OAuth callback handler)

**Step 5: Copy signout route from app-01**

Copy `src/app/api/auth/signout/route.ts` — ensure it uses `303` redirect status.

**Step 6: Verify build**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Supabase auth, middleware, login/signup pages"
```

---

## Task 3: Database Schema + Supabase Migration

**Goal:** Create all database tables (profiles, sites, scans, scan_issues, scan_pages), RLS policies, triggers, and realtime.

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`
- Create: `supabase/migrations/00002_admin_rls_policy.sql`
- Create: `supabase/migrations/00003_ada_scanner_tables.sql`

**Step 1: Copy initial schema migration from app-01**

Copy `app-01/supabase/migrations/00001_initial_schema.sql` as-is. This creates:
- `profiles` table with trigger on auth.users
- `subscriptions` table
- `ai_usage` table
- RLS policies for all tables
- `handle_new_user()` trigger function

**Step 2: Copy admin RLS migration from app-01**

Copy `app-01/supabase/migrations/00002_admin_rls_policy.sql` as-is. This creates:
- `is_admin()` security definer function
- Admin RLS policy on profiles

**Step 3: Create ADA scanner tables migration**

Create `supabase/migrations/00003_ada_scanner_tables.sql`:

```sql
-- Sites table (same as app-01)
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  domain text not null,
  name text,
  latest_score integer,
  latest_scan_id uuid,
  scan_count integer default 0,
  created_at timestamptz default now()
);

alter table public.sites enable row level security;
create policy "Users can manage own sites" on public.sites for all using (auth.uid() = user_id);
create unique index idx_sites_user_domain on public.sites(user_id, domain);

-- Scans table
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete set null,
  url text not null,
  domain text not null,
  status text not null default 'pending' check (status in ('pending', 'crawling', 'analyzing', 'completed', 'failed')),
  scan_type text not null default 'quick' check (scan_type in ('quick', 'deep')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  pages_scanned integer default 0,
  compliance_score integer check (compliance_score >= 0 and compliance_score <= 100),
  level_a_score integer,
  level_aa_score integer,
  level_aaa_score integer,
  total_issues integer default 0,
  critical_count integer default 0,
  serious_count integer default 0,
  moderate_count integer default 0,
  minor_count integer default 0,
  ai_summary text,
  ai_recommendations jsonb,
  raw_data jsonb,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.scans enable row level security;
create policy "Users can view own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on public.scans for insert with check (auth.uid() = user_id);
-- Worker updates scans via service role key (bypasses RLS)

create index idx_scans_user_id on public.scans(user_id);
create index idx_scans_status on public.scans(status);
create index idx_scans_site_id on public.scans(site_id);

-- Enable realtime for progress updates
alter publication supabase_realtime add table scans;

-- Scan issues table
create table public.scan_issues (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade not null,
  wcag_level text check (wcag_level in ('A', 'AA', 'AAA')),
  severity text not null check (severity in ('critical', 'serious', 'moderate', 'minor')),
  impact text,
  rule_id text not null,
  rule_description text not null,
  help_url text,
  html_snippet text,
  selector text,
  page_url text,
  fix_suggestion text,
  position integer default 0,
  created_at timestamptz default now()
);

alter table public.scan_issues enable row level security;
create policy "Users can view own scan issues" on public.scan_issues for select
  using (exists (select 1 from public.scans where scans.id = scan_issues.scan_id and scans.user_id = auth.uid()));

create index idx_scan_issues_scan_id on public.scan_issues(scan_id);

-- Scan pages table (for deep scans)
create table public.scan_pages (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade not null,
  url text not null,
  status text default 'pending' check (status in ('pending', 'scanning', 'completed', 'failed')),
  issue_count integer default 0,
  score integer,
  created_at timestamptz default now()
);

alter table public.scan_pages enable row level security;
create policy "Users can view own scan pages" on public.scan_pages for select
  using (exists (select 1 from public.scans where scans.id = scan_pages.scan_id and scans.user_id = auth.uid()));

create index idx_scan_pages_scan_id on public.scan_pages(scan_id);

-- Foreign key for latest_scan_id (after scans table exists)
alter table public.sites add constraint sites_latest_scan_id_fkey foreign key (latest_scan_id) references public.scans(id) on delete set null;

-- Function to update site stats when scan completes
create or replace function public.handle_scan_completed()
returns trigger as $$
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status != 'completed') then
    update public.sites
    set latest_score = NEW.compliance_score,
        latest_scan_id = NEW.id,
        scan_count = scan_count + 1
    where id = NEW.site_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_scan_completed
  after update on public.scans
  for each row execute function public.handle_scan_completed();
```

**Step 4: Apply migrations to Supabase**

Apply all 3 migrations via Supabase MCP tool (need Supabase project created first — will be created during deployment task).

**Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with sites, scans, scan_issues, scan_pages tables"
```

---

## Task 4: Types + Config + Usage

**Goal:** Create TypeScript types, Stripe plans config, and usage/credits system.

**Files:**
- Create: `src/types/database.ts`
- Create: `src/lib/stripe/plans.ts`
- Create: `src/lib/stripe/server.ts`
- Create: `src/lib/usage.ts`

**Step 1: Create database types**

Create `src/types/database.ts` with interfaces for all tables: `Profile`, `Site`, `Scan`, `ScanIssue`, `ScanPage`, `Subscription`.

Match the DB schema from Task 3. Key difference from app-01: scans have `scan_type`, `compliance_score`, `level_a/aa/aaa_score`, `pages_scanned`, `critical/serious/moderate/minor_count`. Issues have `wcag_level`, `rule_id`, `html_snippet`, `selector`, `help_url`, `fix_suggestion`.

**Step 2: Create Stripe plans config**

Copy `app-01/src/lib/stripe/plans.ts` and adapt:
- Free: 2 scans/month, quick only, no AI remediation
- Pro: $29/mo ($290/yr), 30 scans/month, quick + deep, AI remediation, PDF export
- Agency: $99/mo ($990/yr), unlimited, quick + deep, AI remediation, PDF export, API access

Change feature descriptions to accessibility-focused:
- "WCAG 2.1 compliance checks" instead of "SEO checks"
- "AI fix suggestions" instead of "AI recommendations"
- "Deep scan (up to 10 pages)" as Pro/Agency feature

**Step 3: Copy Stripe server utility**

Copy `app-01/src/lib/stripe/server.ts` as-is (creates Stripe instance).

**Step 4: Create usage/credits system**

Copy `app-01/src/lib/usage.ts` and adapt:
- `getMonthlyScanCount(userId)` — count scans where `created_at >= start of month`
- `checkScanLimit(userId, plan)` — Free: 2, Pro: 30, Agency: -1 (unlimited)
- Return `{ allowed, used, limit, canDeepScan }` — `canDeepScan: plan !== 'free'`

**Step 5: Commit**

```bash
git add src/types/ src/lib/stripe/ src/lib/usage.ts
git commit -m "feat: add types, Stripe plans, and usage limits"
```

---

## Task 5: Dashboard Layout + Sidebar

**Goal:** Create the authenticated dashboard layout with sidebar navigation, header, and stats cards.

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/dashboard/app-sidebar.tsx`
- Create: `src/components/dashboard/header.tsx`
- Create: `src/components/dashboard/stats-cards.tsx`

**Step 1: Copy dashboard layout from app-01**

Copy `app-01/src/app/(dashboard)/layout.tsx` as-is (SidebarProvider + Header + main content area).

**Step 2: Copy and adapt sidebar**

Copy `app-01/src/components/dashboard/app-sidebar.tsx` and adapt navigation:
- Main nav: Dashboard (`/dashboard`), New Scan (`/dashboard/scans/new`), Scan History (`/dashboard/scans`)
- Settings: Profile (`/settings`), Billing (`/settings/billing`)
- Admin: Admin Panel (`/admin`) — conditionally shown for admin role
- Icons: Shield (dashboard), ScanSearch (new scan), History (history)
- Site name: "ADA Scanner"

**Step 3: Copy header**

Copy `app-01/src/components/dashboard/header.tsx` as-is (sidebar trigger + theme toggle + user menu).

**Step 4: Create stats cards**

Copy `app-01/src/components/dashboard/stats-cards.tsx` and adapt stats:
- Sites Tracked (count from sites table)
- Total Scans (count from scans table)
- Avg Compliance Score (avg compliance_score from scans)
- Critical Issues (sum critical_count from recent scans)

Accept props instead of hardcoded values (lesson learned from app-09).

**Step 5: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/dashboard/
git commit -m "feat: add dashboard layout with sidebar and stats cards"
```

---

## Task 6: Dashboard Page + Settings + Admin

**Goal:** Create the main dashboard page, settings pages (profile + billing), and admin panel.

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/app/(dashboard)/settings/billing/page.tsx`
- Create: `src/app/(dashboard)/admin/page.tsx`

**Step 1: Create dashboard page**

Copy `app-01/src/app/(dashboard)/dashboard/page.tsx` and adapt:
- Fetch sites, scans (recent), and stats from Supabase
- Pass real data to StatsCards
- Sites grid: domain, scan count, latest compliance score (color-coded)
- Recent scans list: URL, compliance score, status badge, date

Replace all "audit" references with "scan".

**Step 2: Copy settings pages**

- Copy `app-01/src/app/(dashboard)/settings/page.tsx` as-is (profile update form)
- Copy `app-01/src/app/(dashboard)/settings/billing/page.tsx` — adapt plan display to use ADA Scanner plan names, capitalize plan name (lesson from app-09)

**Step 3: Copy admin page**

Copy `app-01/src/app/(dashboard)/admin/page.tsx` as-is (lists all users via `createAdminClient()`).

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/
git commit -m "feat: add dashboard, settings, and admin pages"
```

---

## Task 7: Stripe Integration (Checkout + Portal + Webhook)

**Goal:** Set up Stripe checkout, customer portal, and webhook for subscription management.

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/portal/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1: Copy checkout route from app-01**

Copy `app-01/src/app/api/stripe/checkout/route.ts` as-is. It:
- Validates price ID against known plans
- Creates/retrieves Stripe customer
- Creates checkout session with `metadata: { supabase_user_id }`
- Returns checkout URL

**Step 2: Copy portal route from app-01**

Copy `app-01/src/app/api/stripe/portal/route.ts` as-is.

**Step 3: Copy webhook route from app-01**

Copy `app-01/src/app/api/stripe/webhook/route.ts` and adapt:
- Uses `getPlanByPriceId()` to identify plans (not hardcoded — lesson from app-01)
- Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Updates `profiles.subscription_plan` and `subscriptions` table
- Uses `createAdminClient()` to bypass RLS

**Step 4: Commit**

```bash
git add src/app/api/stripe/
git commit -m "feat: add Stripe checkout, portal, and webhook routes"
```

---

## Task 8: Scan API Routes

**Goal:** Create API routes for creating scans, listing scans, getting single scan, and listing sites.

**Files:**
- Create: `src/app/api/scans/route.ts`
- Create: `src/app/api/scans/[id]/route.ts`
- Create: `src/app/api/scans/[id]/pdf/route.ts`
- Create: `src/app/api/sites/route.ts`

**Step 1: Create POST /api/scans (create scan)**

Adapt from `app-01/src/app/api/audits/route.ts`:
- Auth check via `supabase.auth.getUser()`
- Validate URL with Zod (must be valid URL, auto-add https)
- Validate `scan_type` (quick or deep)
- Check if deep scan is allowed for user's plan (`canDeepScan` from usage.ts)
- Check monthly scan limit via `checkScanLimit()`
- Find or create site by `(user_id, domain)`
- Insert scan with `status: 'pending'`, `scan_type`, `progress: 0`
- Return `{ scanId, usage: { used, limit } }`

**Step 2: Create GET /api/scans (list scans)**

Adapt from app-01:
- Paginated list of user's scans
- Optional `domain` filter
- Return `{ scans, total, page, totalPages }`

**Step 3: Create GET /api/scans/[id] (single scan)**

Adapt from app-01:
- Fetch scan with issues joined
- RLS enforces user ownership
- Include scan_pages if deep scan

**Step 4: Create GET /api/scans/[id]/pdf (export)**

Will be implemented in Task 11 (PDF generation). Create placeholder route for now.

**Step 5: Copy sites route**

Copy `app-01/src/app/api/sites/route.ts` — adapt to return sites with scan counts.

**Step 6: Commit**

```bash
git add src/app/api/
git commit -m "feat: add scan and site API routes"
```

---

## Task 9: New Scan Page (UI + Realtime)

**Goal:** Create the new scan page with URL input, scan type toggle, and real-time progress tracking.

**Files:**
- Create: `src/app/(dashboard)/dashboard/scans/new/page.tsx`

**Step 1: Build new scan page**

Adapt from `app-01/src/app/(dashboard)/dashboard/audits/new/page.tsx`:

UI:
- URL input with auto-https prepending
- Scan type toggle: Quick (default) / Deep (locked for free users, show "Pro" badge)
- "Run Scan" button (disabled while scanning)
- Progress bar + status text
- Error handling

Realtime:
- Subscribe to Supabase Realtime on `scans` table filtered by scan ID
- Polling fallback (3s interval)
- Progress phases: Pending → Loading page → Running accessibility checks → AI analysis → Complete
- Auto-redirect to `/dashboard/scans/[id]` on completion

State management:
- `url`, `scanType`, `scanning`, `progress`, `status`, `error`, `scanId`

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/scans/
git commit -m "feat: add new scan page with realtime progress tracking"
```

---

## Task 10: Scan Results Page

**Goal:** Create the scan results page with compliance scores, issue filters, and issue cards.

**Files:**
- Create: `src/app/(dashboard)/dashboard/scans/[id]/page.tsx`
- Create: `src/app/(dashboard)/dashboard/scans/page.tsx` (scan history)
- Create: `src/app/(dashboard)/dashboard/sites/[domain]/page.tsx`

**Step 1: Build scan results page**

This is the most unique page in the app. Key sections:

**Score header:**
- Large circular compliance score gauge (0-100, color-coded: green 80+, yellow 50-79, red <50)
- Three smaller gauges: Level A, Level AA, Level AAA scores
- Issue summary badges: critical (red), serious (orange), moderate (yellow), minor (blue) counts

**Filter bar:**
- WCAG Level filter: All / A / AA / AAA (toggle buttons)
- Severity filter: All / Critical / Serious / Moderate / Minor
- Category filter: dropdown with common rule categories (color-contrast, images, forms, navigation, etc.)

**Issue list:**
- Sorted by severity (critical first)
- Each issue card shows:
  - Severity badge (color-coded)
  - Rule name (e.g., "color-contrast") + WCAG level badge
  - Description from axe-core
  - HTML snippet (syntax highlighted in code block)
  - CSS selector
  - Link to WCAG reference (help_url)
  - AI fix suggestion (if available, with copy button) — show "Upgrade to Pro" if free
  - Page URL (if deep scan)

**Deep scan tab** (only shown if scan_type === 'deep'):
- Per-page breakdown table: URL, issue count, score
- Click page to filter issues by that page

**Actions bar:**
- "Re-scan" button (creates new scan with same URL)
- "Download PDF" button

**Step 2: Create scan history page**

Adapt from app-01's audit history. Table with: URL, compliance score, scan type badge, status, date. Link to results.

**Step 3: Create site detail page**

Adapt from app-01's site page. Shows all scans for a specific domain with score trend.

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/
git commit -m "feat: add scan results, history, and site detail pages"
```

---

## Task 11: PDF Report Generation

**Goal:** Create PDF export for compliance reports.

**Files:**
- Create: `src/lib/pdf/compliance-report.tsx`
- Modify: `src/app/api/scans/[id]/pdf/route.ts` (replace placeholder)

**Step 1: Create PDF report component**

Adapt from `app-01/src/lib/pdf/audit-report.tsx`. Use `@react-pdf/renderer`:

Sections:
1. **Header**: "WCAG Compliance Report" + site URL + scan date
2. **Score overview**: Compliance score (big) + Level A, AA, AAA scores
3. **Issue summary**: Counts by severity (critical/serious/moderate/minor)
4. **AI summary** (if available): Executive summary text
5. **Issues by WCAG level**: Grouped by A → AA → AAA, sorted by severity within each group
   - Each issue: severity badge, rule name, description, HTML snippet, fix suggestion
6. **Footer**: "Generated by ADA Scanner" + page numbers

**Step 2: Implement PDF API route**

```typescript
// src/app/api/scans/[id]/pdf/route.ts
import { renderToBuffer } from "@react-pdf/renderer";
// Fetch scan + issues, render PDF, return as downloadable buffer
// Filename: wcag-report-{domain}-{date}.pdf
```

**Step 3: Commit**

```bash
git add src/lib/pdf/ src/app/api/scans/
git commit -m "feat: add WCAG compliance PDF report generation"
```

---

## Task 12: Landing Page

**Goal:** Create the marketing landing page with hero, features, pricing, and FAQ.

**Files:**
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/components/landing/navbar.tsx`
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/features.tsx`
- Create: `src/components/landing/pricing.tsx`
- Create: `src/components/landing/faq.tsx`
- Create: `src/components/landing/footer.tsx`

**Step 1: Copy marketing layout from app-01**

Copy `app-01/src/app/(marketing)/layout.tsx` — wraps with Navbar + Footer.

**Step 2: Copy and adapt landing page components from app-01**

Copy all landing components from `app-01/src/components/landing/` and adapt content:

**Navbar**: Logo "ADA Scanner", nav links (Features, Pricing, FAQ), CTA "Get Started"

**Hero**:
- Badge: "AI-Powered WCAG Compliance"
- H1: "Check Your Website's ADA Compliance in Seconds"
- Subtitle: "Scan any URL against WCAG 2.1 guidelines. Get instant compliance scores and AI-generated fix suggestions."
- CTA: "Scan Your Site Free" → `/signup`

**Features** (grid of 6):
1. WCAG 2.1 Compliance — Check against Level A, AA, and AAA guidelines
2. AI Fix Suggestions — Get specific code fixes for every accessibility issue
3. Deep Scan — Scan up to 10 pages to find issues across your entire site
4. Compliance Reports — Download professional PDF reports for stakeholders
5. Issue Tracking — Monitor compliance scores over time across multiple sites
6. Legal Protection — Stay ahead of ADA lawsuits with proactive scanning

**Pricing**: 3 cards (Free/Pro/Agency) with monthly/yearly toggle. Use plans from `src/lib/stripe/plans.ts`.

**FAQ** (accordion):
- What is WCAG 2.1? → Explanation of Web Content Accessibility Guidelines
- What WCAG levels do you check? → A, AA, AAA — all in one scan
- What's the difference between Quick and Deep scan? → Single page vs up to 10 pages
- Do you provide fix suggestions? → Yes, AI-generated code fixes (Pro/Agency)
- Can I export reports? → Yes, PDF reports (Pro/Agency)

**Footer**: Links, copyright

**Step 3: Move page.tsx to (marketing) group**

The landing page lives at `src/app/(marketing)/page.tsx` which serves `/`.

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/\(marketing\)/ src/components/landing/
git commit -m "feat: add landing page with hero, features, pricing, FAQ"
```

---

## Task 13: Railway Worker — Project Setup + Browser

**Goal:** Set up the Railway worker project with Playwright browser management.

**Files:**
- Create: `railway-worker/package.json`
- Create: `railway-worker/tsconfig.json`
- Create: `railway-worker/Dockerfile`
- Create: `railway-worker/src/index.ts`
- Create: `railway-worker/src/crawler/browser.ts`

**Step 1: Create worker package.json**

Adapt from `app-01/railway-worker/package.json`:
```json
{
  "name": "ada-scanner-worker",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@supabase/supabase-js": "^2.49.4",
    "axe-core": "^4.10.0",
    "cheerio": "^1.0.0",
    "playwright": "^1.52.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

Note: No lighthouse, no chrome-launcher. axe-core runs inside Playwright's browser context.

**Step 2: Copy tsconfig from app-01 worker**

Copy `app-01/railway-worker/tsconfig.json` as-is.

**Step 3: Copy Dockerfile from app-01 worker**

Copy `app-01/railway-worker/Dockerfile` as-is (node:22-slim + Chromium + Playwright).

**Step 4: Copy browser.ts from app-01 worker**

Copy `app-01/railway-worker/src/crawler/browser.ts` and adapt:
- Change user agent to "ADAScanner/1.0"
- Keep `getBrowser()` and `fetchPage()` functions
- `fetchPage()` returns page object (not just HTML) since axe-core needs the live page

Add new function:
```typescript
export async function getPageWithBrowser(url: string): Promise<{ page: Page; loadTime: number }> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const start = Date.now();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const loadTime = Date.now() - start;
  return { page, loadTime };
}
```

**Step 5: Create index.ts entry point**

Copy `app-01/railway-worker/src/index.ts` as-is (just calls `startWorker()`).

**Step 6: Install dependencies**

```bash
cd railway-worker && npm install
```

**Step 7: Commit**

```bash
git add railway-worker/
git commit -m "feat: scaffold Railway worker with Playwright browser setup"
```

---

## Task 14: Railway Worker — axe-core Scanner

**Goal:** Implement the core accessibility scanning logic using axe-core.

**Files:**
- Create: `railway-worker/src/scanner/axe-runner.ts`
- Create: `railway-worker/src/scanner/wcag-mapper.ts`
- Create: `railway-worker/src/scanner/scorer.ts`
- Create: `railway-worker/src/scanner/link-extractor.ts`

**Step 1: Create axe-core runner**

```typescript
// railway-worker/src/scanner/axe-runner.ts
import { readFileSync } from "fs";
import { Page } from "playwright";

// Read axe-core source at module level
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");

export interface AxeResult {
  violations: AxeViolation[];
  passes: AxePass[];
  incomplete: AxeViolation[];
  inapplicable: { id: string }[];
}

export interface AxeViolation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

export interface AxePass {
  id: string;
  description: string;
  tags: string[];
  nodes: { html: string; target: string[] }[];
}

export async function runAxe(page: Page): Promise<AxeResult> {
  // Inject axe-core
  await page.evaluate(axeSource);

  // Run axe analysis
  const results = await page.evaluate(() => {
    return (window as any).axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    });
  });

  return results as AxeResult;
}
```

**Step 2: Create WCAG level mapper**

```typescript
// railway-worker/src/scanner/wcag-mapper.ts
// Maps axe-core tags to WCAG levels (A, AA, AAA)
export function getWcagLevel(tags: string[]): "A" | "AA" | "AAA" | null {
  if (tags.some(t => t.includes("wcag2aaa") || t.includes("wcag21aaa"))) return "AAA";
  if (tags.some(t => t.includes("wcag2aa") || t.includes("wcag21aa") || t.includes("wcag22aa"))) return "AA";
  if (tags.some(t => t.includes("wcag2a") || t.includes("wcag21a"))) return "A";
  return null; // best-practice or untagged
}
```

**Step 3: Create scorer**

```typescript
// railway-worker/src/scanner/scorer.ts
// Calculate compliance scores from axe-core results
// Overall: weighted by severity (critical=4, serious=3, moderate=2, minor=1)
// Per-level: filter violations by WCAG level tag, calculate pass ratio
```

Scoring formula:
- total_weight = sum of all pass weights + violation weights
- pass_weight = sum of pass weights
- score = round((pass_weight / total_weight) * 100)
- Weights: each pass = 1, violation weight = severity multiplier (critical=4, serious=3, moderate=2, minor=1)

**Step 4: Create link extractor (for deep scan)**

```typescript
// railway-worker/src/scanner/link-extractor.ts
import * as cheerio from "cheerio";

export function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const domain = new URL(baseUrl).hostname;
  const links: Set<string> = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname === domain && resolved.protocol.startsWith("http")) {
        // Normalize: remove hash, trailing slash
        resolved.hash = "";
        const normalized = resolved.toString().replace(/\/$/, "");
        if (normalized !== baseUrl.replace(/\/$/, "")) {
          links.add(normalized);
        }
      }
    } catch {}
  });

  return Array.from(links).slice(0, 9); // Max 9 additional pages
}
```

**Step 5: Commit**

```bash
git add railway-worker/src/scanner/
git commit -m "feat: add axe-core scanner, WCAG mapper, scorer, and link extractor"
```

---

## Task 15: Railway Worker — AI Summarizer

**Goal:** Implement AI-powered fix suggestions and executive summary using Claude Haiku 4.5.

**Files:**
- Create: `railway-worker/src/ai/summarizer.ts`

**Step 1: Create AI summarizer**

Adapt from `app-01/railway-worker/src/ai/summarizer.ts`:

```typescript
// railway-worker/src/ai/summarizer.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateAiSummary(scanData: {
  url: string;
  complianceScore: number;
  levelAScore: number;
  levelAAScore: number;
  levelAAAScore: number;
  issues: Array<{ ruleId: string; severity: string; description: string; wcagLevel: string; count: number }>;
}): Promise<{ summary: string; recommendations: Recommendation[] }> {
  // Prompt: Given accessibility scan results, generate:
  // 1. Executive summary (2-3 sentences)
  // 2. Top 5 prioritized recommendations with specific fix instructions
  // Use Claude Haiku 4.5 for cost efficiency
}

export async function generateFixSuggestions(issues: Array<{
  ruleId: string;
  description: string;
  htmlSnippet: string;
  selector: string;
}>): Promise<Map<string, string>> {
  // For each unique rule violation, generate a specific code fix
  // Batch issues by rule_id to reduce API calls
  // Returns Map<issueId, fixSuggestion>
}
```

Key differences from app-01:
- Prompt focuses on WCAG compliance, not SEO
- Generates per-issue fix suggestions (not just top 5)
- Groups issues by rule_id to batch fix generation

**Step 2: Commit**

```bash
git add railway-worker/src/ai/
git commit -m "feat: add AI summarizer for accessibility fix suggestions"
```

---

## Task 16: Railway Worker — Main Worker Loop

**Goal:** Implement the main polling loop that processes scans end-to-end.

**Files:**
- Create: `railway-worker/src/worker.ts`

**Step 1: Create worker**

Adapt from `app-01/railway-worker/src/worker.ts`:

```typescript
// railway-worker/src/worker.ts
// Main polling loop:
// 1. Poll Supabase every 5s for status='pending' scans
// 2. Process one scan at a time
// 3. Handle both quick and deep scans

async function processScan(scan: PendingScan) {
  try {
    // Update status: crawling
    await updateScan(scan.id, { status: "crawling", progress: 5 });

    // QUICK SCAN
    if (scan.scan_type === "quick") {
      await processQuickScan(scan);
    } else {
      await processDeepScan(scan);
    }
  } catch (error) {
    await updateScan(scan.id, { status: "failed", error_message: error.message });
  }
}

async function processQuickScan(scan: PendingScan) {
  // 1. Load page with Playwright (0-20%)
  const { page, loadTime } = await getPageWithBrowser(scan.url);
  await updateScan(scan.id, { progress: 20 });

  // 2. Run axe-core (20-60%)
  const axeResults = await runAxe(page);
  await page.close();
  await updateScan(scan.id, { progress: 60 });

  // 3. Process results (60-75%)
  const { scores, issues } = processAxeResults(axeResults, scan.url);
  await updateScan(scan.id, { progress: 75 });

  // 4. AI analysis - paid users only (75-95%)
  const profile = await getProfile(scan.user_id);
  if (profile.subscription_plan !== "free") {
    const { summary, recommendations } = await generateAiSummary({ ... });
    const fixes = await generateFixSuggestions(issues);
    // Merge fixes into issues
    await updateScan(scan.id, { progress: 95, ai_summary: summary, ai_recommendations: recommendations });
  } else {
    await updateScan(scan.id, { progress: 95 });
  }

  // 5. Save results (95-100%)
  await insertScanIssues(scan.id, issues);
  await updateScan(scan.id, {
    status: "completed",
    progress: 100,
    pages_scanned: 1,
    compliance_score: scores.overall,
    level_a_score: scores.levelA,
    level_aa_score: scores.levelAA,
    level_aaa_score: scores.levelAAA,
    total_issues: issues.length,
    critical_count: scores.criticalCount,
    serious_count: scores.seriousCount,
    moderate_count: scores.moderateCount,
    minor_count: scores.minorCount,
    raw_data: axeResults,
    completed_at: new Date().toISOString(),
  });
}

async function processDeepScan(scan: PendingScan) {
  // Same as quick but:
  // 1. Load main page, extract internal links
  // 2. Insert scan_pages records
  // 3. Loop through pages (main + up to 9 more)
  // 4. Run axe on each, aggregate results
  // 5. Deduplicate issues with same rule_id + selector
  // 6. Progress: distribute across pages
}
```

**Step 2: Add graceful shutdown**

Handle SIGINT/SIGTERM to close browser (same as app-01).

**Step 3: Build worker**

```bash
cd railway-worker && npm run build
```

**Step 4: Commit**

```bash
git add railway-worker/src/
git commit -m "feat: add main worker loop with quick and deep scan processing"
```

---

## Task 17: Deployment — Supabase + Vercel + Railway

**Goal:** Create Supabase project, apply migrations, deploy to Vercel, deploy worker to Railway.

**Step 1: Create Supabase project**

- Pause app-03 content-repurpose (to free a slot)
- Create new Supabase project "ada-scanner" in us-east-1 region
- Wait for project to be ACTIVE_HEALTHY

**Step 2: Apply database migrations**

Apply all 3 migrations via Supabase MCP tool:
1. `00001_initial_schema.sql`
2. `00002_admin_rls_policy.sql`
3. `00003_ada_scanner_tables.sql`

**Step 3: Configure Supabase Auth**

- Enable Google OAuth provider (same credentials or new ones)
- Set redirect URLs for the Vercel domain

**Step 4: Create GitHub repo**

```bash
cd c:/Projects/apps-portfolio/app-04-ada-scanner
gh repo create bufaale/ada-scanner --private --source=. --push
```

**Step 5: Deploy to Vercel**

- Link to GitHub repo
- Set environment variables (Supabase URL, keys, Stripe keys, app URL)
- Deploy

**Step 6: Create Stripe products**

- Create "Pro" product with monthly ($29) and yearly ($290) prices
- Create "Agency" product with monthly ($99) and yearly ($990) prices
- Create webhook endpoint pointing to `/api/stripe/webhook`
- Copy price IDs to Vercel env vars

**Step 7: Deploy Railway worker**

- Create new Railway project "ada-scanner-worker"
- Deploy from GitHub repo, root directory: `railway-worker`
- Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`

**Step 8: End-to-end test**

1. Sign up with Google OAuth
2. Run a quick scan on a test URL
3. Verify progress updates in real-time
4. Check scan results page
5. Download PDF report
6. Run deep scan (after upgrading plan)

**Step 9: Commit any deployment fixes**

```bash
git add -A
git commit -m "chore: deployment configuration and fixes"
git push
```

---

## Summary of Tasks

| # | Task | Key Action |
|---|------|-----------|
| 1 | Project Scaffolding | Next.js 16 + shadcn/ui + dependencies |
| 2 | Supabase Auth | Client/server, middleware, login/signup, OAuth |
| 3 | Database Schema | Migrations for sites, scans, scan_issues, scan_pages |
| 4 | Types + Config | TypeScript types, Stripe plans, usage limits |
| 5 | Dashboard Layout | Sidebar, header, stats cards |
| 6 | Dashboard Pages | Dashboard, settings, admin |
| 7 | Stripe Integration | Checkout, portal, webhook |
| 8 | Scan API Routes | Create/list/get scans, sites |
| 9 | New Scan Page | URL input, scan type toggle, realtime progress |
| 10 | Scan Results Page | Compliance scores, filters, issue cards |
| 11 | PDF Report | WCAG compliance report generation |
| 12 | Landing Page | Hero, features, pricing, FAQ |
| 13 | Worker Setup | Playwright browser, Dockerfile |
| 14 | axe-core Scanner | Core scanning, WCAG mapper, scorer |
| 15 | AI Summarizer | Fix suggestions, executive summary |
| 16 | Worker Loop | Main polling loop, quick + deep scan |
| 17 | Deployment | Supabase + Vercel + Railway + Stripe |
