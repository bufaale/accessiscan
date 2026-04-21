# AccessiScan GitHub Action

Run WCAG 2.1 AA accessibility checks on every pull request. Fails the build when critical or serious violations appear, posts a summary comment on the PR, and uploads a full JSON report as an artifact.

## Usage

```yaml
name: Accessibility
on:
  pull_request:
    branches: [main]

jobs:
  a11y:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: bufaale/accessiscan-action@v1
        with:
          url: https://${{ github.event.pull_request.head.ref }}--my-app.vercel.app
          fail-on: serious
          wcag-level: wcag21aa
```

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `url` | yes | — | URL to scan (preview deploy, staging, or a localhost URL after `npm run start &`) |
| `fail-on` | no | `serious` | Severity that fails the build: `critical`, `serious`, `moderate`, `minor`, or `none` |
| `wcag-level` | no | `wcag21aa` | Axe tag: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` |
| `comment-on-pr` | no | `true` | Post a summary comment on the PR |

## Outputs

| Name | Description |
|------|-------------|
| `total-violations` | Total violations found |
| `critical` | Count of critical violations |
| `serious` | Count of serious violations |
| `report-path` | Path to the full JSON report (also uploaded as `accessiscan-report` artifact) |

## Why use this

- **WCAG 2.1 AA enforcement in CI** — catch issues before they ship, not after a lawsuit. ADA website lawsuits hit 5,100+ federal filings in 2025 (+37% YoY).
- **DOJ Title II deadline April 24, 2026** — public entities with 50K+ residents must comply.
- **No overlay** — this runs real axe-core on the rendered DOM, unlike widget-based "fixes" that the FTC fined $1M.

Want AI-powered fix code, VPAT 2.5 reports for government procurement, and deep-crawl scans? [Get AccessiScan →](https://app-04-ada-scanner.vercel.app)
