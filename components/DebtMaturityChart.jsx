"use client";

import { useRef, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

export default function DebtMaturityChart({ debtData, currencySymbol = "$" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!debtData?.length || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

   const isDark = document.documentElement.classList.contains("dark");
    const gridClr = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
    const tickClr = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.4)";

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels: debtData.map((d) => d.year),
        datasets: [
          {
            label: "Bank loans",
            data: debtData.map((d) => d.bankLoans || 0),
            backgroundColor: "#185FA5",
            barPercentage: 0.55,
          },
          {
            label: "Bonds",
            data: debtData.map((d) => d.bonds || 0),
            backgroundColor: "#5DCAA5",
            barPercentage: 0.55,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${currencySymbol}${ctx.parsed.y.toFixed(1)}B`,
            },
          },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: tickClr, font: { size: 11 } } },
          y: {
            stacked: true,
            grid: { color: gridClr },
            ticks: { color: tickClr, font: { size: 10 }, callback: (v) => `${currencySymbol}${v}B` },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [debtData, currencySymbol]);

  if (!debtData?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
        Debt maturity profile
      </h3>
      <div className="flex gap-3 mb-3 text-[10px]" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#185FA5" }} />Bank loans</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#5DCAA5" }} />Bonds</span>
      </div>
      <div style={{ position: "relative", height: "180px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
