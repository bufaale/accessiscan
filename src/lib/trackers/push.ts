/**
 * Issue tracker push engine.
 *
 * One function per provider that takes the scan_issue + integration config
 * and creates a ticket via the provider's public REST API. Returns an
 * external id + url so we can log the push.
 *
 * Design choices:
 *  - No SDKs — fetch only. Keeps the bundle tiny.
 *  - Plain Basic / Bearer auth per provider's documented endpoint.
 *  - We return the ticket URL, never the raw token.
 */

export interface ScanIssueSummary {
  id: string;
  rule_id: string;
  rule_description: string;
  severity: string;
  impact: string | null;
  page_url: string | null;
  html_snippet: string | null;
  selector: string | null;
  help_url: string | null;
  fix_suggestion: string | null;
  wcag_level: string | null;
}

export interface JiraConfig {
  jira_site: string;
  jira_email: string;
  jira_project_key: string;
  jira_api_token: string;
}

export interface LinearConfig {
  linear_team_id: string;
  linear_api_key: string;
}

export interface GithubConfig {
  github_owner: string;
  github_repo: string;
  github_token: string;
  github_default_labels?: string[] | null;
}

export interface PushResult {
  external_id: string;
  external_url: string;
}

function buildTitle(issue: ScanIssueSummary): string {
  const severity = issue.severity.toUpperCase();
  return `[a11y ${severity}] ${issue.rule_id}: ${issue.rule_description.slice(0, 100)}`;
}

function buildMarkdownBody(issue: ScanIssueSummary): string {
  const lines = [
    `**WCAG violation:** ${issue.rule_id}`,
    issue.wcag_level ? `**Level:** ${issue.wcag_level}` : null,
    `**Severity:** ${issue.severity}`,
    issue.impact ? `**Impact:** ${issue.impact}` : null,
    issue.page_url ? `**Page:** ${issue.page_url}` : null,
    issue.selector ? `**Selector:** \`${issue.selector}\`` : null,
    "",
    "### Description",
    issue.rule_description,
  ];
  if (issue.html_snippet) {
    lines.push("", "### Offending HTML", "```html", issue.html_snippet, "```");
  }
  if (issue.fix_suggestion) {
    lines.push("", "### Suggested fix", issue.fix_suggestion);
  }
  if (issue.help_url) {
    lines.push("", `Reference: ${issue.help_url}`);
  }
  lines.push("", "_Pushed from AccessiScan._");
  return lines.filter((l) => l !== null).join("\n");
}

export async function pushToJira(
  config: JiraConfig,
  issue: ScanIssueSummary,
): Promise<PushResult> {
  const site = config.jira_site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${site}/rest/api/3/issue`;
  const auth = Buffer.from(
    `${config.jira_email}:${config.jira_api_token}`,
  ).toString("base64");

  const body = {
    fields: {
      project: { key: config.jira_project_key },
      summary: buildTitle(issue),
      issuetype: { name: "Bug" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: buildMarkdownBody(issue) }],
          },
        ],
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { id: string; key: string };
  return {
    external_id: json.key,
    external_url: `https://${site}/browse/${json.key}`,
  };
}

export async function pushToLinear(
  config: LinearConfig,
  issue: ScanIssueSummary,
): Promise<PushResult> {
  const query = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier url }
      }
    }
  `;
  const variables = {
    input: {
      teamId: config.linear_team_id,
      title: buildTitle(issue),
      description: buildMarkdownBody(issue),
    },
  };

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.linear_api_key,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Linear API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    data?: { issueCreate?: { success: boolean; issue?: { id: string; identifier: string; url: string } } };
    errors?: Array<{ message: string }>;
  };
  const created = json.data?.issueCreate;
  if (!created?.success || !created.issue) {
    const msg = json.errors?.[0]?.message ?? "Unknown Linear error";
    throw new Error(`Linear create failed: ${msg}`);
  }
  return {
    external_id: created.issue.identifier,
    external_url: created.issue.url,
  };
}

export async function pushToGithub(
  config: GithubConfig,
  issue: ScanIssueSummary,
): Promise<PushResult> {
  const url = `https://api.github.com/repos/${config.github_owner}/${config.github_repo}/issues`;
  const body: Record<string, unknown> = {
    title: buildTitle(issue),
    body: buildMarkdownBody(issue),
  };
  if (config.github_default_labels && config.github_default_labels.length > 0) {
    body.labels = config.github_default_labels;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.github_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { number: number; html_url: string };
  return {
    external_id: String(json.number),
    external_url: json.html_url,
  };
}
