import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { apiGet, getErrorMessage } from "../lib/api";
import { formatMinutes } from "../lib/format";
import type { MentorStudentSummary } from "../types/api";

export function MentorPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<MentorStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet<{ students: MentorStudentSummary[] }>(
          "/api/mentor/students"
        );
        if (active) setStudents(data.students);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load students"));
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
        <p className="text-sm text-[var(--muted)]">Mentor workspace</p>
        <h1 className="mt-1 text-3xl md:text-4xl">{user?.name}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Monitor assigned learners — progress, time spent, and engagement at a glance.
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-[var(--muted)]">
          No students assigned yet.
        </div>
      ) : (
        <ul className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03]">
          {students.map((student) => (
            <li key={student.id}>
              <Link
                to={`/mentor/students/${student.id}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-[var(--muted)]">{student.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm sm:text-right">
                  <div>
                    <p className="text-[var(--muted)]">Progress</p>
                    <p className="tabular-nums">{student.overallProgressPercent}%</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Lessons</p>
                    <p className="tabular-nums">
                      {student.completedLessons}/{student.totalLessons}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Time</p>
                    <p className="tabular-nums">
                      {formatMinutes(student.timeSpentSeconds)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
