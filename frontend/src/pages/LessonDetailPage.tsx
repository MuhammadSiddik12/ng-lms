import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Skeleton } from "../components/ui/Skeleton";
import { apiGet, apiPatch, apiPost, getErrorMessage } from "../lib/api";
import { formatMinutes, formatTimer } from "../lib/format";
import { getLessonQuestions } from "../lib/lessonQuestions";
import type { LessonDetail, LessonProgressUpdate } from "../types/api";

type Phase = "idle" | "learning" | "question";

function sessionKey(lessonId: string) {
  return `nglms_session_${lessonId}`;
}

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [questionError, setQuestionError] = useState("");
  const [lastSessionSeconds, setLastSessionSeconds] = useState<number | null>(null);

  // One wrap-up question after learning
  const question = useMemo(() => {
    if (!lesson) return null;
    return getLessonQuestions(lesson)[0] ?? null;
  }, [lesson]);

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
        if (!active) return;
        setLesson(data.lesson);

        const raw = sessionStorage.getItem(sessionKey(lessonId));
        if (raw && data.lesson.progress.status !== "completed") {
          const parsed = Number(raw);
          if (!Number.isNaN(parsed) && parsed > 0) {
            setStartedAt(parsed);
            setPhase("learning");
          }
        }
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

  useEffect(() => {
    if ((phase !== "learning" && phase !== "question") || startedAt == null) {
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  async function startLesson() {
    if (!lesson) return;
    setBusy("start");
    setActionError("");
    setSuccess("");
    setLastSessionSeconds(null);
    setSelectedAnswer(undefined);
    setQuestionError("");

    try {
      const data = await apiPatch<{ progress: LessonProgressUpdate }>(
        `/api/lessons/${lesson.id}/progress`,
        { status: "in_progress" }
      );

      const now = Date.now();
      sessionStorage.setItem(sessionKey(lesson.id), String(now));
      setStartedAt(now);
      setElapsed(0);
      setPhase("learning");
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
      setSuccess("Timer started. Read the lesson, then answer the question when ready.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not start lesson"));
    } finally {
      setBusy(null);
    }
  }

  function goToQuestion() {
    setSuccess("");
    setQuestionError("");
    setSelectedAnswer(undefined);
    setPhase("question");
  }

  async function submitQuestion() {
    if (!lesson || !question || startedAt == null) return;

    if (selectedAnswer === undefined) {
      setQuestionError("Select an answer to finish the session.");
      return;
    }

    const isCorrect = selectedAnswer === question.correctIndex;
    if (!isCorrect) {
      setQuestionError("Not quite — try again, then submit to end the timer.");
      return;
    }

    const seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
    setBusy("submit");
    setQuestionError("");
    setActionError("");
    setSuccess("");

    try {
      await apiPost("/api/activities", {
        lessonId: lesson.id,
        courseId: lesson.course?.id,
        eventType: "quiz_attempt",
        durationSeconds: 0,
        metadata: {
          questionId: question.id,
          correct: true,
          selectedAnswer,
        },
      });

      await apiPost("/api/activities", {
        lessonId: lesson.id,
        courseId: lesson.course?.id,
        eventType: "time_logged",
        durationSeconds: seconds,
        metadata: { source: "session_timer" },
      });

      const data = await apiPatch<{ progress: LessonProgressUpdate }>(
        `/api/lessons/${lesson.id}/progress`,
        { status: "completed" }
      );

      sessionStorage.removeItem(sessionKey(lesson.id));
      setStartedAt(null);
      setElapsed(0);
      setLastSessionSeconds(seconds);
      setPhase("idle");
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
      setSuccess(
        `Correct! Session time: ${formatTimer(seconds)} (${formatMinutes(seconds)}). Lesson completed.`
      );
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not save session"));
    } finally {
      setBusy(null);
    }
  }

  const isCompleted = lesson?.progress.status === "completed";
  const canStart =
    !isCompleted &&
    phase === "idle" &&
    (lesson?.progress.status === "not_started" ||
      lesson?.progress.status === "in_progress");

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

          {(phase === "learning" || phase === "question") && (
            <div className="mt-6 animate-fade-up rounded-2xl border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-5 py-4">
              <p className="text-sm text-[var(--muted)]">Session timer</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-tight tabular-nums text-[var(--accent)]">
                {formatTimer(elapsed)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {phase === "learning"
                  ? "Read the lesson below. When you’re ready, answer the question to stop the timer."
                  : "Submit your answer to stop the timer and save your study time."}
              </p>
            </div>
          )}

          <article className="mt-8 animate-fade-up animation-delay-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg">What you’ll learn</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--ink)]/90">
              {lesson.content}
            </p>
          </article>

          {phase === "question" && question && (
            <section className="mt-6 animate-fade-up rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg">Check your understanding</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Answer correctly to end the session and save your study time.
              </p>

              <fieldset className="mt-5 space-y-2">
                <legend className="text-sm font-medium">{question.prompt}</legend>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = selectedAnswer === optionIndex;
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                          selected
                            ? "border-[var(--accent)]/50 bg-[var(--accent)]/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={selected}
                          onChange={() => setSelectedAnswer(optionIndex)}
                          className="accent-[var(--accent)]"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {questionError && (
                <p className="mt-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
                  {questionError}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={submitQuestion}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
                >
                  {busy === "submit" ? "Submitting…" : "Submit & end timer"}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => {
                    setPhase("learning");
                    setQuestionError("");
                  }}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[var(--muted)] transition hover:border-white/30"
                >
                  Back to lesson
                </button>
              </div>
            </section>
          )}

          <section className="mt-6 animate-fade-up animation-delay-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg">Study session</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isCompleted
                ? "This lesson is complete. You can review the content anytime."
                : phase === "learning"
                  ? "Take your time with the material, then continue to the question."
                  : phase === "question"
                    ? "Timer is still running until you submit."
                    : "Start the lesson to begin the timer and study the content."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {canStart && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={startLesson}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
                >
                  {busy === "start"
                    ? "Starting…"
                    : lesson.progress.status === "in_progress"
                      ? "Resume lesson"
                      : "Start lesson"}
                </button>
              )}

              {phase === "learning" && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={goToQuestion}
                  className="rounded-lg border border-[var(--accent)]/40 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)]/10 disabled:opacity-60"
                >
                  I’m ready — ask me a question
                </button>
              )}
            </div>

            {lastSessionSeconds != null && phase === "idle" && (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--muted)]">
                Last session:{" "}
                <span className="text-[var(--ink)]">
                  {formatTimer(lastSessionSeconds)}
                </span>{" "}
                ({formatMinutes(lastSessionSeconds)})
              </div>
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
