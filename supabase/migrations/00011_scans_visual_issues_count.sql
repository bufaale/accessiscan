-- AccessiScan — add missing visual_issues_count column to scans.
-- The railway worker writes this field alongside visual_score + visual_ai_summary.
-- Without it, PostgREST silently dropped the whole visual payload from the
-- update (schema cache masks missing columns), leaving Business-tier users
-- stuck on the "Unlock Visual AI" upsell even after re-scanning.

alter table public.scans
  add column if not exists visual_issues_count integer default 0;
