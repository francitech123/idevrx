import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { ErrorBoundary } from '@/components/site/ErrorBoundary';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <div
        className={`app-scrim${sidebarOpen ? ' on' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <AppSidebar
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <div className="app-wrap">
        <AppTopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="app-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
