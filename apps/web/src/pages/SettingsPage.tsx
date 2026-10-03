import { Link } from 'react-router-dom';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';

export function SettingsPage() {
  const { user } = useCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Account settings</h1>

      <div className="rounded-card border border-border bg-surface p-6 space-y-1">
        <Row label="Display name" value={user.displayName} />
        <Row label="Username" value={`@${user.username}`} />
        <Row label="Email" value={user.email} />
        <Row label="Roles" value={user.roles.join(', ')} />
        <Row label="Account status" value={user.accountStatus} />
        <Row label="Creator status" value={user.creatorStatus} />
      </div>

      {!isCreator(user) && (
        <div className="mt-6 rounded-card border border-border bg-surface p-5">
          <h2 className="font-semibold mb-1">Want to publish projects?</h2>
          <p className="text-sm text-text-secondary mb-4">
            Creator access lets you document and publish engineering projects on IDEVRX.
          </p>
          <Link to="/creator/apply">
            <Button>Become a Creator</Button>
          </Link>
        </div>
      )}

      <p className="mt-4 text-xs text-text-muted">
        Role values are shown for transparency. The backend enforces all permissions.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-mono text-text-primary">{value}</span>
    </div>
  );
}
