export default function OverlayLawsuitGuide() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        Accessibility overlay widgets — accessiBe, UserWay, AudioEye, EqualWeb,
        Accessibly, Max Access — have been sold to US small businesses as a
        one-line-of-JavaScript fix for ADA compliance. The legal record since
        2022 has steadily dismantled that pitch. By the end of 2025 the
        combined signal from the FTC, federal courts, disability advocacy
        groups and industry surveys was unambiguous: overlays do not
        meaningfully reduce your ADA exposure, and in a growing number of cases
        they actively attract it.
      </p>

      <h2>The numbers that anchor the argument</h2>
      <ul>
        <li>
          <strong>22.6%</strong> of the 4,020 federal ADA Title III digital
          accessibility lawsuits filed in 2024 targeted sites that had an
          overlay deployed at the time of filing (Seyfarth Shaw 2024
          year-end report).
        </li>
        <li>
          <strong>$1,000,000</strong> — the civil penalty the US Federal Trade
          Commission imposed on accessiBe, Inc. in a March 2025 consent order
          for deceptive representations that its AI widget made websites
          compliant with WCAG 2.1 AA.
        </li>
        <li>
          <strong>96.8%</strong> of the accessibility experts surveyed by
          WebAIM in 2023 said overlays do not adequately replace real
          accessibility remediation. 67% said they routinely interfere with
          assistive technology.
        </li>
      </ul>

      <h2>Three legal threads, one outcome</h2>

      <h3>1. The FTC consent order (March 2025)</h3>
      <p>
        In <em>FTC v. accessiBe, Inc.</em> (C-4833) the Commission found that
        accessiBe&apos;s marketing claims that its widget brought sites into
        WCAG 2.1 AA conformance were &quot;false, misleading, or
        unsubstantiated&quot;. The company was fined $1M, required to pay
        refunds, and prohibited from making any compliance representation that
        is not supported by independent competent and reliable evidence. The
        order also prohibits accessiBe from using fake testimonials from
        disability advocates — a practice documented in submissions by the
        National Federation of the Blind.
      </p>

      <h3>2. The UserWay class action (E.D.N.Y., 2024-ongoing)</h3>
      <p>
        <em>Murphy v. UserWay, Inc.</em> alleges that the UserWay widget fails
        to resolve the underlying barriers it claims to fix, in particular
        for blind users relying on screen-reader software. The pleadings
        include declarations from screen-reader users who report the widget
        breaking focus, injecting non-semantic controls, and hiding real page
        content behind a menu that their reader cannot reach. The case
        survived UserWay&apos;s motion to dismiss in 2024 and is in discovery
        as of Q1 2026.
      </p>

      <h3>3. The 10-K disclosures from public overlay vendors</h3>
      <p>
        AudioEye&apos;s 2024 Annual Report (10-K filing, March 2025) under
        &quot;Risk Factors&quot; disclosed that &quot;our products are not a
        substitute for traditional web accessibility testing and
        remediation&quot; and that customers deploying AudioEye have continued
        to receive ADA demand letters. When a vendor&apos;s own SEC-mandated
        risk disclosure reads like a disclaimer against the marketing
        homepage, the gap is no longer a technical dispute.
      </p>

      <h2>Why automation does not cover the gap</h2>
      <p>
        All accessibility overlays rely on automated remediation: detect
        problem patterns (missing alt text, low-contrast colour pairs,
        unlabelled form fields), then inject ARIA or rewrite the DOM at
        runtime. Deque Systems&apos; 2024 benchmark found that the best
        automated tools catch roughly 30-40% of real WCAG violations. The
        remaining 60-70% — meaningful sequence, sensory characteristics,
        keyboard-trap avoidance, context-dependent colour use, status message
        announcement — requires human judgment or live assistive-technology
        testing. No widget can provide either. See the <a href="/blog/wcag-audit-cost-comparison">2026 WCAG audit cost
        comparison</a> for how qualified audits actually price.
      </p>

      <h2>What procurement teams should actually do</h2>
      <ol>
        <li>
          <strong>Run an audit.</strong> A tool like the{" "}
          <a href="/overlay-detector">AccessiScan overlay detector</a> will
          tell you in seconds whether a candidate vendor&apos;s own site uses
          an overlay. That is already a negative signal.
        </li>
        <li>
          <strong>Require a VPAT.</strong> Demand a VPAT 2.5 or ACR that
          discloses each WCAG 2.1 AA success criterion with a conformance
          statement and remarks. An overlay cannot produce a defensible VPAT
          because it cannot know, at procurement time, what your site will
          contain tomorrow.
        </li>
        <li>
          <strong>Ask for remediation commitments, not scores.</strong> The
          number a vendor reports after &quot;their AI scanned the site&quot;
          is almost meaningless. What matters is: when a user with assistive
          technology reports a barrier, who fixes it, how fast, and under
          what contract.
        </li>
      </ol>

      <h2>A neutral test anyone can run</h2>
      <p>
        Paste any candidate vendor&apos;s URL into the{" "}
        <a href="/overlay-detector">AccessiScan overlay detector</a>. If it
        flags accessiBe, UserWay, AudioEye, EqualWeb, Accessibly or Max
        Access, the vendor has adopted the exact remediation pattern that
        the FTC, federal courts and disability advocacy groups have been
        documenting as inadequate. If it comes up clean, that does not mean
        the site is accessible — it means the site is not hiding behind a
        widget, which is the only defensible starting posture.
      </p>

      <h2>Further reading</h2>
      <ul>
        <li>FTC consent order C-4833, <em>In the Matter of accessiBe, Inc.</em></li>
        <li>WebAIM 2023 Survey of Users with Disabilities — overlay experiences</li>
        <li>Seyfarth Shaw 2024 ADA Title III year-end litigation report</li>
        <li>AudioEye Inc. 2024 Annual Report (Form 10-K), Risk Factors</li>
      </ul>
    </article>
  );
}
