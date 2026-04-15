"use client";

import CreditStrengths from "@/components/CreditStrengths";
import { useState, useCallback } from "react";
import Header from "@/components/Header";
import TickerHero from "@/components/TickerHero";
import QuickPicks from "@/components/QuickPicks";
import MetricCards from "@/components/MetricCards";
import FinancialTable from "@/components/FinancialTable";
import NewsSection from "@/components/NewsSection";
import FCFChart from "@/components/FCFChart";
import SegmentPieChart from "@/components/SegmentPieChart";
import GeographyPieChart from "@/components/GeographyPieChart";
import DebtMaturityChart from "@/components/DebtMaturityChart";
import RiskFactors from "@/components/RiskFactors";
import BullBear from "@/components/BullBear";
import LiquidityAnalysis from "@/components/LiquidityAnalysis";
import InvestmentThesis from "@/components/InvestmentThesis";
import PeerComparison from "@/components/PeerComparison";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const analyze = useCallback(async (ticker) => {
    if (!ticker?.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze stock");
      }

      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDark = () => {
    setDarkMode((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  const fin = data?.financials;
  const gem = data?.gemini;
  const prof = fin?.profile;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-tertiary)" }}>
      <Header onAnalyze={analyze} darkMode={darkMode} onToggleDark={toggleDark} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
        <QuickPicks onSelect={analyze} activeTicker={data?.ticker} />

        {loading && <LoadingState />}

        {error && (
          <div
            className="mt-6 p-4 rounded-xl text-sm"
            style={{ background: "var(--negative-light)", color: "var(--negative)" }}
          >
            {error}
          </div>
        )}

        {!loading && !data && !error && <EmptyState />}

        {data && !loading && (
          <div className="space-y-5 mt-6">
            {/* Hero + Price */}
            <TickerHero profile={prof} ticker={data.ticker} />

            {/* KPI Cards */}
            <MetricCards financials={fin} />

            {/* Financial Table + News (2 columns on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
             <FinancialTable years={fin?.years} profile={prof} dataSource={data?.dataSource} />
              <div className="space-y-5">
                <NewsSection news={gem?.news} />
                <div
                  className="rounded-xl p-5"
                  style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
                >
                  <h3
                    className="text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Company overview
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {gem?.overview}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts — 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FCFChart years={fin?.years} currencySymbol={prof?.currencySymbol} />
              <SegmentPieChart segments={gem?.segmentRevenue} />
              <DebtMaturityChart debtData={gem?.debtMaturity} currencySymbol={prof?.currencySymbol} />
              <GeographyPieChart geography={gem?.geographyRevenue} />
            </div>

            {/* Risks + Bull/Bear (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RiskFactors risks={gem?.risks} />
              <BullBear bullCase={gem?.bullCase} bearCase={gem?.bearCase} />
            </div>

            {/* Liquidity + Thesis (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LiquidityAnalysis liquidity={gem?.liquidity} currencySymbol={prof?.currencySymbol} />
              <InvestmentThesis thesis={gem?.thesis} outlook={gem?.outlook} />
            </div>

            {/* Peer Comparison */}
            <PeerComparison peers={gem?.peers} />

            {/* Footer */}
          <div className="text-center pt-4 pb-2">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Built by Prem Acharya · Powered by Gemini AI + FMP API · Next.js
              </p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                Financial data from company filings via FMP. AI analysis via Google Gemini. Not financial advice.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
