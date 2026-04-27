"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const RED = "#dc2626";
const GREEN = "#16a34a";
const AMBER_50 = "#fffbeb";
const AMBER_700 = "#b45309";
const AMBER_900 = "#78350f";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";

interface PdfScan {
  id: string;
  filename: string;
  file_size_bytes: number;
  page_count: number | null;
  status: "pending" | "running" | "completed" | "failed";
  score: number | null;
  is_tagged: boolean | null;
  has_language: boolean | null;
  declared_language: string | null;
  has_title: boolean | null;
  image_total_count: number;
  image_with_alt_count: number;
  form_field_total_count: number;
  form_field_with_label_count: number;
  error_message: string | null;
  created_at: string;
}

export default function PdfScansPage() {
  const [scans, setScans] = useState<PdfScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [gated, setGated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/pdf-scans");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScans(data.scans ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/pdf-scans", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) setGated(true);
        toast.error(data.error ?? "Upload failed");
        return;
      }
      toast.success(`Scored ${data.report.score}/100`);
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          PDF accessibility scanning
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER, maxWidth: 720 }}>
          Upload a PDF — we analyze PDF/UA-1 + WCAG 2.1 AA + EN 301 549 Clause 10 criteria: tagging, language declaration, title, alt-text coverage, form-field labels. Required for DOJ Title II and most EU public-sector procurement. Business / Agency plan feature.
        </p>
      </div>

      {gated && (
        <div role="alert" style={{ background: AMBER_50, border: `1px solid #fcd34d`, borderRadius: 8, padding: 16, display: "flex", gap: 12, fontFamily: FONT_INTER }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: AMBER_700, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }} aria-hidden>!</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: AMBER_900, margin: 0 }}>
              PDF accessibility scanning is on the Business and Agency plans
            </p>
            <Link
              href="/settings/billing"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", marginTop: 12, fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", textDecoration: "none" }}
            >
              See plans →
            </Link>
          </div>
        </div>
      )}

      <UploadDropZone
        uploading={uploading}
        onUpload={handleUpload}
        fileRef={fileRef}
      />

      {loading ? (
        <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 32, textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER, fontSize: 13.5 }}>
          Loading...
        </div>
      ) : scans.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {scans.map((s) => (
            <ScanRow key={s.id} scan={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadDropZone({
  uploading,
  onUpload,
  fileRef,
}: {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "32px 24px",
          border: `2px dashed ${SLATE_300}`,
          borderRadius: 8,
          background: SLATE_50,
          cursor: uploading ? "not-allowed" : "pointer",
          fontFamily: FONT_INTER,
        }}
      >
        <span aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: SLATE_100, color: SLATE_500, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
          ↑
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: SLATE_700 }}>
          {uploading ? "Analyzing..." : "Upload a PDF (max 25 MB)"}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY }}>
        No PDF scans yet
      </div>
      <p style={{ fontSize: 13, color: SLATE_500, marginTop: 6, marginBottom: 0, fontFamily: FONT_INTER }}>
        Upload a PDF to run the first.
      </p>
    </div>
  );
}

function ScanRow({ scan: s }: { scan: PdfScan }) {
  const tagBadge = (label: string, ok: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: ok ? "rgba(22,163,74,0.10)" : "rgba(220,38,38,0.10)",
    color: ok ? GREEN : RED,
    border: `1px solid ${ok ? GREEN : RED}`,
  });
  return (
    <Link
      href={`/dashboard/pdf-scans/${s.id}`}
      style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, textDecoration: "none", color: "inherit", transition: "border-color .15s", fontFamily: FONT_INTER }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ color: SLATE_500, fontSize: 14 }}>📄</span>
            <p style={{ fontWeight: 600, color: NAVY, margin: 0, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.filename}
            </p>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11.5, color: SLATE_500, fontFamily: FONT_INTER }}>
            <span style={{ fontFamily: FONT_MONO }}>{(s.file_size_bytes / 1024).toFixed(0)} KB</span>
            {s.page_count !== null && <span style={{ fontFamily: FONT_MONO }}>{s.page_count} pages</span>}
            {s.declared_language && <span>lang: <span style={{ fontFamily: FONT_MONO, color: NAVY }}>{s.declared_language}</span></span>}
            <span>{new Date(s.created_at).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {s.is_tagged === true && <span style={tagBadge("Tagged", true)}>✓ Tagged</span>}
            {s.is_tagged === false && <span style={tagBadge("Tagged", false)}>✗ Not tagged</span>}
            {s.has_language === false && <span style={tagBadge("Lang", false)}>! No lang</span>}
            {s.has_title === false && <span style={tagBadge("Title", false)}>! No title</span>}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          {s.status === "completed" && s.score !== null ? (
            <>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: s.score >= 80 ? NAVY : RED, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {s.score}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: SLATE_400, marginTop: 4, fontFamily: FONT_INTER }}>
                / 100
              </div>
            </>
          ) : s.status === "failed" ? (
            <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: "rgba(220,38,38,0.10)", color: RED, border: `1px solid ${RED}` }}>
              failed
            </span>
          ) : (
            <span style={{ fontSize: 12, color: SLATE_400, fontFamily: FONT_INTER, fontStyle: "italic" }}>
              processing…
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
