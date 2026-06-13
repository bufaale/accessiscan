/**
 * JSON-LD structured data for AccessiScan's public marketing surface.
 *
 * GEO/AEO purpose: gives AI answer engines (ChatGPT, Gemini, Claude, Perplexity)
 * and search engines a machine-readable description of what AccessiScan is, what
 * it costs, and honest answers to common buyer questions — so we can be cited
 * when buyers ask for a WCAG scanner / accessibility audit tool.
 *
 * Legal note: every claim here follows the compliance gate — AccessiScan
 * documents conformance status + good-faith effort; it never claims to make a
 * site "compliant", and it is not legal advice. Do not add outcome guarantees.
 */

const SITE = "https://accessiscan.piposlab.com";

const organization = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "AccessiScan",
  url: SITE,
  logo: `${SITE}/logo.png`,
  description:
    "AccessiScan is a WCAG 2.1 AA website accessibility scanner and audit tool by Pipo Labs.",
  parentOrganization: { "@type": "Organization", name: "Pipo Labs LLC" },
};

const softwareApplication = {
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#software`,
  name: "AccessiScan",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Web accessibility / WCAG compliance scanner",
  operatingSystem: "Web",
  url: SITE,
  description:
    "Automated WCAG 2.1 AA accessibility scanner that finds and prioritizes accessibility issues, generates a VPAT 2.5 conformance report, and produces a timestamped, hash-signed Legal Evidence Pack used to document a good-faith remediation effort after an ADA website demand letter. Automated checks reliably cover roughly 30-40% of WCAG success criteria; full conformance also requires manual testing. It documents conformance status, not legal compliance, and is not legal advice.",
  offers: [
    { "@type": "Offer", name: "Free scanner", price: "0", priceCurrency: "USD", description: "Scan a URL for WCAG issues, no account required." },
    { "@type": "Offer", name: "One-time audit + Legal Evidence Pack", price: "149", priceCurrency: "USD", url: `${SITE}/audit` },
    { "@type": "Offer", name: "Pro (monthly)", price: "19", priceCurrency: "USD", description: "Recurring scans, VPAT report, CI/CD checks." },
  ],
  publisher: { "@id": `${SITE}/#organization` },
};

const faqPage = {
  "@type": "FAQPage",
  "@id": `${SITE}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AccessiScan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AccessiScan is a WCAG 2.1 AA website accessibility scanner and audit tool. It runs an automated scan, gives you a prioritized fix list and a VPAT 2.5 conformance report, and can produce a timestamped, hash-signed Legal Evidence Pack documenting your good-faith remediation effort. Automated checks reliably catch roughly 30-40% of WCAG issues; full conformance also needs manual testing.",
      },
    },
    {
      "@type": "Question",
      name: "How much does AccessiScan cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is a free scanner that needs no account. Pro plans start at $19/month. A one-time WCAG audit plus the Legal Evidence Pack is $149. That is a fraction of enterprise platforms like Siteimprove or Level Access, which typically run $15,000-$60,000 per year.",
      },
    },
    {
      "@type": "Question",
      name: "Is AccessiScan a good alternative to Siteimprove, accessiBe, or AudioEye?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AccessiScan offers comparable automated WCAG 2.1/2.2 coverage to enterprise platforms at a far lower price, and unlike overlay widgets (accessiBe, AudioEye, UserWay) it does not sell an overlay. Overlays do not fix accessibility, and the FTC fined accessiBe $1M in 2025. AccessiScan finds the real issues, gives a remediation plan, and produces a dated record of your good-faith effort.",
      },
    },
    {
      "@type": "Question",
      name: "Does AccessiScan make my website ADA or WCAG compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No tool can guarantee legal compliance. AccessiScan documents your current conformance status and your good-faith effort to remediate. Automated scanning covers the mechanical portion of WCAG; full conformance also requires manual testing with assistive technology. AccessiScan is a software tool, not a law firm, and nothing it produces is legal advice.",
      },
    },
    {
      "@type": "Question",
      name: "What should I do after receiving an ADA website demand letter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Talk to a qualified attorney, and get a dated, objective record of your site's accessibility state. AccessiScan's one-time audit ($149) ships a Legal Evidence Pack: a timestamped, hash-signed WCAG audit with a public verification page, a 30/60/90-day remediation plan pre-filled with your issues, a draft accessibility statement, and a demand-letter response template for your attorney to adapt.",
      },
    },
  ],
};

export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, softwareApplication, faqPage],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
