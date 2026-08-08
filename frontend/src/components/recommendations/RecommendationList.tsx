import { Link } from "react-router-dom";
import type { Recommendation } from "../../types/api";

const PRIORITY_STYLE = {
  high: "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--accent)]",
  medium: "border-[var(--warn)]/35 bg-[var(--warn)]/10 text-[var(--warn)]",
  low: "border-white/15 bg-white/5 text-[var(--muted)]",
};

export function RecommendationList({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--muted)]">
        No recommendations right now.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${PRIORITY_STYLE[item.priority]}`}
              >
                {item.priority}
              </span>
              <h3 className="font-medium">{item.title}</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">{item.reason}</p>
          </div>
          <Link
            to={item.href}
            className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)]"
          >
            {item.actionLabel}
          </Link>
        </li>
      ))}
    </ul>
  );
}
