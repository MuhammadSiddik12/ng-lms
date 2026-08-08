import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Skeleton } from "../components/ui/Skeleton";
import { apiGet, apiPatch, apiPost, getErrorMessage } from "../lib/api";
import { formatMinutes } from "../lib/format";
import type { LessonDetail, LessonProgressUpdate } from "../types/api";

const TIME_OPTIONS = [
  { label: "+5 min", seconds: 300 },
  { label: "+10 min", seconds: 600 },
  { label: "+15 min", seconds: 900 },
];

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function loadLesson() {
    if (!lessonId) return;
    const data = await apiGet<{ lesson: LessonDetail }>(`/api/lessons/${lessonId}`);
    setLesson(data.lesson);
  }

  useEffect(() => {
    if (!lessonId) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet<{ lesson: LessonDetail }>(
          `/api/lessons/${lessonId}`
        );
        if (active) setLesson(data.lesson);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load lesson"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId]);

  async function startLesson() {
    if (!lesson) return;
    setBusy("start");
    setActionError("");
    setSuccess("");
    try {
      const data = await apiPatch<{ progress: LessonProgressUpdate }>(
        `/api/lessons/${lesson.id}/progress`,
        { status: "in_progress" }
      );
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                status: data.progress.status,
                timeSpentSeconds: data.progress.timeSpentSeconds,
                completedAt: data.progress.completedAt,
              },
            }
          : prev
      );
      setSuccess("Lesson started. Keep going!");
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not start lesson"));
    } finally {
      setBusy(null);
    }
  }

  async function logTime(seconds: number) {
    if (!lesson) return;
    setBusy(`time-${seconds}`);
    setActionError("");
    setSuccess("");
    try {
      await apiPost("/api/activities", {
        lessonId: lesson.id,
        courseId: lesson.course?.id,
        eventType: "time_logged",
        durationSeconds: seconds,
      });
      await loadLesson();
      setSuccess(`Logged ${formatMinutes(seconds)} of study time.`);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not log time"));
    } finally {
      setBusy(null);
    }
  }

  async function completeLesson() {
    if (!lesson) return;
    setBusy("complete");
    setActionError("");
    setSuccess("");
    try {
      const data = await apiPatch<{ progress: LessonProgressUpdate }>(
        `/api/lessons/${lesson.id}/progress`,
        { status: "completed" }
      );
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                status: data.progress.status,
                timeSpentSeconds: data.progress.timeSpentSeconds,
                completedAt: data.progress.completedAt,
              },
            }
          : prev
      );
      setSuccess("Lesson marked complete. Nice work!");
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not complete lesson"));
    } finally {
      setBusy(null);
    }
  }

  const isCompleted = lesson?.progress.status === "completed";
  const isNotStarted = lesson?.progress.status === "not_started";

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
      {lesson?.course ? (
        <Link
          to={`/courses/${lesson.course.id}`}
          className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          ← {lesson.course.title}
        </Link>
      ) : (
        <Link
          to="/courses"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          ← All courses
        </Link>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading || !lesson ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-40" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <>
          <div className="mt-5 animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-[var(--muted)]">
                Lesson {lesson.orderIndex}
                {lesson.course ? ` · ${lesson.course.category}` : ""}
              </p>
              <StatusBadge status={lesson.progress.status} />
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl">{lesson.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Est. {lesson.durationMinutes} min · Logged{" "}
              {formatMinutes(lesson.progress.timeSpentSeconds)}
            </p>
          </div>

          <article className="mt-8 animate-fade-up animation-delay-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg">Lesson content</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--ink)]/90">
              {lesson.content}
            </p>
          </article>

          <section className="mt-6 animate-fade-up animation-delay-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg">Track your learning</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Log time as you study, then mark the lesson complete when you finish.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {isNotStarted && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={startLesson}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
                >
                  {busy === "start" ? "Starting…" : "Start lesson"}
                </button>
              )}

              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.seconds}
                  type="button"
                  disabled={busy !== null || isNotStarted}
                  onClick={() => logTime(option.seconds)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[var(--ink)] transition hover:border-white/30 disabled:opacity-40"
                >
                  {busy === `time-${option.seconds}` ? "Logging…" : option.label}
                </button>
              ))}

              <button
                type="button"
                disabled={busy !== null || isCompleted || isNotStarted}
                onClick={completeLesson}
                className="rounded-lg border border-[var(--accent)]/40 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)]/10 disabled:opacity-40"
              >
                {busy === "complete"
                  ? "Saving…"
                  : isCompleted
                    ? "Completed"
                    : "Mark complete"}
              </button>
            </div>

            {isNotStarted && (
              <p className="mt-3 text-xs text-[var(--muted)]">
                Start the lesson before logging time.
              </p>
            )}

            {actionError && (
              <p className="mt-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
                {actionError}
              </p>
            )}
            {success && (
              <p className="mt-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-sm text-[var(--accent)]">
                {success}
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
