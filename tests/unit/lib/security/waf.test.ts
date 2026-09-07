import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { applyWaf } from "@/lib/security/waf";

function makeRequest(opts: {
  path?: string;
  search?: string;
  ua?: string;
  headers?: Record<string, string>;
}): NextRequest {
  const url = `https://example.com${opts.path ?? "/"}${opts.search ?? ""}`;
  const headers = new Headers(opts.headers ?? {});
  if (opts.ua !== undefined) headers.set("user-agent", opts.ua);
  return new NextRequest(url, { headers });
}

describe("applyWaf", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows a normal, legitimate GET request through (returns null)", () => {
    const req = makeRequest({
      path: "/api/scans",
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605",
    });
    expect(applyWaf(req)).toBeNull();
  });

  it("allows legitimate query strings that merely contain 'select' as a normal word", () => {
    // False-positive guard: "selected=true" should not trip the SQLi regex.
    const req = makeRequest({ path: "/search", search: "?selected=true&q=hello" });
    expect(applyWaf(req)).toBeNull();
  });

  it("blocks a known scanner user-agent (sqlmap) with 403", () => {
    const req = makeRequest({ path: "/", ua: "sqlmap/1.6#stable" });
    const res = applyWaf(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });

  it("blocks a known scanner user-agent (nikto) case-insensitively", () => {
    const req = makeRequest({ path: "/", ua: "Mozilla/5.0 Nikto/2.5.0" });
    const res = applyWaf(req);
    expect(res?.status).toBe(403);
  });

  it("does NOT block a legitimate UA that happens to share no substring with banned list", () => {
    const req = makeRequest({ path: "/", ua: "curl/8.4.0" });
    expect(applyWaf(req)).toBeNull();
  });

  it("blocks requests carrying a suspicious x-scanner header", () => {
    const req = makeRequest({ path: "/", headers: { "x-scanner": "1" } });
    const res = applyWaf(req);
    expect(res?.status).toBe(403);
  });

  it("does not block on an unrelated custom header", () => {
    const req = makeRequest({ path: "/", headers: { "x-request-id": "abc-123" } });
    expect(applyWaf(req)).toBeNull();
  });

  it("returns 404 (not 403) for known vulnerable-endpoint paths like /wp-admin", () => {
    const req = makeRequest({ path: "/wp-admin/setup.php" });
    const res = applyWaf(req);
    expect(res?.status).toBe(404);
  });

  it("returns 404 for /.env probe", () => {
    const req = makeRequest({ path: "/.env" });
    const res = applyWaf(req);
    expect(res?.status).toBe(404);
  });

  it("does not block a legitimate path that merely contains 'env' as a substring of a real word", () => {
    const req = makeRequest({ path: "/environment-settings" });
    expect(applyWaf(req)).toBeNull();
  });

  it("blocks a path-parameter traversal bypass that survives URL normalization (/..;/)", () => {
    // A plain "/../../etc/passwd" gets collapsed by the URL parser itself
    // before pathname is read, so it never reaches this rule — this
    // path-parameter trick (used against some reverse proxies) is what
    // actually leaves a literal "/.." in req.nextUrl.pathname.
    const req = makeRequest({ path: "/..;/etc/passwd" });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a doubly-percent-escaped traversal segment that the URL parser leaves undecoded (%2e%2e%2f)", () => {
    // %2f (encoded slash) stops the parser from treating this as a real
    // dot-segment, so "%2e%2e" survives verbatim in pathname.
    const req = makeRequest({ path: "/foo/%2e%2e%2fbar" });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("does not block a normal path containing two dots that isn't traversal, e.g. a version number", () => {
    const req = makeRequest({ path: "/releases/v1.2.3" });
    expect(applyWaf(req)).toBeNull();
  });

  it("blocks a classic UNION SELECT SQL injection probe in the query string", () => {
    const req = makeRequest({
      path: "/search",
      search: "?q=" + encodeURIComponent("1 UNION SELECT username, password FROM users"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks 'UNION   SELECT' with multiple spaces (proves \\s+ between union/select)", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("1 UNION   SELECT password FROM users"),
    });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("blocks 'SELECT ... FROM' where the middle .* spans MULTIPLE words with punctuation", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("SELECT a, b, c FROM users"),
    });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("blocks 'SELECT' immediately followed by multiple spaces then a single column then 'FROM' (boundary: .* can match a single char)", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("SELECT x FROM users"),
    });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("blocks 'DROP   TABLE' with multiple spaces", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("1; DROP   TABLE users"),
    });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("blocks 'INSERT   INTO' with multiple spaces", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("INSERT   INTO users VALUES (1)"),
    });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("does NOT block 'DELETE FROM' with a single space (only a same-length substitute for whitespace collapses the rule)", () => {
    // Regression guard for a mutant that turns \s+ into \S+ (or a literal
    // single space) between DELETE and FROM — both would silently narrow
    // or widen what the rule matches.
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("DELETE FROM users"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks 'DELETE FROM' with MULTIPLE spaces (proves \\s+ is a repeated whitespace class, not a fixed count)", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("DELETE   FROM users"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a classic ' OR 1=1 probe with normal single spaces", () => {
    const req = makeRequest({ path: "/login", search: "?id=" + encodeURIComponent("1 OR 1=1") });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks 'OR 1  =  1' with extra spaces around the equals (proves \\s* is zero-or-more, not exactly one)", () => {
    const req = makeRequest({
      path: "/login",
      search: "?id=" + encodeURIComponent("1 OR 1  =  1"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks 'OR   1=1' with multiple spaces between OR and 1 (proves \\s+ there, not exactly one)", () => {
    const req = makeRequest({ path: "/login", search: "?id=" + encodeURIComponent("1 OR   1=1") });
    expect(applyWaf(req)?.status).toBe(400);
  });

  it("blocks 'AND 1=1' with NO spaces around the equals (proves \\s* also matches zero occurrences)", () => {
    const req = makeRequest({ path: "/login", search: "?id=" + encodeURIComponent("1 AND 1=1") });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a SQL comment terminator probe (-- newline)", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("admin'--\n"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a comment terminator with trailing spaces before the newline (-- \\s*[\\r\\n])", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("admin'--   \n"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a /* */ inline SQL comment even with content inside", () => {
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("1/*comment*/=1"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a sleep()-based timing attack probe with no space before the paren", () => {
    const req = makeRequest({ path: "/x", search: "?id=" + encodeURIComponent("1; SLEEP(5)") });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks sleep() with whitespace before the paren (proves \\s* is zero-or-more there too)", () => {
    const req = makeRequest({ path: "/x", search: "?id=" + encodeURIComponent("1; SLEEP  (5)") });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("blocks a WAITFOR DELAY probe with multiple spaces between the two words", () => {
    const req = makeRequest({
      path: "/x",
      search: "?id=" + encodeURIComponent("1; WAITFOR   DELAY '0:0:5'"),
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(400);
  });

  it("does NOT flag an empty query string", () => {
    const req = makeRequest({ path: "/x", search: "" });
    expect(applyWaf(req)).toBeNull();
  });

  it("does NOT flag a single-character query string ('?')", () => {
    // qs.length > 1 guard — a bare "?" (length 1) must be skipped.
    const req = makeRequest({ path: "/x" });
    // NextRequest normalizes a bare "?" away; assert via a real one-char search.
    const url = new URL("https://example.com/x");
    url.search = "?";
    const realReq = new NextRequest(url, { headers: new Headers({ "user-agent": "test" }) });
    expect(applyWaf(realReq)).toBeNull();
    expect(applyWaf(req)).toBeNull();
  });

  it("does not block ordinary query params like ?page=2&sort=name", () => {
    const req = makeRequest({ path: "/list", search: "?page=2&sort=name" });
    expect(applyWaf(req)).toBeNull();
  });

  it("handles an unparseable percent-encoding in the query string without throwing", () => {
    // "%" alone is invalid encoding — safeDecode must swallow the throw.
    const req = makeRequest({ path: "/x", search: "?q=%E0%A4%A" });
    expect(() => applyWaf(req)).not.toThrow();
  });

  it("checks user-agent/header/path rules BEFORE query-string SQLi rules (ordering)", () => {
    // A request with BOTH a banned UA and a SQLi-looking query string must be
    // rejected for the UA (403), proving the UA check runs first.
    const req = makeRequest({
      path: "/x",
      search: "?q=" + encodeURIComponent("1 UNION SELECT 1"),
      ua: "sqlmap/1.0",
    });
    const res = applyWaf(req);
    expect(res?.status).toBe(403);
  });

  it("logs a structured warning on block with the rule name and truncated detail", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const req = makeRequest({ path: "/", ua: "sqlmap/1.0" });
    applyWaf(req);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.event).toBe("waf.block");
    expect(logged.rule).toBe("blocked-ua");
  });

  it("reads the client IP from x-forwarded-for (first entry) when present", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const req = makeRequest({
      path: "/",
      ua: "sqlmap/1.0",
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ip).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then 'unknown', when x-forwarded-for is absent", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const req = makeRequest({
      path: "/",
      ua: "sqlmap/1.0",
      headers: { "x-real-ip": "198.51.100.9" },
    });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ip).toBe("198.51.100.9");
  });

  it("logs ip:'unknown' (the literal fallback string) when NEITHER IP header is present", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const req = makeRequest({ path: "/", ua: "sqlmap/1.0" });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ip).toBe("unknown");
  });

  it("trims whitespace off a comma-separated x-forwarded-for entry", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const req = makeRequest({
      path: "/",
      ua: "sqlmap/1.0",
      headers: { "x-forwarded-for": "  203.0.113.5  , 10.0.0.1" },
    });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ip).toBe("203.0.113.5");
  });

  it("truncates a logged user-agent to exactly 120 characters, not the full string", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const longSuffix = "x".repeat(200);
    const req = makeRequest({ path: "/", ua: `sqlmap/1.0 ${longSuffix}` });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ua.length).toBe(120);
    expect(logged.ua).toBe(`sqlmap/1.0 ${longSuffix}`.slice(0, 120));
  });

  it("logs an empty string for ua when there is no user-agent header at all (not 'Stryker was here!' or undefined)", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const url = "https://example.com/wp-admin";
    const req = new NextRequest(url, { headers: new Headers() });
    applyWaf(req);
    const logged = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(logged.ua).toBe("");
  });

  it("the blocked response body is exactly { error: 'Forbidden' }", async () => {
    const req = makeRequest({ path: "/", ua: "sqlmap/1.0" });
    const res = applyWaf(req);
    const body = await res?.json();
    expect(body).toEqual({ error: "Forbidden" });
  });

  it("a query string of exactly length 2 (one char after '?') IS scanned for SQLi", () => {
    const req = makeRequest({
      path: "/x",
      search: "?" + encodeURIComponent("1 UNION SELECT 1 FROM x").slice(0, 1),
    });
    // A single harmless char must not block...
    expect(applyWaf(req)).toBeNull();
    // ...but the >1 boundary itself is proven by the SQLi tests above, which
    // all use query strings well past length 1 and DO block.
  });

  it("does not block on malformed percent-encoding alone — safeDecode's catch swallows the throw instead of propagating it", () => {
    // "%zz" is invalid percent-encoding. decodeURIComponent throws; the
    // WAF must not 500 — it falls back to treating the raw (still
    // percent-encoded) string as the input to scan, which contains no
    // SQLi keywords once undecoded (spaces stay %20, not real whitespace).
    const req = makeRequest({ path: "/x", search: "?q=%zz" });
    expect(() => applyWaf(req)).not.toThrow();
    expect(applyWaf(req)).toBeNull();
  });

  it("uppercase / mixed-case scanner UA still matches (path is lowercased before compare)", () => {
    const req = makeRequest({ path: "/WP-ADMIN/setup.php" });
    const res = applyWaf(req);
    expect(res?.status).toBe(404);
  });
});
