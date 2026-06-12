export default function AdaDemandLetterFirst72Hours() {
  return (
    <article className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-sky-700">
      <p className="lead">
        A demand letter or ADA complaint just landed, citing your website under
        Title III and WCAG. Your stomach drops. Before you panic-pay a settlement
        or panic-buy an overlay widget, here is what actually matters in the first
        72 hours — and the one thing that changes how these cases tend to resolve:
        being able to <strong>prove the day you started fixing it</strong>.
      </p>

      <p>
        This is not legal advice and we are not your lawyer. Talk to a qualified
        attorney about your specific situation. What this guide gives you is the
        practical sequence and the documentation an attorney will ask you for.
      </p>

      <h2>Hour 0–4: do not do these things</h2>
      <ul>
        <li>
          <strong>Do not ignore it.</strong> Most web-accessibility demand letters
          are real and are filed in volume by a small number of firms. Silence
          tends to escalate, not resolve.
        </li>
        <li>
          <strong>Do not install an overlay widget and assume you are covered.</strong>{" "}
          The FTC fined accessiBe $1M in 2025 and roughly a fifth of ADA web
          lawsuits in 2024–25 targeted sites that already ran an overlay. See our{" "}
          <a href="/blog/overlay-lawsuit-guide">overlay lawsuit guide</a>.
        </li>
        <li>
          <strong>Do not reply admitting fault</strong> or promising a specific
          compliance date before your attorney reviews it.
        </li>
      </ul>

      <h2>Hour 4–24: get an attorney + a dated record of where you stand</h2>
      <p>
        Forward the letter to counsel (an ADA-defense attorney if you can). In
        parallel, get a <strong>dated, objective record of your site&apos;s
        accessibility state right now</strong>. This matters because the question
        opposing counsel and the court keep coming back to is simple: <em>when did
        you know, and what did you do about it?</em> A timestamped audit run the
        day the letter arrived is the start of that answer.
      </p>
      <p>
        A raw free-scanner dump (WAVE, Lighthouse) is a developer artifact — it is
        not dated, not signed, and not something you can hand to a lawyer. What you
        want is an audit that produces a <strong>verifiable, timestamped record</strong>{" "}
        you (and they) can point to.
      </p>

      <h2>Hour 24–72: build a remediation plan on paper</h2>
      <p>
        Settlement conversations tend to go differently when you can show a written
        remediation plan with real dates instead of a shrug. Group the issues by
        severity and commit to a timeline — critical issues first, then serious,
        then the rest. A 30/60/90-day plan, pre-filled with the actual issues found
        on your site, is exactly the kind of documented good-faith effort that
        demonstrates intent to remediate.
      </p>
      <p>
        Publish an accessibility statement on your site as well. Courts look for
        one. It should describe your commitment and your remediation timeline
        without claiming you are already fully conformant.
      </p>

      <h2>What documentation an attorney will want</h2>
      <ul>
        <li>A dated audit of the site against WCAG 2.1 AA, with issues ranked by severity.</li>
        <li>A written 30/60/90-day remediation plan tied to those specific issues.</li>
        <li>A published accessibility statement with a feedback contact.</li>
        <li>
          A way to <strong>verify the audit was conducted on the date claimed</strong>{" "}
          — a hash-signed, timestamped record beats &quot;trust me, we ran a scan.&quot;
        </li>
        <li>Later: a before/after re-scan showing the issues you have resolved.</li>
      </ul>

      <h2>How AccessiScan helps (and what it is not)</h2>
      <p>
        Our <a href="/audit">$149 one-time audit</a> was built for exactly this
        moment. It ships as a <strong>Legal Evidence Pack</strong>: an automated
        WCAG 2.1 AA scan with a prioritized fix list, a 30/60/90-day remediation
        plan pre-filled with your issues, a draft accessibility statement, a
        demand-letter response template for your attorney to adapt, and — the part
        free scanners cannot give you — a <strong>SHA-256 hash-signed, timestamped
        record with a public verification page</strong>, so the date you acted is
        independently verifiable. After you remediate, a free re-scan documents
        your progress against that dated baseline.
      </p>
      <p>
        Honest scope: automated checks cover roughly 30–40% of WCAG 2.1 AA (the
        mechanical issues); full conformance requires manual testing with a screen
        reader. This documents your conformance status and good-faith effort. It is
        not a certificate of compliance and it is not legal advice. Anyone who
        promises that a scan or a widget instantly solves this for you — with no
        manual work and no ongoing effort — is overselling. Real remediation
        means fixing the issues, not buying a badge.
      </p>
      <p>
        <a href="/audit">Get your timestamped audit + Evidence Pack →</a> Emailed
        within the hour, no account required.
      </p>
    </article>
  );
}
