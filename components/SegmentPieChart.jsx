"use client";

import { useRef, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const COLORS = ["#0C447C", "#1D9E75", "#D85A30", "#534AB7", "#888780", "#D4537E"];

export default function SegmentPieChart({ segments }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!segments?.length || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: segments.map((s) => s.segment),
        datasets: [{
          data: segments.map((s) => s.percentage),
          backgroundColor: COLORS.slice(0, segments.length),
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
  }, [segments]);

  if (!segments?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
        Revenue by segment
      </h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {segments.map((s, i) => (
          <span key={s.segment} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] || "#888" }} />
            {s.segment} {s.percentage}%
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: "180px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
