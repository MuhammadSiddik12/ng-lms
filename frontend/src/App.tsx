import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
        ProgressPulse
      </p>
      <h1 className="max-w-2xl text-4xl leading-tight text-[var(--ink)] md:text-6xl">
        Track learning. See the trend. Know what to do next.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">
        A progressive student dashboard for course progress, time spent, and mentor
        insights. Backend + seed setup is live — auth and dashboards come next.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="http://localhost:4000/api/health"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)]"
        >
          Check API health
        </a>
        <span className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-[var(--muted)]">
          Milestone 1 scaffold ready
        </span>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
