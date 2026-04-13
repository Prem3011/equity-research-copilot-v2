"use client";

export default function LoadingState() {
  return (
    <div className="space-y-5 mt-6">
      {/* Hero skeleton */}
      <div className="skeleton h-28 rounded-xl" />

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>

      {/* Table + News skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        <div className="skeleton h-80 rounded-xl" />
        <div className="space-y-5">
          <div className="skeleton h-52 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-56 rounded-xl" />
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm animate-pulse" style={{ color: "var(--text-tertiary)" }}>
          Fetching financial data and generating AI analysis...
        </p>
      </div>
    </div>
  );
}
