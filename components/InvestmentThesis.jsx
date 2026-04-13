"use client";

export default function InvestmentThesis({ thesis, outlook }) {
  if (!thesis) return null;

  const outlookStyles = {
    Bullish: { bg: "var(--positive-light)", color: "var(--positive)" },
    Bearish: { bg: "var(--negative-light)", color: "var(--negative)" },
    Neutral: { bg: "var(--warning-light)", color: "var(--warning)" },
  };

  const style = outlookStyles[outlook] || outlookStyles.Neutral;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
        Investment thesis
      </h3>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-primary)" }}>
        {thesis}
      </p>
      {outlook && (
        <span
          className="inline-block text-[11px] font-medium px-3 py-1 rounded-full"
          style={{ background: style.bg, color: style.color }}
        >
          Outlook: {outlook}
        </span>
      )}
    </div>
  );
}
