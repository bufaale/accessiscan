export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_plan: string;
  api_key: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  user_id: string;
  domain: string;
  name: string | null;
  latest_score: number | null;
  latest_scan_id: string | null;
  scan_count: number;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  site_id: string | null;
  url: string;
  domain: string;
  status: "pending" | "crawling" | "analyzing" | "completed" | "failed";
  scan_type: "quick" | "deep";
  progress: number;
  pages_scanned: number;
  compliance_score: number | null;
  level_a_score: number | null;
  level_aa_score: number | null;
  level_aaa_score: number | null;
  total_issues: number;
  critical_count: number;
  serious_count: number;
  moderate_count: number;
  minor_count: number;
  ai_summary: string | null;
  ai_recommendations: Recommendation[] | null;
  raw_data: unknown;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Recommendation {
  priority: number;
  title: string;
  impact: string;
  description: string;
  fix: string;
}

export interface ScanIssue {
  id: string;
  scan_id: string;
  wcag_level: "A" | "AA" | "AAA" | null;
  severity: "critical" | "serious" | "moderate" | "minor";
  impact: string | null;
  rule_id: string;
  rule_description: string;
  help_url: string | null;
  html_snippet: string | null;
  selector: string | null;
  page_url: string | null;
  fix_suggestion: string | null;
  position: number;
  created_at: string;
}

export interface ScanPage {
  id: string;
  scan_id: string;
  url: string;
  status: "pending" | "scanning" | "completed" | "failed";
  issue_count: number;
  score: number | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile };
      sites: { Row: Site };
      scans: { Row: Scan };
      scan_issues: { Row: ScanIssue };
      scan_pages: { Row: ScanPage };
      subscriptions: { Row: Subscription };
    };
  };
};
