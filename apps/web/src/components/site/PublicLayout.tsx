import { Outlet, useLocation } from 'react-router-dom';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import { ErrorBoundary } from './ErrorBoundary';
import { useCurrentUser } from '@/features/auth/useAuth';

export function PublicLayout() {
  const location = useLocation();
  const { user } = useCurrentUser();

  // Hide footer on these conditions:
  // 1. Root path (/) when signed in → user sees app home, not landing
  // 2. /explore when signed in
  // 3. Any authenticated app page reachable via public shell (defensive)
  const hideFooter =
    (location.pathname === '/' && user) ||
    (location.pathname.startsWith('/explore') && user) ||
    (location.pathname.startsWith('/ide/') && user);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteNav />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
