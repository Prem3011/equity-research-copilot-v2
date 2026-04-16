"use client";

export default function LiquidityAnalysis({ liquidity, currencySymbol }) {
  if (!liquidity?.sources?.length && !liquidity?.uses?.length) {
    if (liquidity?.sources?.cfo !== undefined) {
      return <OldLiquidityFormat liquidity={liquidity} currencySymbol={currencySymbol} />;
    }
    return null;
  }

  const sym = currencySymbol || "$";
  const sources = liquidity.sources || [];
  const uses = liquidity.uses || [];
  const period = liquidity.period || "Latest FY";

  const totalSources = sources.reduce((sum, s) => sum + (s.value || 0), 0);
  const totalUses = uses.reduce((sum, u) => sum + (u.value || 0), 0);
  const ratio = totalUses > 0 ? (totalSources / totalUses).toFixed(1) : "-";
  const surplus = totalSources - totalUses;

  const fmt = (v) => {
    if (v === undefined || v === null) return "-";
    const abs = Math.abs(v);
    if (abs >= 1000) return `${sym}${(v / 1000).toFixed(1)}T`;
    if (abs >= 1) return `${sym}${v.toFixed(1)}B`;
    return `${sym}${(v * 1000).toFixed(0)}M`;
  };

  return (
    <div
      className="rounded-xl p-6 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          12-Month Liquidity Assessment
        </h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          {period}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sources */}
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--positive)" }}
          >
            Sources
          </div>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {s.item}
                </span>
                <span
                  className="text-xs font-mono font-medium"
                  style={{ color: "var(--positive)" }}
                >
                  {fmt(s.value)}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between items-center pt-2 mt-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                Total Sources
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "var(--positive)" }}
              >
                {fmt(totalSources)}
              </span>
            </div>
          </div>
        </div>

        {/* Uses */}
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--negative)" }}
          >
            Uses
          </div>
          <div className="space-y-2">
            {uses.map((u, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {u.item}
                </span>
                <span
                  className="text-xs font-mono font-medium"
                  style={{ color: "var(--negative)" }}
                >
                  {fmt(u.value)}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between items-center pt-2 mt-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                Total Uses
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "var(--negative)" }}
              >
                {fmt(totalUses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div
        className="mt-5 pt-4 grid grid-cols-2 gap-4"
        style={{ borderTop: "1.5px solid var(--border-hover)" }}
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Sources / Uses Ratio
          </span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: parseFloat(ratio) >= 1.5 ? "var(--positive)" : parseFloat(ratio) >= 1.0 ? "var(--text-primary)" : "var(--negative)" }}
          >
            {ratio}x
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Surplus / (Shortfall)
          </span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: surplus >= 0 ? "var(--positive)" : "var(--negative)" }}
          >
            {surplus >= 0 ? "" : "("}{fmt(Math.abs(surplus))}{surplus < 0 ? ")" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// Fallback for old format (before prompt update)
function OldLiquidityFormat({ liquidity, currencySymbol }) {
  const sym = currencySymbol || "$";
  const s = liquidity?.sources || {};
  const u = liquidity?.uses || {};

  const fmt = (v) => {
    if (!v) return "-";
    const abs = Math.abs(v);
    if (abs >= 1000) return `${sym}${(v / 1000).toFixed(1)}T`;
    return `${sym}${Math.abs(v).toFixed(1)}B`;
  };

  return (
    <div
      className="rounded-xl p-6 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3
        className="text-xs font-medium uppercase tracking-wider mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        Liquidity analysis
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--positive)" }}>Sources</div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>CFO</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.cfo)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Cash equivalents</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.cash)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Undrawn RCF</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.undrawnRCF)}</span></div>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--negative)" }}>Uses</div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Working capital</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.workingCapital)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Capex</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.capex)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Dividends</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.dividends)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Debt maturity</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.debtMaturity)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
