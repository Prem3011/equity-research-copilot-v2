"use client";

export default function BullBear({ bullCase, bearCase }) {
  if (!bullCase && !bearCase) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
        Bull vs bear
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--positive-light)", border: "0.5px solid var(--positive)" }}
        >
          <div className="text-[11px] font-medium mb-2" style={{ color: "var(--positive)" }}>
            Bull case
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {bullCase}
          </div>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--negative-light)", border: "0.5px solid var(--negative)" }}
        >
          <div className="text-[11px] font-medium mb-2" style={{ color: "var(--negative)" }}>
            Bear case
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {bearCase}
          </div>
        </div>
      </div>
    </div>
  );
}
