"use client";

export default function CreditStrengths({ strengths }) {
  if (!strengths?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3
        className="text-xs font-medium uppercase tracking-wider mb-4"
        style={{ color: "var(--accent)" }}
      >
        Credit strengths
      </h3>
      <div className="space-y-2.5">
        {strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
