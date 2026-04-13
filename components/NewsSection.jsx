"use client";

export default function NewsSection({ news }) {
  if (!news?.length) return null;

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)" }}
    >
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
        Latest news
      </h3>
      <div className="space-y-0.5">
        {news.map((item, i) => (
          <div
            key={i}
            className="py-2.5 transition-colors"
            style={{ borderBottom: i < news.length - 1 ? "0.5px solid var(--border)" : "none" }}
          >
            <div className="text-[10px] font-medium" style={{ color: "var(--accent)" }}>
              {item.date}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {item.headline}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {item.source}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Read ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
