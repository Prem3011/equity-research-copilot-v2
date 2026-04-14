"use client";

import { formatPrice, formatPercent } from "@/lib/computeFinancials";

export default function TickerHero({ profile, ticker }) {
  if (!profile) return null;

  const isPositive = profile.change >= 0;

  return (
    <div
      className="rounded-xl p-6 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
              {ticker}
            </h1>
            <span
              className="text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {profile.exchange}
            </span>
            {profile.sector && (
              <span
                className="text-[10px] px-2 py-1 rounded-full hidden sm:inline"
                style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
              >
                {profile.sector}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {profile.companyName}
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
            {formatPrice(profile.price, profile.currencySymbol)}
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span
              className="text-sm font-medium"
              style={{ color: isPositive ? "var(--positive)" : "var(--negative)" }}
            >
              {isPositive ? "+" : ""}{profile.change?.toFixed(2)} ({formatPercent(profile.changePercent)})
            </span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
