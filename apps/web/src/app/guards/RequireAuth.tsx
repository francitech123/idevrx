import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/features/auth/useAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="idx-container" style={{ padding: 64 }}>
        <div style={{ height: 32, width: 200, background: '#E2E8F0', borderRadius: 6 }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
