import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/features/auth/useAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-container mx-auto p-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
