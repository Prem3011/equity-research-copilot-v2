"use client";

import { useRef, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const COLORS = ["#534AB7", "#378ADD", "#D4537E", "#BA7517", "#888780", "#1D9E75"];

export default function GeographyPieChart({ geography }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!geography?.length || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: geography.map((g) => g.region),
        datasets: [{
          data: geography.map((g) => g.percentage),
          backgroundColor: COLORS.slice(0, geography.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [geography]);

  if (!geography?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
        Revenue by geography
      </h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {geography.map((g, i) => (
          <span key={g.region} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] || "#888" }} />
            {g.region} {g.percentage}%
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: "180px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
