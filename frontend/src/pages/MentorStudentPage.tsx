import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DistributionChart } from "../components/charts/DistributionChart";
import { TrendChart } from "../components/charts/TrendChart";
import { Skeleton } from "../components/ui/Skeleton";
import { apiGet, getErrorMessage } from "../lib/api";
import { formatMinutes } from "../lib/format";
import type { MentorStudentDashboard } from "../types/api";

export function MentorStudentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<MentorStudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await apiGet<MentorStudentDashboard>(
          `/api/mentor/students/${studentId}/dashboard?days=14`
        );
        if (active) setData(result);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load student"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studentId]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">
      <Link
        to="/mentor"
        className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        ← All students
      </Link>

      {error && (
        <p className="mt-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading || !data ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <div className="grid gap-4 sm:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          <div className="mt-5 mb-8 animate-fade-up">
            <h1 className="text-3xl md:text-4xl">{data.student.name}</h1>
            <p className="mt-2 text-[var(--muted)]">{data.student.email}</p>
          </div>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Completed lessons"
              value={String(data.summary.completedLessons)}
              hint={`${data.summary.totalLessons} total`}
            />
            <Stat
              label="Time spent"
              value={formatMinutes(data.summary.timeSpentSeconds)}
              hint={`${data.summary.timeSpentHours} hours`}
            />
            <Stat
              label="Overall progress"
              value={`${data.summary.overallProgressPercent}%`}
              hint={`${data.summary.inProgressLessons} in progress`}
            />
            <Stat
              label="Courses"
              value={String(data.summary.enrolledCourses)}
              hint="Active enrollments"
            />
          </section>

          <section className="mb-8 grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-3">
              <h2 className="text-xl">Learning trend</h2>
              <p className="mt-1 mb-4 text-sm text-[var(--muted)]">
                Daily time spent (14 days)
              </p>
              <TrendChart series={data.timeseries.series} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
              <h2 className="text-xl">Completion mix</h2>
              <p className="mt-1 mb-4 text-sm text-[var(--muted)]">
                Lesson status distribution
              </p>
              <DistributionChart segments={data.distribution.segments} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl">Course progress</h2>
            <ul className="mt-4 divide-y divide-white/8">
              {data.summary.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {course.completedLessons}/{course.totalLessons} lessons ·{" "}
                      {formatMinutes(course.timeSpentSeconds)}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums text-[var(--accent)]">
                    {course.progressPercent}%
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
    </div>
  );
}
