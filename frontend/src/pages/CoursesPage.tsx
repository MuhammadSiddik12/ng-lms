import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "../components/ui/Skeleton";
import { apiGet, getErrorMessage } from "../lib/api";
import type { CourseListItem } from "../types/api";

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet<{ courses: CourseListItem[] }>("/api/courses");
        if (active) setCourses(data.courses);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load courses"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl md:text-4xl">Your courses</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Open a course to continue lessons, log study time, and mark progress.
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-[var(--muted)]">No enrolled courses yet.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className={`group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[var(--accent)]/40 hover:bg-white/[0.05] animate-fade-up animation-delay-${Math.min(index + 1, 3)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-wide text-[var(--accent)] uppercase">
                    {course.category}
                  </p>
                  <h2 className="mt-1 text-xl group-hover:text-[var(--accent)]">
                    {course.title}
                  </h2>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-[var(--muted)]">
                  {course.progressPercent}%
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                {course.description || "No description provided."}
              </p>
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                  <span>
                    {course.completedLessons}/{course.totalLessons} lessons
                  </span>
                  <span>Continue →</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
