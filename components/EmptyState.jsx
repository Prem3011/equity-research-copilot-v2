"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      </div>
      <h2 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        Enter a ticker to get started
      </h2>
      <p className="text-sm text-center max-w-md" style={{ color: "var(--text-secondary)" }}>
        Search for any US or Indian stock ticker to generate a professional equity research brief
        with real financial data and AI-powered analysis.
      </p>
      <div className="flex gap-2 mt-5">
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
          NYSE / NASDAQ
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
          NSE / BSE
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
          5-year financials
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
          AI analysis
        </span>
      </div>
    </div>
  );
}
