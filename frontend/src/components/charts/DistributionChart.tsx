import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistributionSegment } from "../../types/api";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function DistributionChart({
  segments,
}: {
  segments: DistributionSegment[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const data = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--muted)]">
        No progress data yet. Complete a lesson to populate this chart.
      </div>
    );
  }

  return (
    <div className="grid h-72 grid-cols-1 items-center gap-4 md:grid-cols-[1.1fr_0.9fr] animate-fade-up">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
            stroke="none"
            animationDuration={900}
          >
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#13241d",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "var(--ink)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="space-y-3 px-2">
        {segments.map((segment, index) => {
          const pct = total === 0 ? 0 : Math.round((segment.value / total) * 100);
          return (
            <li key={segment.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-[var(--muted)]">{segment.label}</span>
              </div>
              <span className="text-sm tabular-nums text-[var(--ink)]">
                {segment.value} · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
