import { Link } from "react-router-dom";

export function CoursesPlaceholderPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl">Courses</h1>
      <p className="mt-3 text-[var(--muted)]">
        Course and lesson flows land in the next milestone. Your dashboard already
        shows live progress from the API.
      </p>
      <Link to="/dashboard" className="mt-6 inline-block text-[var(--accent)] hover:underline">
        Back to dashboard
      </Link>
    </main>
  );
}
