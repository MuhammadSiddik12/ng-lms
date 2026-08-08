import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMinutes, formatShortDate } from "../../lib/format";
import type { TimeseriesPoint } from "../../types/api";

export function TrendChart({ series }: { series: TimeseriesPoint[] }) {
  const data = series.map((point) => ({
    ...point,
    minutes: Math.round(point.durationSeconds / 60),
    label: formatShortDate(point.date),
  }));

  return (
    <div className="h-72 w-full animate-fade-up">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="timeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => `${v}m`}
          />
          <Tooltip
            contentStyle={{
              background: "#13241d",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "var(--ink)",
            }}
            formatter={(value) => [
              formatMinutes(Number(value) * 60),
              "Time spent",
            ]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? formatShortDate(String(payload[0].payload.date))
                : ""
            }
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#timeFill)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
