"use client";

export default function LiquidityAnalysis({ liquidity, currencySymbol }) {
  const sym = currencySymbol || "$";

  // New array format
  if (liquidity?.sources && Array.isArray(liquidity.sources)) {
    return <NewFormat liquidity={liquidity} sym={sym} />;
  }

  // Old object format fallback
  if (liquidity?.sources?.cfo !== undefined) {
    return <OldFormat liquidity={liquidity} sym={sym} />;
  }

  return null;
}

function fmt(v, sym) {
  if (!v && v !== 0) return "-";
  const abs = Math.abs(v);
  if (abs >= 1000) return `${sym}${(v / 1000).toFixed(1)}T`;
  if (abs >= 1) return `${sym}${v.toFixed(1)}B`;
  return `${sym}${(v * 1000).toFixed(0)}M`;
}

function NewFormat({ liquidity, sym }) {
  const sources = liquidity.sources || [];
  const uses = liquidity.uses || [];
  const period = liquidity.period || "Latest FY";

  const totalSources = sources.reduce((sum, s) => sum + (s.value || 0), 0);
  const totalUses = uses.reduce((sum, u) => sum + (u.value || 0), 0);
  const ratio = totalUses > 0 ? (totalSources / totalUses).toFixed(1) : "-";
  const surplus = totalSources - totalUses;

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
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.item}</span>
                <span className="text-xs font-mono font-medium" style={{ color: "var(--positive)" }}>{fmt(s.value, sym)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Total Sources</span>
              <span className="text-xs font-mono font-semibold" style={{ color: "var(--positive)" }}>{fmt(totalSources, sym)}</span>
            </div>
          </div>
        </div>

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
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.item}</span>
                <span className="text-xs font-mono font-medium" style={{ color: "var(--negative)" }}>{fmt(u.value, sym)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Total Uses</span>
              <span className="text-xs font-mono font-semibold" style={{ color: "var(--negative)" }}>{fmt(totalUses, sym)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: "1.5px solid var(--border-hover)" }}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Sources / Uses Ratio</span>
          <span className="text-sm font-mono font-bold" style={{ color: parseFloat(ratio) >= 1.5 ? "var(--positive)" : parseFloat(ratio) >= 1.0 ? "var(--text-primary)" : "var(--negative)" }}>{ratio}x</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Surplus / (Shortfall)</span>
          <span className="text-sm font-mono font-bold" style={{ color: surplus >= 0 ? "var(--positive)" : "var(--negative)" }}>
            {surplus < 0 ? "(" : ""}{fmt(Math.abs(surplus), sym)}{surplus < 0 ? ")" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function OldFormat({ liquidity, sym }) {
  const s = liquidity?.sources || {};
  const u = liquidity?.uses || {};

  return (
    <div
      className="rounded-xl p-6 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
        Liquidity analysis
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--positive)" }}>Sources</div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>CFO</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.cfo, sym)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Cash equivalents</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.cash, sym)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Undrawn RCF</span><span className="text-xs font-mono" style={{ color: "var(--positive)" }}>{fmt(s.undrawnRCF, sym)}</span></div>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--negative)" }}>Uses</div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Working capital</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.workingCapital, sym)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Capex</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.capex, sym)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Dividends</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.dividends, sym)}</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Debt maturity</span><span className="text-xs font-mono" style={{ color: "var(--negative)" }}>{fmt(u.debtMaturity, sym)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
