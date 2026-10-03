import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/layouts/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { AppHomePage } from '@/pages/AppHomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CreatorApplyPage } from '@/pages/CreatorApplyPage';
import { AdminCreatorApplicationsPage } from '@/pages/AdminCreatorApplicationsPage';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { useCurrentUser } from '@/features/auth/useAuth';

// Route guard: for pages that should NOT be accessible when logged in (login, register)
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Root route: landing for guests, app home for logged-in users
function RootPage() {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) {
    return (
      <div className="max-w-container mx-auto p-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }
  return user ? <AppHomePage /> : <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RootPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/creator/apply"
          element={
            <RequireAuth>
              <CreatorApplyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/creator-applications"
          element={
            <RequireAuth>
              <AdminCreatorApplicationsPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
