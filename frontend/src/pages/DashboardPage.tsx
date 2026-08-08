import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DistributionChart } from "../components/charts/DistributionChart";
import { TrendChart } from "../components/charts/TrendChart";
import { RecommendationList } from "../components/recommendations/RecommendationList";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { apiGet, getErrorMessage } from "../lib/api";
import { downloadProgressCsv } from "../lib/download";
import { formatMinutes } from "../lib/format";
import type {
  DashboardDistribution,
  DashboardSummary,
  DashboardTimeseries,
  Recommendation,
} from "../types/api";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<DashboardTimeseries | null>(null);
  const [distribution, setDistribution] =
    useState<DashboardDistribution | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryData, seriesData, distData, recData] = await Promise.all([
          apiGet<DashboardSummary>("/api/dashboard/summary"),
          apiGet<DashboardTimeseries>("/api/dashboard/timeseries?days=14"),
          apiGet<DashboardDistribution>("/api/dashboard/distribution?by=status"),
          apiGet<{ recommendations: Recommendation[] }>("/api/recommendations"),
        ]);
        if (!active) return;
        setSummary(summaryData);
        setTimeseries(seriesData);
        setDistribution(distData);
        setRecommendations(recData.recommendations);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onExportCsv() {
    setExporting(true);
    setExportError("");
    try {
      await downloadProgressCsv();
    } catch (err) {
      setExportError(getErrorMessage(err, "CSV export failed"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">
      <div className="mb-8 flex flex-col gap-4 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">Welcome back</p>
          <h1 className="mt-1 text-3xl md:text-4xl">{user?.name}</h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Your learning pulse — completed lessons, time invested, and progress across
            courses.
          </p>
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          disabled={exporting}
          className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-sm text-[var(--ink)] transition hover:border-white/30 disabled:opacity-60"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {exportError && (
        <p className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {exportError}
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <Stat
              label="Completed lessons"
              value={String(summary.completedLessons)}
              hint={`${summary.totalLessons} total enrolled`}
              delay="animation-delay-1"
            />
            <Stat
              label="Time spent"
              value={formatMinutes(summary.timeSpentSeconds)}
              hint={`${summary.timeSpentHours} hours logged`}
              delay="animation-delay-2"
            />
            <Stat
              label="Overall progress"
              value={`${summary.overallProgressPercent}%`}
              hint={`${summary.inProgressLessons} in progress`}
              delay="animation-delay-3"
            />
            <Stat
              label="Courses"
              value={String(summary.enrolledCourses)}
              hint="Active enrollments"
              delay="animation-delay-3"
            />
          </>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4">
          <h2 className="text-xl">Next steps</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Adaptive recommendations based on your progress and activity
          </p>
        </div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <RecommendationList items={recommendations} />
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl">Learning trend</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Daily time spent over the last 14 days
              </p>
            </div>
          </div>
          {loading || !timeseries ? (
            <Skeleton className="h-72" />
          ) : (
            <TrendChart series={timeseries.series} />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl">Completion mix</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Lesson status distribution
            </p>
          </div>
          {loading || !distribution ? (
            <Skeleton className="h-72" />
          ) : (
            <DistributionChart segments={distribution.segments} />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">Progress by course</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Completion and time invested per enrollment
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View courses
          </Link>
        </div>

        {loading || !summary ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : summary.courses.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            No enrollments yet. Ask your mentor to assign a course.
          </p>
        ) : (
          <ul className="divide-y divide-white/8">
            {summary.courses.map((course, index) => (
              <li
                key={course.id}
                className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up animation-delay-${Math.min(index + 1, 3)}`}
              >
                <div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="font-medium transition hover:text-[var(--accent)]"
                  >
                    {course.title}
                  </Link>
                  <p className="text-sm text-[var(--muted)]">
                    {course.category} · {course.completedLessons}/
                    {course.totalLessons} lessons ·{" "}
                    {formatMinutes(course.timeSpentSeconds)}
                  </p>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>Progress</span>
                    <span>{course.progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  delay,
}: {
  label: string;
  value: string;
  hint: string;
  delay: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 animate-fade-up ${delay}`}
    >
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
    </div>
  );
}
