import { Outlet, useLocation } from 'react-router-dom';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import { ErrorBoundary } from './ErrorBoundary';
import { useCurrentUser } from '@/features/auth/useAuth';

/** Public informational pages — footer always shows here, for guests and users. */
const INFORMATIONAL_PREFIXES = [
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

/** Pages that must never show a footer. */
const NO_FOOTER_EXACT = ['/login', '/register'];
const NO_FOOTER_PREFIXES = ['/settings', '/studio', '/admin', '/creator/apply'];

export function PublicLayout() {
  const location = useLocation();
  const { user } = useCurrentUser();
  const path = location.pathname;

  // Hard "no footer" rules take priority
  const isHardNoFooter =
    NO_FOOTER_EXACT.includes(path) ||
    NO_FOOTER_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

  if (isHardNoFooter) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SiteNav />
        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  // Informational pages — always show footer
  const isInformational = INFORMATIONAL_PREFIXES.some(
    (p) => path === p || path.startsWith(p + '/')
  );

  // Root / explore / project pages — footer only for guests
  const isRoot = path === '/';
  const isExplore = path.startsWith('/explore');
  const isProject = path.startsWith('/ide/');

  const showFooter = isInformational || !user
    ? isInformational || isRoot || isExplore || isProject
    : false;

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
