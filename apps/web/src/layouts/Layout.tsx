import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout, isCreator, isModerator } from '@/features/auth/useAuth';
export function Layout() {
  const { user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="h-[68px] border-b border-border bg-surface">
        <div className="max-w-container mx-auto h-full px-6 flex items-center justify-between gap-6">
          <Link to="/" aria-label="IDEVRX home">
            <Wordmark />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'text-brand-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }
            >
              Home
            </NavLink>

            {!isCreator(user) && user && (
              <NavLink
                to="/creator/apply"
                className={({ isActive }) =>
                  isActive
                    ? 'text-brand-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }
              >
                Become a Creator
              </NavLink>
            )}

            {isModerator(user) && (
              <NavLink
                to="/admin/creator-applications"
                className={({ isActive }) =>
                  isActive
                    ? 'text-brand-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }
              >
                Applications
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  {user.displayName}
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleLogout}
                  loading={logout.isPending}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="md">Create account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-container mx-auto px-6 py-6 text-sm text-text-muted">
          IDEVRX — Ideas engineered into reality.
        </div>
      </footer>
    </div>
  );
}
