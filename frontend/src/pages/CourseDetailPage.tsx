import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Skeleton } from "../components/ui/Skeleton";
import { apiGet, getErrorMessage } from "../lib/api";
import { formatMinutes } from "../lib/format";
import type { CourseDetail } from "../types/api";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet<{ course: CourseDetail }>(
          `/api/courses/${courseId}`
        );
        if (active) setCourse(data.course);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load course"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
      <Link
        to="/courses"
        className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        ← All courses
      </Link>

      {error && (
        <p className="mt-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading || !course ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-20" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <>
          <div className="mt-5 animate-fade-up">
            <p className="text-xs tracking-wide text-[var(--accent)] uppercase">
              {course.category}
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              {course.description || "No description provided."}
            </p>
            <div className="mt-5 max-w-md">
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>
                  {course.completedLessons}/{course.totalLessons} lessons complete
                </span>
                <span>{course.progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl">Lessons</h2>
            <ul className="mt-4 divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03]">
              {course.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    to={`/lessons/${lesson.id}`}
                    className="flex flex-col gap-2 px-5 py-4 transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--muted)]">
                        Lesson {lesson.orderIndex}
                      </p>
                      <p className="truncate font-medium">{lesson.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        Est. {lesson.durationMinutes} min · Logged{" "}
                        {formatMinutes(lesson.timeSpentSeconds)}
                      </p>
                    </div>
                    <StatusBadge status={lesson.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
