"use client";

const PICKS = [
  { ticker: "AAPL", label: "Apple", flag: "🇺🇸" },
  { ticker: "NVDA", label: "Nvidia", flag: "🇺🇸" },
  { ticker: "MSFT", label: "Microsoft", flag: "🇺🇸" },
  { ticker: "GOOGL", label: "Alphabet", flag: "🇺🇸" },
  { ticker: "TSLA", label: "Tesla", flag: "🇺🇸" },
  { ticker: "AMZN", label: "Amazon", flag: "🇺🇸" },
  { ticker: "RELIANCE", label: "Reliance", flag: "🇮🇳" },
  { ticker: "TCS", label: "TCS", flag: "🇮🇳" },
  { ticker: "INFY", label: "Infosys", flag: "🇮🇳" },
  { ticker: "HDFCBANK", label: "HDFC Bank", flag: "🇮🇳" },
  { ticker: "ITC", label: "ITC", flag: "🇮🇳" },
  { ticker: "WIPRO", label: "Wipro", flag: "🇮🇳" },
];

export default function QuickPicks({ onSelect, activeTicker }) {
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {PICKS.map((p) => (
        <button
          key={p.ticker}
          onClick={() => onSelect(p.ticker)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
          style={{
            background:
              activeTicker === p.ticker ? "var(--accent)" : "var(--bg-primary)",
            color:
              activeTicker === p.ticker ? "#fff" : "var(--text-secondary)",
            border: `0.5px solid ${activeTicker === p.ticker ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          <span>{p.flag}</span>
          <span>{p.ticker}</span>
        </button>
      ))}
    </div>
  );
}
