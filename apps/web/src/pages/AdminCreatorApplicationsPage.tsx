import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/features/auth/useAuth';
import { useReviewList, useReviewApplication } from '@/features/creator/useCreator';
import type { CreatorApplicationForReview } from '@/features/creator/creatorApi';

export function AdminCreatorApplicationsPage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied'>('pending');
  const { data, isLoading } = useReviewList(status);
  const review = useReviewApplication();

  const canReview =
    !!user &&
    (user.roles.includes('moderator') ||
      user.roles.includes('admin') ||
      user.roles.includes('ceo'));

  if (authLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!canReview) return <Navigate to="/" replace />;

  const applications = data?.applications ?? [];

  return (
    <div className="max-w-container mx-auto px-6 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Creator applications</h1>
        <p className="text-text-secondary text-sm">
          Review requests from Registered Users who want to become Creators.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'denied'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              'px-3 py-1.5 text-sm rounded-button border transition-colors ' +
              (status === s
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-surface border-border text-text-secondary hover:text-text-primary')
            }
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-card animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-secondary">
          No {status} applications.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onApprove={() => review.mutate({ id: app.id, decision: 'approved' })}
              onDeny={(note) => review.mutate({ id: app.id, decision: 'denied', note })}
              busy={review.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  onApprove,
  onDeny,
  busy,
}: {
  app: CreatorApplicationForReview;
  onApprove: () => void;
  onDeny: (note: string) => void;
  busy: boolean;
}) {
  const [showDeny, setShowDeny] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold text-text-primary">
            {app.user?.displayName ?? 'Unknown user'}
          </p>
          <p className="text-sm text-text-secondary">
            @{app.user?.username ?? '—'} · {app.user?.email ?? '—'}
          </p>
        </div>
        <span
          className={
            'text-xs px-2 py-0.5 rounded-pill border ' +
            (app.status === 'pending'
              ? 'border-warning text-warning'
              : app.status === 'approved'
              ? 'border-success text-success'
              : 'border-error text-error')
          }
        >
          {app.status}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <Section label="Motivation" value={app.motivation} />
        {app.experience && <Section label="Experience" value={app.experience} />}
        {app.portfolioUrl && (
          <div>
            <p className="text-text-muted text-xs mb-1">Portfolio</p>
            <a
              href={app.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline break-all"
            >
              {app.portfolioUrl}
            </a>
          </div>
        )}
        <p className="text-xs text-text-muted">
          Submitted {new Date(app.submittedAt).toLocaleString()}
        </p>
      </div>

      {app.status === 'pending' && (
        <div className="mt-4 space-y-2">
          {!showDeny ? (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={onApprove}
                disabled={busy}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowDeny(true)}
                disabled={busy}
              >
                Deny
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Optional note to the applicant (they will see this)"
                className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => onDeny(note)}
                  disabled={busy}
                  loading={busy}
                >
                  Confirm denial
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowDeny(false);
                    setNote('');
                  }}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {app.status !== 'pending' && app.reviewNote && (
        <div className="mt-3 text-xs text-text-secondary">
          Review note: {app.reviewNote}
        </div>
      )}
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-text-primary whitespace-pre-wrap">{value}</p>
    </div>
  );
}
