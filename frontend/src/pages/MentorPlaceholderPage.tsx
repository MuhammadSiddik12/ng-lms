export function MentorPlaceholderPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl">Mentor workspace</h1>
      <p className="mt-3 text-[var(--muted)]">
        Mentor student lists and oversight dashboards arrive in Milestone 7. Auth and
        role routing are already wired — try the student demo for charts now.
      </p>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Student demo: <span className="text-[var(--ink)]">student@demo.com</span> /{" "}
        <span className="text-[var(--ink)]">Demo@12345</span>
      </p>
    </main>
  );
}
