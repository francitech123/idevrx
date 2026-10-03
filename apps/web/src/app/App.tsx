import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/layouts/Layout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { CreatorApplyPage } from '@/pages/CreatorApplyPage';
import { AdminCreatorApplicationsPage } from '@/pages/AdminCreatorApplicationsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
