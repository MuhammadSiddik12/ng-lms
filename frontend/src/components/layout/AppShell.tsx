import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition ${
      isActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0c1612]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to={user?.role === "mentor" ? "/mentor" : "/dashboard"} className="group">
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tight">
              ProgressPulse
            </span>
            <span className="ml-2 text-xs text-[var(--muted)] group-hover:text-[var(--accent)]">
              learning insights
            </span>
          </Link>

          <nav className="flex items-center gap-5">
            {user?.role === "student" ? (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/courses" className={navClass}>
                  Courses
                </NavLink>
              </>
            ) : (
              <NavLink to="/mentor" className={navClass}>
                Mentorship
              </NavLink>
            )}
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-white/30 hover:text-[var(--ink)]"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
