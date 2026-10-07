import { Outlet, useLocation } from 'react-router-dom';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import { ErrorBoundary } from './ErrorBoundary';
import { useCurrentUser } from '@/features/auth/useAuth';

const PUBLIC_INFORMATIONAL = [
  '/about',
  '/contact',
  '/help',
  '/learning',
  '/community',
  '/challenges',
  '/components',
  '/tutorials',
  '/creator-guidelines',
  '/community-guidelines',
  '/policies',
  '/blog',
];

export function PublicLayout() {
  const location = useLocation();
  const { user } = useCurrentUser();
  const path = location.pathname;

  // Footer shows ONLY on:
  // 1. Public informational pages (guest or signed in — always)
  // 2. Root landing when guest
  // 3. /explore when guest
  // 4. /ide/... when guest
  // Never on: app pages, or when signed in on non-informational pages
  const isInformational = PUBLIC_INFORMATIONAL.some(
    (p) => path === p || path.startsWith(p + '/')
  );

  const isExplore = path.startsWith('/explore');
  const isProject = path.startsWith('/ide/');
  const isLanding = path === '/';

  const isAuthPage = path === '/login' || path === '/register';

  const showFooter =
    isInformational ||
    (!user && isLanding) ||
    (!user && isExplore) ||
    (!user && isProject) ||
    isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteNav />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
