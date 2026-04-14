"use client";

import { useRef, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

export default function FCFChart({ years, currencySymbol = "$" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!years?.length || !canvasRef.current) return;

    if (chartRef.current) chartRef.current.destroy();

    const labels = years.map((y) => y.year);
    const ffo = years.map((y) => Math.round((y.ffo || 0) / 1e6) / 1e3);
    const wc = years.map((y) => Math.round((y.wcChange || 0) / 1e6) / 1e3);
    const capex = years.map((y) => -Math.round((y.capex || 0) / 1e6) / 1e3);
    const divs = years.map((y) => -Math.round((y.dividendsPaid || 0) / 1e6) / 1e3);
    const fcf = years.map((y) => Math.round((y.fcf || 0) / 1e6) / 1e3);

   const isDark = document.documentElement.classList.contains("dark");
    const gridClr = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
    const tickClr = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.4)";

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Funds from operations", data: ffo, backgroundColor: "#1D9E75", stack: "s", barPercentage: 0.55, order: 2 },
          { label: "Working capital", data: wc, backgroundColor: "#85B7EB", stack: "s", barPercentage: 0.55, order: 2 },
          { label: "Capital expenditures", data: capex, backgroundColor: "#0C447C", stack: "s", barPercentage: 0.55, order: 2 },
          { label: "Dividends", data: divs, backgroundColor: "#97C459", stack: "s", barPercentage: 0.55, order: 2 },
          {
            label: "Free cash flow",
            data: fcf,
            type: "line",
            borderColor: "#888780",
            borderWidth: 2.5,
            pointBackgroundColor: "#888780",
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.3,
            order: 1,
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
              label: (ctx) => {
                const v = ctx.parsed.y;
                const s = v < 0 ? "-" : "";
                return `${ctx.dataset.label}: ${s}${currencySymbol}${Math.abs(v).toFixed(1)}B`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickClr, font: { size: 11 } } },
          y: {
            grid: { color: gridClr },
            ticks: {
              color: tickClr,
              font: { size: 10 },
              callback: (v) => (v < 0 ? `(${Math.abs(v)})` : v),
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [years, currencySymbol]);

  if (!years?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
        FCF waterfall
      </h3>
      <div className="flex flex-wrap gap-3 mb-3 text-[10px]" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#1D9E75" }} />FFO</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#85B7EB" }} />Working capital</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#0C447C" }} />Capex</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#97C459" }} />Dividends</span>
        <span className="flex items-center gap-1"><span className="w-3.5 h-0 border-t-2" style={{ borderColor: "#888780" }} />FCF</span>
      </div>
      <div style={{ position: "relative", height: "220px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
