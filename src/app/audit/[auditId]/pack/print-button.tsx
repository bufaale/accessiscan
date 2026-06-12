"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#0f172a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Print / Save as PDF
    </button>
  );
}
