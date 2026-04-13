"use client";

export default function RiskFactors({ risks }) {
  if (!risks?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
        Risk factors
      </h3>
      <div className="space-y-2.5">
        {risks.map((risk, i) => (
          <div
            key={i}
            className="py-2.5 px-3.5 rounded-r-lg"
            style={{
              borderLeft: "2.5px solid var(--negative)",
              background: "var(--bg-secondary)",
            }}
          >
            <div className="text-xs font-medium" style={{ color: "var(--negative)" }}>
              {risk.title}
            </div>
            <div className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {risk.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
