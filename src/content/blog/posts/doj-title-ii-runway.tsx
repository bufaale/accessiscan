export default function DojTitleIiRunway() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        On April 20, 2026 the U.S. Department of Justice published an Interim
        Final Rule (IFR) that extends the compliance deadlines of the Title
        II web and mobile accessibility rule by one year across the board.
        The substantive technical standard — WCAG 2.1 Level AA — is
        unchanged. This is extra runway for state and local governments, not
        a reprieve from the obligation.
      </p>

      <h2>The new deadline table</h2>
      <table>
        <thead>
          <tr>
            <th>Entity size</th>
            <th>Old deadline</th>
            <th>New deadline (April 2026 IFR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Public entities with 50,000 or more residents, and all non-special-district state / territorial entities</td>
            <td>April 24, 2026</td>
            <td><strong>April 26, 2027</strong></td>
          </tr>
          <tr>
            <td>Public entities with fewer than 50,000 residents, and all special district governments</td>
            <td>April 26, 2027</td>
            <td><strong>April 26, 2028</strong></td>
          </tr>
        </tbody>
      </table>

      <h2>Why DOJ moved the deadlines</h2>
      <p>
        The IFR preamble cites three reasons:
      </p>
      <ul>
        <li>
          <strong>Implementation-capacity concerns</strong> raised by small and
          mid-sized jurisdictions during the rule&apos;s 30-month
          implementation window.
        </li>
        <li>
          <strong>Coordination with emerging standards work</strong> — the
          rule references WCAG 2.1 AA but the W3C has published WCAG 2.2.
          DOJ wants to allow jurisdictions to avoid re-work if they adopt the
          later version.
        </li>
        <li>
          <strong>Vendor bandwidth.</strong> The market for procurement-grade
          WCAG audits at SMB price is still maturing; extending deadlines
          avoids a procurement squeeze.
        </li>
      </ul>

      <h2>What did NOT change</h2>
      <ul>
        <li>
          The technical standard. WCAG 2.1 Level A and AA remain the
          baseline. Jurisdictions may meet the obligation by conforming to
          WCAG 2.2 AA; 2.2 is a superset.
        </li>
        <li>
          The scope. Every public-facing web page, web application, mobile
          app, and digital document maintained by a state or local entity.
        </li>
        <li>
          The remediation expectation. The rule still expects fixed code,
          not overlay widgets. (See our{" "}
          <a href="/blog/overlay-lawsuit-guide">overlay lawsuit guide</a> for
          the litigation record on widget-based compliance attempts.)
        </li>
        <li>
          The documentation expectation. Conformance should be evidenced via
          a VPAT 2.5 Accessibility Conformance Report, kept current as the
          site evolves.
        </li>
      </ul>

      <h2>What this means for your procurement timeline</h2>

      <h3>Large jurisdictions (50,000+)</h3>
      <p>
        You now have ~12 months to produce a documented conformance posture
        for your primary web properties. Practical cadence:
      </p>
      <ul>
        <li>Months 1-2: automated baseline scan + overlay detection across all public properties. Remove overlays that create litigation exposure.</li>
        <li>Months 3-6: remediation — contract engineering time against the failed success criteria, batch by section of the site.</li>
        <li>Months 7-9: manual audit by a qualified professional against any remaining criteria that automation cannot verify.</li>
        <li>Months 10-12: re-scan, produce VPAT 2.5, publish accessibility statement, file conformance evidence with the ADA coordinator.</li>
      </ul>

      <h3>Small jurisdictions (under 50,000) + special districts</h3>
      <p>
        With ~24 months you can sequence: pilot with one property (months
        1-3), roll the process to all properties (months 4-18), run a
        pre-deadline audit (months 19-21), close remaining findings (months
        22-24). The time advantage disappears fast once you add procurement
        cycles.
      </p>

      <h2>Budget guidance (2026 prices)</h2>
      <p>
        Per our{" "}
        <a href="/blog/wcag-audit-cost-comparison">2026 WCAG audit cost
        comparison</a>, a defensible Title II programme for a mid-sized city
        looks like:
      </p>
      <ul>
        <li>Automated continuous scanning: $2,400-$6,000 per year (SMB tier)</li>
        <li>Engineering remediation: $20,000-$80,000 one-time depending on content volume</li>
        <li>Manual audit by qualified firm: $5,000-$15,000 per audit cycle</li>
        <li>ADA coordinator training: $1,500-$5,000 per year</li>
      </ul>
      <p>
        Compare this to the cost profile of even a single federal ADA
        Title II complaint investigation — typically tens of thousands in
        remediation + attorney time — and the math is straightforward.
      </p>

      <h2>Common pitfalls we see in public-sector procurement</h2>
      <ol>
        <li>
          <strong>Buying a widget to tick the accessibility box.</strong> The
          FTC&apos;s $1M consent order against accessiBe, the UserWay class
          action, and the AudioEye 10-K risk disclosures all say the same
          thing: widgets do not meet the standard.
        </li>
        <li>
          <strong>Taking the vendor&apos;s compliance score at face
          value.</strong> The number only reflects the automated slice
          (30-40%). Ask what percentage of WCAG 2.1 AA the vendor&apos;s
          automation covers.
        </li>
        <li>
          <strong>Running one audit and calling it done.</strong> The rule
          applies to the site as it evolves; continuous monitoring is how
          entities stay in compliance between procurement cycles.
        </li>
      </ol>

      <h2>How AccessiScan fits</h2>
      <p>
        AccessiScan&apos;s Government & Enterprise procurement pack exports a
        VPAT 2.5 Accessibility Conformance Report automatically from every
        scan. The Business tier adds continuous monitoring with regression
        alerts — when a content edit breaks a criterion that was previously
        passing, the ADA coordinator gets an email within 24 hours. Priced
        at $199/month, that is 5-10% of what an enterprise platform charges
        for the same coverage level. <a href="/signup">Start a free
        Title II scan</a> on any public URL.
      </p>

      <h2>References</h2>
      <ul>
        <li>28 CFR Part 35, Nondiscrimination on the Basis of Disability in State and Local Government Services</li>
        <li>DOJ Interim Final Rule, 90 Fed. Reg. (April 2026), extending compliance dates to April 26, 2027 and April 26, 2028</li>
        <li>WCAG 2.1 W3C Recommendation (June 2018) and WCAG 2.2 W3C Recommendation (October 2023)</li>
      </ul>
    </article>
  );
}
