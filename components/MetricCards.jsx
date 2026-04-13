"use client";

import { formatNumber, formatRatio } from "@/lib/computeFinancials";

export default function MetricCards({ financials }) {
  if (!financials) return null;

  const { latest, profile } = financials;
  const sym = profile?.currencySymbol || "$";

  const cards = [
    {
      label: "Market cap",
      value: `${sym}${formatNumber(profile?.marketCap)}`,
      sub: profile?.marketCap > 200e9 ? "Mega cap" : profile?.marketCap > 10e9 ? "Large cap" : "Mid cap",
      delay: 1,
    },
    {
      label: "P/E ratio",
      value: profile?.peRatio ? `${profile.peRatio.toFixed(1)}x` : "-",
      sub: profile?.sector ? `${profile.sector}` : "",
      delay: 2,
    },
    {
      label: "Revenue",
      value: `${sym}${formatNumber(latest?.revenue)}`,
      sub: latest?.revenueGrowth != null ? `${latest.revenueGrowth >= 0 ? "+" : ""}${latest.revenueGrowth.toFixed(1)}% YoY` : "",
      positive: latest?.revenueGrowth >= 0,
      delay: 3,
    },
    {
      label: "EBITDA",
      value: `${sym}${formatNumber(latest?.ebitda)}`,
      sub: `${latest?.ebitdaMargin?.toFixed(1)}% margin`,
      delay: 4,
    },
    {
      label: "Free cash flow",
      value: `${sym}${formatNumber(latest?.fcf)}`,
      sub: latest?.fcf > 0 ? "Positive FCF" : "Negative FCF",
      positive: latest?.fcf > 0,
      delay: 5,
    },
    {
      label: "Debt / EBITDA",
      value: formatRatio(latest?.debtToEbitda),
      sub: latest?.debtToEbitda < 3 ? "Investment grade" : "High leverage",
      positive: latest?.debtToEbitda < 3,
      delay: 5,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className={`rounded-xl p-4 animate-fade-in animate-fade-in-delay-${c.delay}`}
          style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
        >
          <div className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
            {c.label}
          </div>
          <div className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
            {c.value}
          </div>
          {c.sub && (
            <div
              className="text-[11px] mt-1"
              style={{
                color: c.positive === true ? "var(--positive)" : c.positive === false ? "var(--negative)" : "var(--text-tertiary)",
              }}
            >
              {c.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
