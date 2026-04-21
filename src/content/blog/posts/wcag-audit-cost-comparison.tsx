export default function WcagCostComparison() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        Buyer question #1 when procuring a WCAG audit: &quot;what does this
        cost?&quot; The honest answer in 2026 is a wide spread — from free
        browser plugins that catch a third of violations to six-figure
        enterprise firms that catch the rest by hand. Here is what each tier
        actually includes and what trade-offs you are making.
      </p>

      <h2>The pricing landscape at a glance</h2>
      <table>
        <thead>
          <tr>
            <th>Tier</th>
            <th>Vendor examples</th>
            <th>2026 price</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free scanners</td>
            <td>WAVE, axe DevTools free, Lighthouse</td>
            <td>$0</td>
            <td>30-40% of issues (automated only)</td>
          </tr>
          <tr>
            <td>Browser tools</td>
            <td>Deque axe DevTools paid</td>
            <td>$45/user/month</td>
            <td>Same 30-40% + saved scans + guided tests</td>
          </tr>
          <tr>
            <td>Overlay widgets</td>
            <td>accessiBe, UserWay, AudioEye</td>
            <td>$49-490/month</td>
            <td>See <a href="/blog/overlay-lawsuit-guide">litigation concerns</a></td>
          </tr>
          <tr>
            <td>SMB scanners + fix code</td>
            <td>AccessiScan, Pope Tech, Sa11y</td>
            <td>$19-199/month</td>
            <td>30-40% automated + VPAT + real fix code</td>
          </tr>
          <tr>
            <td>Mid-market SaaS</td>
            <td>TestParty, Siteimprove Accessibility</td>
            <td>$12,000-50,000/year</td>
            <td>Automated + manual + ongoing monitoring</td>
          </tr>
          <tr>
            <td>Enterprise platforms</td>
            <td>Level Access, Deque Enterprise</td>
            <td>$25,000-60,000+/year</td>
            <td>Full program: tool + consultancy + training</td>
          </tr>
          <tr>
            <td>Manual audit (one-time)</td>
            <td>Independent consultants, AFB, TPGi</td>
            <td>$5,000-30,000 per audit</td>
            <td>100% if done properly; point-in-time only</td>
          </tr>
        </tbody>
      </table>

      <h2>Why the spread exists</h2>

      <h3>Automation tops out at ~35%</h3>
      <p>
        Deque&apos;s own 2024 benchmarking placed axe-core&apos;s detection
        rate at roughly 30-40% of real WCAG violations on a representative
        sample of public web pages. Every commercial scanner that relies on
        static HTML parsing hits the same ceiling: context-dependent
        criteria (meaningful sequence, sensory characteristics, use of colour
        for meaning, status messages) require human judgment or live
        assistive-technology interaction.
      </p>

      <h3>The 60-70% gap is filled by humans</h3>
      <p>
        Enterprise platforms charge what they charge because they bundle
        automation with expert review, remediation coaching, and
        assistive-technology user testing. That is genuinely different work
        than a browser plugin can do. Whether you need that depth is the
        decision.
      </p>

      <h3>SMB scanners sit between the two</h3>
      <p>
        The $19-199/month tier pairs automated scanning with concrete fix
        code per violation and a procurement-ready VPAT. You trade
        expert-driven remediation coaching for much lower price and more
        frequent re-scans. This is the tier most effective for
        engineering-heavy teams that can apply fixes themselves.
      </p>

      <h2>Which tier fits which buyer</h2>

      <h3>Public entity (DOJ Title II)</h3>
      <p>
        With the April 2026 Interim Final Rule the{" "}
        <a href="/blog/doj-title-ii-runway">Title II deadline is now April 26, 2027</a>{" "}
        for 50,000+ resident jurisdictions. Entities that already have
        accessibility coordinators typically pair (i) a mid-market scanner
        with continuous monitoring with (ii) a one-time manual audit per
        procurement cycle. Enterprise platforms are a fit for state-level
        agencies with dedicated digital accessibility teams.
      </p>

      <h3>Private SaaS serving EU users (EAA / EN 301 549)</h3>
      <p>
        The European Accessibility Act has been enforceable since June 28,
        2025 (see{" "}
        <a href="/blog/en-301-549-forbidden-ids">EN 301 549 v3.2.1 explainer</a>).
        EU public-sector buyers require evidence against EN 301 549 clauses.
        An SMB scanner that exports an EN 301 549-framed report plus a
        one-time manual audit is often enough to close B2G deals up to mid
        five figures.
      </p>

      <h3>Private SaaS serving US consumers (Title III)</h3>
      <p>
        The demand-letter volume in Title III is the primary risk. The goal
        here is documentation: a VPAT + a scan history + a remediation
        commitment in the contract. An SMB scanner with VPAT export is the
        workhorse tier; manual audits happen at major release cuts.
      </p>

      <h3>Government contractor (Section 508)</h3>
      <p>
        Section 508 requires Accessibility Conformance Reports (ACRs) using
        the VPAT template. A scanner that produces a VPAT 2.5 ACR is the
        minimum ante. Larger contracts (GSA schedules, DoD) will want a
        manual audit signed by a qualified professional.
      </p>

      <h2>Questions to ask every vendor</h2>
      <ol>
        <li>What percentage of WCAG 2.1 AA criteria does your automation
          cover end-to-end? (Expect 30-40% if honest.)</li>
        <li>Can you export a VPAT 2.5 or an EN 301 549 Conformance Report?</li>
        <li>If a screen-reader user reports a barrier after we deploy your
          product, what is the remediation path and who is accountable?</li>
        <li>Is your product an overlay / widget, or does it produce
          fix code we apply to our own codebase? (If overlay, see{" "}
          <a href="/blog/overlay-lawsuit-guide">the lawsuit guide</a>.)</li>
        <li>How many times per month/year can we re-scan?</li>
      </ol>

      <h2>Our take</h2>
      <p>
        Start with an SMB scanner that exports a VPAT and ships actual fix
        code. Reserve enterprise spend for the manual-audit layer, where
        human expertise is genuinely irreplaceable. Pay once per release
        cycle, not forever.
      </p>
      <p>
        AccessiScan sits at $19-199/month with VPAT 2.5 export, EN 301 549
        export, continuous monitoring on the Business tier, and a free
        overlay detector. Try a{" "}
        <a href="/signup">free scan</a> before committing to any vendor.
      </p>
    </article>
  );
}
