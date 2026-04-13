"use client";

export default function PeerComparison({ peers }) {
  if (!peers?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Peer comparison
        </h3>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          Suggested peers
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {peers.map((p) => (
          <div
            key={p.ticker}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-secondary)", border: "0.5px solid var(--border)" }}
          >
            <span className="text-xs font-medium font-mono" style={{ color: "var(--accent)" }}>
              {p.ticker}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-3" style={{ color: "var(--text-tertiary)" }}>
        Click on any peer ticker in the quick picks or search bar to analyze them.
      </p>
    </div>
  );
}
