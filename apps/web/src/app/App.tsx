import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { AppShell } from '@/components/app/AppShell';
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
import { HomeFeedPage } from '@/pages/app/HomeFeedPage';
import { FollowingPage } from '@/pages/app/FollowingPage';
import { LibraryPage } from '@/pages/app/LibraryPage';
import { LearningHubPage } from '@/pages/app/LearningHubPage';
import { CourseDetailPage } from '@/pages/app/CourseDetailPage';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { useCurrentUser } from '@/features/auth/useAuth';

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
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
  if (user) return <Navigate to="/home" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootPage />} />
        <Route path="/explore" element={<ExplorePage />} />

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

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/home" element={<HomeFeedPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/:tab" element={<SettingsPage />} />
        <Route path="/learning-hub" element={<LearningHubPage />} />
        <Route path="/learning-hub/course/:slug" element={<CourseDetailPage />} />

        <Route path="/ide/:projectNumber/:slug" element={<ProjectDetailPage />} />

        <Route path="/creator/apply" element={<CreatorApplyPage />} />
        <Route path="/studio" element={<StudioProjectsPage />} />
        <Route path="/studio/new" element={<NewProjectPage />} />
        <Route path="/studio/project/:id" element={<EditProjectPage />} />
        <Route path="/admin/creator-applications" element={<AdminCreatorApplicationsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { AppShell } from '@/components/app/AppShell';
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
import { HomeFeedPage } from '@/pages/app/HomeFeedPage';
import { FollowingPage } from '@/pages/app/FollowingPage';
import { LibraryPage } from '@/pages/app/LibraryPage';
import { LearningHubPage } from '@/pages/app/LearningHubPage';
import { CourseDetailPage } from '@/pages/app/CourseDetailPage';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { useCurrentUser } from '@/features/auth/useAuth';

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
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
  if (user) return <Navigate to="/home" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootPage />} />
        <Route path="/explore" element={<ExplorePage />} />

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

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/home" element={<HomeFeedPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/:tab" element={<SettingsPage />} />
        <Route path="/learning-hub" element={<LearningHubPage />} />
        <Route path="/learning-hub/course/:slug" element={<CourseDetailPage />} />

        <Route path="/ide/:projectNumber/:slug" element={<ProjectDetailPage />} />

        <Route path="/creator/apply" element={<CreatorApplyPage />} />
        <Route path="/studio" element={<StudioProjectsPage />} />
        <Route path="/studio/new" element={<NewProjectPage />} />
        <Route path="/studio/project/:id" element={<EditProjectPage />} />
        <Route path="/admin/creator-applications" element={<AdminCreatorApplicationsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
