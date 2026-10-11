import { Outlet, useLocation } from 'react-router-dom';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import { ErrorBoundary } from './ErrorBoundary';
import { useCurrentUser } from '@/features/auth/useAuth';

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

const NO_FOOTER_EXACT = ['/login', '/register'];
const NO_FOOTER_PREFIXES = ['/settings', '/studio', '/admin', '/creator/apply'];

export function PublicLayout() {
  const location = useLocation();
  const { user, isLoading: authLoading } = useCurrentUser();
  const path = location.pathname;

  const isHardNoFooter =
    NO_FOOTER_EXACT.includes(path) ||
    NO_FOOTER_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

  const isInformational = INFORMATIONAL_PREFIXES.some(
    (p) => path === p || path.startsWith(p + '/')
  );

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
      }}
    >
      <SiteNav />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
