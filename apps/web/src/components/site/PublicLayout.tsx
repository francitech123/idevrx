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
  const { user, isLoading: authLoading } = useCurrentUser();
  const path = location.pathname;

  // Hard "no footer" rules — independent of auth state
  const isHardNoFooter =
    NO_FOOTER_EXACT.includes(path) ||
    NO_FOOTER_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

  // Informational pages — always show footer, regardless of auth
  const isInformational = INFORMATIONAL_PREFIXES.some(
    (p) => path === p || path.startsWith(p + '/')
  );

  /**
   * Footer visibility:
   *   - hard no-footer pages → never
   *   - informational pages  → always
   *   - while auth is loading → hide (prevents flicker on reload)
   *   - otherwise            → show for guests only
   */
  let showFooter: boolean;

  if (isHardNoFooter) {
    showFooter = false;
  } else if (isInformational) {
    showFooter = true;
  } else if (authLoading) {
    showFooter = false;
  } else {
    showFooter = !user;
  }

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
