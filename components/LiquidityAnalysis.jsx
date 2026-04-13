"use client";

export default function LiquidityAnalysis({ liquidity, currencySymbol = "$" }) {
  if (!liquidity?.sources && !liquidity?.uses) return null;

  const s = liquidity.sources || {};
  const u = liquidity.uses || {};

  const sources = [
    { label: "CFO", value: s.cfo },
    { label: "Cash equivalents", value: s.cash },
    { label: "Undrawn RCF", value: s.undrawnRCF },
  ].filter((r) => r.value != null);

  const uses = [
    { label: "Working capital", value: u.workingCapital },
    { label: "Capex", value: u.capex },
    { label: "Dividends", value: u.dividends },
    { label: "Debt maturity", value: u.debtMaturity },
  ].filter((r) => r.value != null);

  if (!sources.length && !uses.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
        Liquidity analysis
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
            Sources
          </div>
          {sources.map((r) => (
            <div
              key={r.label}
              className="flex justify-between py-1.5 text-xs"
              style={{ borderBottom: "0.5px solid var(--border)" }}
            >
              <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
              <span className="font-medium font-mono" style={{ color: "var(--positive)" }}>
                {currencySymbol}{r.value}B
              </span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
            Uses
          </div>
          {uses.map((r) => (
            <div
              key={r.label}
              className="flex justify-between py-1.5 text-xs"
              style={{ borderBottom: "0.5px solid var(--border)" }}
            >
              <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
              <span className="font-medium font-mono" style={{ color: "var(--negative)" }}>
                {currencySymbol}{r.value}B
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
