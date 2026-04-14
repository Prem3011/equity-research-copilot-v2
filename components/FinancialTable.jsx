"use client";

import { formatNumber, formatRatio } from "@/lib/computeFinancials";

export default function FinancialTable({ years, profile, dataSource }) {
  if (!years?.length) return null;

  const sym = profile?.currencySymbol || "$";

  const rows = [
    { label: "Revenue", key: "revenue", fmt: (v) => `${sym}${formatNumber(v)}` },
    { label: "Growth (%)", key: "revenueGrowth", fmt: (v) => (v != null ? `${v.toFixed(1)}%` : "-") },
    { label: "EBITDA", key: "ebitda", fmt: (v) => `${sym}${formatNumber(v)}` },
    { label: "EBITDA margin (%)", key: "ebitdaMargin", fmt: (v) => `${v.toFixed(1)}%` },
    { label: "CFO", key: "cfo", fmt: (v) => `${sym}${formatNumber(v)}` },
    { label: "FCF", key: "fcf", fmt: (v) => `${sym}${formatNumber(v)}` },
    { label: "Debt / EBITDA (x)", key: "debtToEbitda", fmt: (v) => formatRatio(v) },
    { label: "EBITDA / Interest (x)", key: "ebitdaToInterest", fmt: (v) => formatRatio(v) },
    { label: "(EBITDA-Capex) / Interest", key: "ebitdaMinusCapexToInterest", fmt: (v) => formatRatio(v) },
    { label: "Debt / Equity (x)", key: "debtToEquity", fmt: (v) => (v ? v.toFixed(2) : "-") },
    { label: "EPS", key: "eps", fmt: (v) => (v ? `${profile?.isIndian ? "₹" : "$"}${v.toFixed(2)}` : "-") },
  ];

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Financial table ({years[0]?.year}–{years[years.length - 1]?.year})
        </h3>
       <span
          className="text-[9px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          {dataSource === "gemini" ? "AI sourced" : "FMP API"}
        </span>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th
                className="text-left py-2 px-2 font-medium border-b"
                style={{ color: "var(--text-tertiary)", borderColor: "var(--border-hover)" }}
              >
                Particulars
              </th>
              {years.map((y) => (
                <th
                  key={y.year}
                  className="text-right py-2 px-2 font-medium border-b"
                  style={{ color: "var(--text-tertiary)", borderColor: "var(--border-hover)" }}
                >
                  {y.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="group">
                <td
                  className="py-2 px-2 border-b text-left font-medium group-hover:bg-[var(--bg-secondary)] transition-colors"
                  style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
                >
                  {row.label}
                </td>
                {years.map((y) => (
                  <td
                    key={y.year}
                    className="py-2 px-2 border-b text-right font-mono group-hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
                  >
                    {row.fmt(y[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
