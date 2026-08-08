import type { ProgressStatus } from "../../types/api";

const STYLES: Record<ProgressStatus, string> = {
  not_started: "border-white/15 bg-white/5 text-[var(--muted)]",
  in_progress: "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
  completed: "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]",
};

const LABELS: Record<ProgressStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
