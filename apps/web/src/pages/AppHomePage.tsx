import { Link } from 'react-router-dom';
import { useCurrentUser, isCreator, isModerator } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';

export function AppHomePage() {
  const { user } = useCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName}.</h1>
        <p className="text-text-secondary">
          Explore engineering projects, learn from builders, and document your own work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickCard
          title="Explore projects"
          desc="Browse published engineering projects."
          to="/explore"
          cta="Open Explore"
        />

        {isCreator(user) && (
          <QuickCard
            title="Creator Studio"
            desc="Create and manage your engineering projects."
            to="/studio"
            cta="Open Studio"
          />
        )}

        {!isCreator(user) && (
          <QuickCard
            title="Become a Creator"
            desc="Apply to publish engineering projects on IDEVRX."
            to="/creator/apply"
            cta="Apply now"
          />
        )}

        {isModerator(user) && (
          <QuickCard
            title="Review applications"
            desc="Review pending Creator applications."
            to="/admin/creator-applications"
            cta="Open review"
          />
        )}

        <QuickCard
          title="Account settings"
          desc="Manage your account and preferences."
          to="/settings"
          cta="Open settings"
        />
      </div>
    </div>
  );
}

function QuickCard({
  title,
  desc,
  to,
  cta,
}: {
  title: string;
  desc: string;
  to: string;
  cta: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 flex flex-col">
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4 flex-1">{desc}</p>
      <Link to={to}>
        <Button variant="secondary" size="md">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
