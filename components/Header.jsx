"use client";

import { useState } from "react";

export default function Header({ onAnalyze, darkMode, onToggleDark }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onAnalyze(input.trim());
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "var(--bg-primary)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Equity Copilot
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            v2
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Enter any ticker (AAPL, RELIANCE, TCS...)"
              className="w-full h-9 pl-9 pr-20 text-sm rounded-lg outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "0.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 rounded-md text-xs font-medium text-white bg-accent hover:bg-accent-dark transition-colors"
            >
              Analyze
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleDark}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "var(--bg-secondary)", border: "0.5px solid var(--border)" }}
            title="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
