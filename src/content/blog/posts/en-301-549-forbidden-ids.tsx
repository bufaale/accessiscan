export default function EnForbIds() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        EN 301 549 is the harmonised European accessibility standard that
        public-sector procurement across the EU cites by reference. Version
        3.2.1 — published in March 2024 — is the edition that implements the
        European Accessibility Act (Directive 2019/882) which became
        enforceable on June 28, 2025. If you sell digital products to EU
        public buyers or to private companies obligated under the EAA, EN
        301 549 v3.2.1 is the reference you will be audited against.
      </p>

      <h2>The structure of the standard (15 minutes to orient)</h2>
      <ol>
        <li><strong>Clauses 4-5:</strong> general guidance, scope, terminology.</li>
        <li><strong>Clause 6:</strong> ICT that acts as a communication tool (telephony, real-time text, video).</li>
        <li><strong>Clause 7:</strong> ICT with video capabilities (captions, audio description, media controls).</li>
        <li><strong>Clause 8:</strong> hardware (keys, input mechanisms, haptic feedback, biometric identification).</li>
        <li><strong>Clause 9:</strong> web — <em>this is where WCAG 2.1 Level A and AA are incorporated by reference, with every success criterion added as a mandatory requirement</em>.</li>
        <li><strong>Clause 10:</strong> non-web documents (PDFs, Word docs, etc.) — a parallel set of requirements.</li>
        <li><strong>Clause 11:</strong> non-web software (desktop apps, mobile apps).</li>
        <li><strong>Clause 12:</strong> documentation and support services.</li>
        <li><strong>Clause 13:</strong> additional ICT requirements for communication with emergency services.</li>
        <li><strong>Annexes A-E:</strong> relation to the mandate and to Directive (EU) 2016/2102.</li>
      </ol>

      <h2>What version 3.2.1 added vs 3.1.1</h2>
      <p>
        The delta is small in volume but material in scope for procurement
        teams:
      </p>
      <ul>
        <li>
          <strong>WCAG 2.2 alignment pending.</strong> v3.2.1 still references
          WCAG 2.1 AA as the normative web standard. The EU standardisation
          bodies (CEN, CENELEC, ETSI) have signalled that a subsequent revision
          will align with WCAG 2.2. Contracts signed in 2026 should keep this
          upgrade path in mind; AccessiScan ships WCAG 2.2 support today so
          buyers do not carry the risk.
        </li>
        <li>
          <strong>Revised document testing clauses (10.x).</strong> Non-web
          documents now have clearer expectations around structural tags,
          alternate text for images, and table markup.
        </li>
        <li>
          <strong>Evidence and procurement language.</strong> Annex A was
          updated so that procuring bodies can reference &quot;functional
          performance statements&quot; — a test-what-the-user-can-actually-do
          framing — in addition to success-criterion compliance.
        </li>
      </ul>

      <h2>What EAA enforcement looks like since June 28 2025</h2>
      <p>
        The EAA is a directive, so each EU member state has its own
        implementing law and its own supervisory body. The common structure:
      </p>
      <ul>
        <li>
          Covered products and services include banking (except B2B-only),
          e-commerce, e-books and e-reading software, passenger transport
          ticketing and boarding, and emergency communications access.
        </li>
        <li>
          Micro-enterprises (fewer than 10 employees AND annual turnover under
          €2M) are exempt from services obligations. Most SaaS companies exit
          this exemption quickly.
        </li>
        <li>
          Penalties range by member state but are generally in the
          €50,000-€300,000 range per violation with cumulative caps.
        </li>
        <li>
          Market surveillance authorities can require conformity evidence —
          typically an EN 301 549 Conformance Report — on demand.
        </li>
      </ul>

      <h2>The EN 301 549 Conformance Report vs VPAT 2.5</h2>
      <p>
        A VPAT 2.5 is the US-origin template originally built for Section 508
        / WCAG reporting. Both documents can conform the same system — they
        are just different framings. Differences in practice:
      </p>
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th>VPAT 2.5</th>
            <th>EN 301 549 Conformance Report</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Legal reference</td>
            <td>Section 508 Refresh; ADA Title II/III</td>
            <td>Directive (EU) 2019/882 (EAA); Directive 2016/2102</td>
          </tr>
          <tr>
            <td>Normative standard cited</td>
            <td>WCAG 2.1 A + AA + Section 508 Chapters 4-7</td>
            <td>Clauses 5-13 of EN 301 549 v3.2.1</td>
          </tr>
          <tr>
            <td>Conformance statements</td>
            <td>Supports / Partially Supports / Does Not Support / Not Applicable / Not Evaluated</td>
            <td>Identical five-level scale</td>
          </tr>
          <tr>
            <td>Recommended evidence</td>
            <td>Automated + manual + assistive-technology testing</td>
            <td>Same, plus explicit &quot;functional performance statements&quot;</td>
          </tr>
        </tbody>
      </table>

      <p>
        Because the scales align, a VPAT 2.5 generated today can usually be
        reframed as an EN 301 549 Conformance Report with section-header
        changes and a references update. AccessiScan supports both framings on
        its Pro tier via a single <code>?standard=en-301-549</code> parameter
        on the export endpoint.
      </p>

      <h2>Practical compliance pattern for a SaaS selling into the EU</h2>
      <ol>
        <li>
          Run an automated scan of the in-product pages + marketing site
          against WCAG 2.1 AA + 2.2 additions. This handles Clause 9.
        </li>
        <li>
          Run an accessibility-tagged PDF validator over every customer-facing
          PDF template (invoices, terms, onboarding guides). This handles
          Clause 10.
        </li>
        <li>
          Test the native mobile app (if any) against WCAG 2.1 AA applied
          per-platform. This handles Clause 11.
        </li>
        <li>
          Produce a one-page &quot;accessibility statement&quot; posted at
          <code>/accessibility</code> naming the conformance level, known
          limitations, contact, and feedback procedure. This is both a member
          state requirement and a Clause 12 obligation.
        </li>
        <li>
          Keep the conformance report version-controlled and update on every
          release that touches UI.
        </li>
      </ol>

      <h2>How AccessiScan helps</h2>
      <p>
        AccessiScan&apos;s Pro tier produces an EN 301 549 Conformance Report
        with per-criterion remarks and automated scan evidence, plus the
        VPAT 2.5 equivalent if your procurement pipeline needs both. The
        Business tier adds continuous monitoring so the evidence is current
        when an authority asks. <a href="/signup">Start with a free scan</a>{" "}
        to see a sample conformance report generated from your own URL.
      </p>

      <h2>References</h2>
      <ul>
        <li>ETSI EN 301 549 V3.2.1 (2024-03)</li>
        <li>Directive (EU) 2019/882 of 17 April 2019 (European Accessibility Act)</li>
        <li>Directive (EU) 2016/2102 on the accessibility of websites and mobile applications of public sector bodies</li>
      </ul>
    </article>
  );
}
