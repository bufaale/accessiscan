export default function AccessibeLessons() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        In March 2025 the U.S. Federal Trade Commission entered a consent
        order against accessiBe, Inc. for deceptive accessibility
        representations. The company paid $1M in civil penalties, committed
        to refund deceived customers, and is permanently enjoined from
        specific marketing practices. The order is twelve pages of
        plain-English reasoning about what accessibility vendors can and
        cannot claim. Every vendor in the space should read it. Here are
        five operational lessons.
      </p>

      <h2>Lesson 1: &quot;AI makes your site compliant&quot; is actionable fraud</h2>
      <p>
        Count I of the FTC&apos;s complaint targets accessiBe&apos;s
        representations that its widget &quot;makes websites fully compliant
        with the Web Content Accessibility Guidelines (WCAG) 2.1 AA&quot; and
        variations. The Commission found these representations were
        &quot;false, misleading, or unsubstantiated&quot; because at no time
        during the relevant period was there evidence that the widget
        produced WCAG 2.1 AA conformance on real customer sites. The injunction
        prohibits accessiBe from ever making such claims absent independent
        competent and reliable evidence.
      </p>
      <p>
        <strong>Operational takeaway:</strong> if your marketing says &quot;we
        make you compliant&quot;, you are making a compliance representation
        that must be substantiated site-by-site. A 30-40% automation rate
        cannot substantiate a &quot;fully compliant&quot; claim.
      </p>

      <h2>Lesson 2: Fake testimonials are especially punishable</h2>
      <p>
        Count III documents that accessiBe featured and paid for endorsements
        from purported disability advocates whose relationship to the company
        was not disclosed, and in some cases whose identities the Commission
        found were fabricated. The order enjoins accessiBe from using
        testimonials without clear and conspicuous disclosure of material
        connections, consistent with the FTC Endorsement Guides.
      </p>
      <p>
        <strong>Operational takeaway:</strong> every testimonial on an
        accessibility vendor&apos;s site needs a material-connection
        disclosure if the endorser was compensated or has equity. This is
        already Endorsement Guides law; the FTC is clearly willing to
        enforce it in this specific vertical.
      </p>

      <h2>Lesson 3: The Commission cares about assistive-technology users</h2>
      <p>
        The order references &quot;consumers who rely on assistive
        technology&quot; repeatedly and cites declarations from
        screen-reader users as evidence of harm. This matters for two
        reasons. First, it tells vendors that user-reported
        screen-reader breakage is legally weighty, not just
        anecdotal. Second, it tells buyers that testing a vendor&apos;s
        product with the assistive technology your users actually run is
        not optional — it is the only reliable way to verify claims.
      </p>
      <p>
        <strong>Operational takeaway:</strong> before buying an accessibility
        product, run it on a live page with VoiceOver (Mac/iOS), NVDA
        (Windows), or TalkBack (Android). If the product interferes with
        standard keystrokes or hides content from the screen reader, the
        marketing does not match reality.
      </p>

      <h2>Lesson 4: &quot;Not a substitute&quot; disclaimers do not save you</h2>
      <p>
        accessiBe&apos;s public-facing marketing in 2023-2024 contained
        small-print disclaimers that its product was &quot;not a substitute
        for traditional accessibility testing&quot;. The FTC&apos;s complaint
        notes these disclaimers but is not swayed by them — the Commission
        treats the headline claims as the net impression on the reasonable
        consumer, consistent with long-standing advertising substantiation
        doctrine.
      </p>
      <p>
        <strong>Operational takeaway:</strong> the net impression test means
        you cannot pair a bold &quot;fully compliant&quot; headline with a
        footer disclaimer and expect safe harbour. If the headline cannot
        survive substantiation, the disclaimer will not save it.
      </p>

      <h2>Lesson 5: Refunds are a regulatory tool, not a consumer benefit</h2>
      <p>
        The order requires accessiBe to pay refunds to customers harmed by
        the deceptive representations. This is the FTC turning vendor revenue
        back on itself — a structural sanction, not a gesture. It signals to
        overlay competitors that their upfront fees are at risk if their
        marketing is found to be deceptive, not just future subscription
        revenue.
      </p>
      <p>
        <strong>Operational takeaway:</strong> if you are an overlay customer
        who bought on a &quot;full compliance&quot; representation, you may be
        eligible for a refund. Separately, check whether your service
        agreement has an accessibility warranty — some vendors have been
        quietly tightening these clauses post-consent-order.
      </p>

      <h2>Where this leaves AccessiScan (and every honest vendor)</h2>
      <p>
        The FTC order draws a clear line: accessibility claims must be
        evidence-backed, user-tested with assistive technology, and honest
        about automation coverage. That is the line AccessiScan was already
        built for:
      </p>
      <ul>
        <li>
          Scans produce per-criterion VPAT 2.5 reports with conformance
          statements, not a single meaningless &quot;compliance score&quot;.
        </li>
        <li>
          We ship real fix code per violation that engineers apply to their
          own codebase, not a runtime overlay.
        </li>
        <li>
          Our landing page explicitly names the automation coverage limit
          (~30-40% of issues) and points users to the{" "}
          <a href="/blog/overlay-lawsuit-guide">overlay lawsuit record</a> so
          they understand the trade-off.
        </li>
        <li>
          Our free <a href="/overlay-detector">overlay detector</a> lets any
          buyer check their existing vendor without logging in — a neutral
          due-diligence step.
        </li>
      </ul>

      <h2>References</h2>
      <ul>
        <li>FTC v. accessiBe, Inc. (In the Matter of), Docket No. C-4833, Decision and Order (March 2025)</li>
        <li>FTC Guides Concerning the Use of Endorsements and Testimonials in Advertising, 16 C.F.R. Part 255</li>
        <li>WebAIM 2023 Survey of Users with Disabilities — overlay section</li>
      </ul>
    </article>
  );
}
