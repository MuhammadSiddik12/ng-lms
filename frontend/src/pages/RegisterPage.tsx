import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/api";

export function RegisterPage() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return (
      <Navigate to={user.role === "mentor" ? "/mentor" : "/dashboard"} replace />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await register({ name, email, password, role });
      navigate(created.role === "mentor" ? "/mentor" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="mb-8 font-[family-name:var(--font-display)] text-2xl">
        NG LMS
      </Link>
      <h1 className="text-3xl">Create your account</h1>
      <p className="mt-2 text-[var(--muted)]">
        Join as a student or mentor to start tracking progress.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Name</span>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-white/12 bg-[#13241d] px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </label>

        {error && (
          <p className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#062214] transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
