import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { user } = useAuth();
  const ctaTo = user
    ? user.role === "mentor"
      ? "/mentor"
      : "/dashboard"
    : "/login";

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,242,236,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,242,236,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 animate-fade-up text-sm font-semibold tracking-[0.22em] text-[var(--accent)] uppercase">
          ProgressPulse
        </p>
        <h1 className="max-w-3xl animate-fade-up animation-delay-1 text-4xl leading-[1.05] text-[var(--ink)] md:text-6xl">
          Track learning. See the trend. Know what to do next.
        </h1>
        <p className="mt-6 max-w-xl animate-fade-up animation-delay-2 text-lg text-[var(--muted)]">
          A progressive dashboard for students and mentors — course progress, time
          spent, and visual learning insights in one place.
        </p>
        <div className="mt-9 flex animate-fade-up animation-delay-3 flex-wrap gap-3">
          <Link
            to={ctaTo}
            className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)]"
          >
            {user ? "Open dashboard" : "Sign in to continue"}
          </Link>
          {!user && (
            <Link
              to="/register"
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-[var(--ink)] transition hover:border-white/30"
            >
              Create account
            </Link>
          )}
        </div>
        <p className="mt-8 animate-fade-up animation-delay-3 text-sm text-[var(--muted)]">
          Demo: <span className="text-[var(--ink)]">student@demo.com</span> /{" "}
          <span className="text-[var(--ink)]">Demo@12345</span>
        </p>
      </div>
    </main>
  );
}
