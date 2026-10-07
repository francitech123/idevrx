import { Outlet } from 'react-router-dom';
import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
