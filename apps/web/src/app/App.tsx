import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { Layout } from '@/layouts/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CreatorApplyPage } from '@/pages/CreatorApplyPage';
import { AdminCreatorApplicationsPage } from '@/pages/AdminCreatorApplicationsPage';
import { StudioProjectsPage } from '@/pages/StudioProjectsPage';
import { NewProjectPage } from '@/pages/NewProjectPage';
import { EditProjectPage } from '@/pages/EditProjectPage';
import { AppHomePage } from '@/pages/AppHomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { HelpPage } from '@/pages/HelpPage';
import { LearningPage } from '@/pages/LearningPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { ComponentsPage } from '@/pages/ComponentsPage';
import { TutorialsPage } from '@/pages/TutorialsPage';
import { CreatorGuidelinesPage } from '@/pages/CreatorGuidelinesPage';
import { CommunityGuidelinesPage } from '@/pages/CommunityGuidelinesPage';
import { PoliciesIndexPage } from '@/pages/policies/PoliciesIndexPage';
import { PrivacyPage } from '@/pages/policies/PrivacyPage';
import { TermsPage } from '@/pages/policies/TermsPage';
import { CookiesPage } from '@/pages/policies/CookiesPage';
import { CopyrightPage } from '@/pages/policies/CopyrightPage';
import { SafetyPage } from '@/pages/policies/SafetyPage';
import { AiPolicyPage } from '@/pages/policies/AiPolicyPage';
import { AccessibilityPage } from '@/pages/policies/AccessibilityPage';
import { BlogIndexPage } from '@/pages/BlogIndexPage';
import { FirstRoverPage } from '@/pages/blog/FirstRoverPage';
import { CreatorGuidelinesBlogPage } from '@/pages/blog/CreatorGuidelinesBlogPage';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { useCurrentUser } from '@/features/auth/useAuth';

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RootPage() {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) {
    return (
      <div style={{ padding: 64, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ height: 32, width: 200, background: '#E2E8F0', borderRadius: 6 }} />
      </div>
    );
  }
  return user ? <AppHomePage /> : <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      {/* Public shell */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootPage />} />

        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/ide/:projectNumber/:slug" element={<ProjectDetailPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/creator-guidelines" element={<CreatorGuidelinesPage />} />
        <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />

        <Route path="/policies" element={<PoliciesIndexPage />} />
        <Route path="/policies/privacy" element={<PrivacyPage />} />
        <Route path="/policies/terms" element={<TermsPage />} />
        <Route path="/policies/cookies" element={<CookiesPage />} />
        <Route path="/policies/copyright" element={<CopyrightPage />} />
        <Route path="/policies/safety" element={<SafetyPage />} />
        <Route path="/policies/ai" element={<AiPolicyPage />} />
        <Route path="/policies/accessibility" element={<AccessibilityPage />} />

        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/first-rover" element={<FirstRoverPage />} />
        <Route path="/blog/creator-guidelines" element={<CreatorGuidelinesBlogPage />} />

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
      </Route>

      {/* App shell (same nav/footer, but real pages) */}
      <Route element={<Layout />}>
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/creator/apply" element={<RequireAuth><CreatorApplyPage /></RequireAuth>} />
        <Route path="/studio" element={<RequireAuth><StudioProjectsPage /></RequireAuth>} />
        <Route path="/studio/new" element={<RequireAuth><NewProjectPage /></RequireAuth>} />
        <Route path="/studio/project/:id" element={<RequireAuth><EditProjectPage /></RequireAuth>} />
        <Route path="/admin/creator-applications" element={<RequireAuth><AdminCreatorApplicationsPage /></RequireAuth>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
