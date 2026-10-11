import { useState } from 'react';
import { Navigate } from 'react-router-dom';
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
      <div className="idx-page">
        <div
          style={{
            height: 32,
            width: 200,
            background: 'var(--color-paper-muted)',
            borderRadius: 6,
          }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!canReview) return <Navigate to="/" replace />;

  const applications = data?.applications ?? [];

  return (
    <div className="idx-page" style={{ maxWidth: 900 }}>
      <div className="idx-eyebrow">Moderation</div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4.2vw, 48px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.08,
          margin: '14px 0 12px',
          color: 'var(--color-ink)',
        }}
      >
        Creator applications
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-muted)',
          fontSize: 16,
          marginBottom: 32,
        }}
      >
        Review requests from Registered Users who want to become Creators.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        {(['pending', 'approved', 'denied'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '10px 4px',
              border: 0,
              background: 'none',
              borderBottom:
                status === s
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              color:
                status === s ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: 'var(--font-sans)',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 140,
                background: 'var(--color-paper-muted)',
                borderRadius: 10,
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed var(--color-line-strong)',
            borderRadius: 10,
            color: 'var(--color-muted)',
            background: 'var(--color-card)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          No {status} applications.
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onApprove={() => review.mutate({ id: app.id, decision: 'approved' })}
              onDeny={(note) =>
                review.mutate({ id: app.id, decision: 'denied', note })
              }
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

  const statusColor =
    app.status === 'pending'
      ? 'var(--color-warning)'
      : app.status === 'approved'
      ? 'var(--color-success)'
      : 'var(--color-error)';

  const statusBg =
    app.status === 'pending'
      ? 'var(--color-warning-bg)'
      : app.status === 'approved'
      ? 'var(--color-success-bg)'
      : 'var(--color-error-bg)';

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        padding: 22,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '-0.012em',
              marginBottom: 4,
              color: 'var(--color-ink)',
            }}
          >
            {app.user?.displayName ?? 'Unknown user'}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-muted)',
            }}
          >
            @{app.user?.username ?? '—'} · {app.user?.email ?? '—'}
          </p>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: statusColor,
            background: statusBg,
            border: `1px solid ${statusColor}`,
            padding: '3px 10px',
            borderRadius: 999,
          }}
        >
          {app.status}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
        }}
      >
        <Section label="Motivation" value={app.motivation} />
        {app.experience && <Section label="Experience" value={app.experience} />}
        {app.portfolioUrl && (
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--color-muted)',
                marginBottom: 4,
              }}
            >
              Portfolio
            </p>
            <a
              href={app.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-accent)',
                textDecoration: 'none',
                wordBreak: 'break-all',
              }}
            >
              {app.portfolioUrl}
            </a>
          </div>
        )}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
          }}
        >
          Submitted {new Date(app.submittedAt).toLocaleString()}
        </p>
      </div>

      {app.status === 'pending' && (
        <div style={{ marginTop: 18 }}>
          {!showDeny ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onApprove}
                disabled={busy}
                style={{
                  padding: '9px 20px',
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-ink)',
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: busy ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Approve
              </button>
              <button
                onClick={() => setShowDeny(true)}
                disabled={busy}
                style={{
                  padding: '9px 20px',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-line-strong)',
                  color: 'var(--color-ink)',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: busy ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Deny
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Optional note to the applicant (they will see this)"
                style={{
                  width: '100%',
                  border: '1px solid var(--color-line)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => onDeny(note)}
                  disabled={busy}
                  style={{
                    padding: '9px 20px',
                    background: 'var(--color-error)',
                    color: 'var(--color-on-ink)',
                    border: 0,
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: busy ? 'wait' : 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {busy ? 'Denying...' : 'Confirm denial'}
                </button>
                <button
                  onClick={() => {
                    setShowDeny(false);
                    setNote('');
                  }}
                  disabled={busy}
                  style={{
                    padding: '9px 20px',
                    background: 'transparent',
                    border: 0,
                    color: 'var(--color-muted)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {app.status !== 'pending' && app.reviewNote && (
        <div
          style={{
            marginTop: 16,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-muted)',
          }}
        >
          Review note: {app.reviewNote}
        </div>
      )}
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--color-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {value}
      </p>
    </div>
  );
}
