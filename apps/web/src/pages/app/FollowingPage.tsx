import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface FollowedCreator {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  creatorStatus: string;
  projectCount: number;
  followedAt: string;
}

export function FollowingPage() {
  const [creators, setCreators] = useState<FollowedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/me/following?limit=50`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body && body.success) setCreators(body.data.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            color: 'var(--color-ink)',
          }}
        >
          Following
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 15,
          }}
        >
          Creators you follow.
        </p>
      </div>

      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 160,
                borderRadius: 10,
                background: 'var(--color-paper-muted)',
              }}
            />
          ))}
        </div>
      )}

      {!loading && creators.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed var(--color-line-strong)',
            borderRadius: 10,
            color: 'var(--color-muted)',
            background: 'var(--color-card)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 500,
              marginBottom: 8,
              color: 'var(--color-ink)',
            }}
          >
            You're not following anyone yet
          </h3>
          <p
            style={{
              marginBottom: 22,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
            }}
          >
            Follow creators and their latest work will appear here.
          </p>
          <Link
            to="/explore"
            style={{
              display: 'inline-block',
              padding: '11px 22px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              borderRadius: 6,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Find creators
          </Link>
        </div>
      )}

      {!loading && creators.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator }: { creator: FollowedCreator }) {
  const initials = creator.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      to={`/@${creator.username}`}
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        padding: 20,
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: 'var(--color-on-ink)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            lineHeight: 1.2,
            marginBottom: 2,
            color: 'var(--color-ink)',
          }}
        >
          {creator.displayName}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginBottom: 8,
          }}
        >
          @{creator.username}
        </p>

        {creator.bio && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-ink-subtle)',
              lineHeight: 1.55,
              marginBottom: 8,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {creator.bio}
          </p>
        )}

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
          }}
        >
          {creator.projectCount} project{creator.projectCount === 1 ? '' : 's'}
        </p>
      </div>
    </Link>
  );
}
