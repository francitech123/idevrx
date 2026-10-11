import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/useAuth';

interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  roles: string[];
  creatorStatus: string;
  createdAt: string;
  projectCount: number;
  followers: number;
  following: number;
}

interface Project {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: string | null;
  estimatedBuildTime: string | null;
  version: string;
  counts: { views: number; likes: number; bookmarks: number; comments: number };
  publishedAt: string | null;
}

export function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${apiUrl}/api/v1/profiles/${username}`, {
        credentials: 'include',
      }).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found')))),
      fetch(`${apiUrl}/api/v1/profiles/${username}/projects?limit=50`).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([profileRes, projectsRes]) => {
        if (!profileRes.success) throw new Error('Not found');
        setProfile(profileRes.data.profile);
        setIsFollowing(profileRes.data.isFollowing);
        if (projectsRes?.success) setProjects(projectsRes.data.items ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  async function toggleFollow() {
    if (!profile || !user) {
      navigate('/login');
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`${apiUrl}/api/v1/users/${profile.id}/follow`, {
      method,
      credentials: 'include',
    });
    if (res.ok) {
      const b = await res.json();
      setIsFollowing(b.data.following);
      setProfile((p) =>
        p
          ? { ...p, followers: p.followers + (b.data.following ? 1 : -1) }
          : p
      );
    }
  }

  if (loading) {
    return (
      <div className="idx-container" style={{ padding: '60px 24px' }}>
        <div
          style={{
            height: 180,
            background: 'var(--color-paper-muted)',
            borderRadius: 12,
          }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="idx-page" style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 500,
            marginBottom: 16,
            color: 'var(--color-ink)',
          }}
        >
          Profile not found
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            marginBottom: 24,
          }}
        >
          No creator exists at @{username}.
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
          Browse projects
        </Link>
      </div>
    );
  }

  const isSelf = user?.id === profile.id;
  const initials = profile.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="idx-container" style={{ padding: '48px 24px 72px' }}>
      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          marginBottom: 56,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 52,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              marginBottom: 8,
              color: 'var(--color-ink)',
            }}
          >
            {profile.displayName}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              color: 'var(--color-muted)',
              marginBottom: 16,
            }}
          >
            @{profile.username}
          </p>

          {profile.bio && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                color: 'var(--color-ink-subtle)',
                lineHeight: 1.6,
                marginBottom: 20,
                maxWidth: '60ch',
              }}
            >
              {profile.bio}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: 24,
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-muted)',
              marginBottom: 22,
              flexWrap: 'wrap',
            }}
          >
            <span>
              <b style={{ color: 'var(--color-ink)' }}>
                {profile.followers.toLocaleString()}
              </b>{' '}
              followers
            </span>
            <span>
              <b style={{ color: 'var(--color-ink)' }}>
                {profile.following.toLocaleString()}
              </b>{' '}
              following
            </span>
            <span>
              <b style={{ color: 'var(--color-ink)' }}>
                {profile.projectCount}
              </b>{' '}
              published
            </span>
            <span>
              Since{' '}
              {new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          {!isSelf && (
            <button
              onClick={toggleFollow}
              style={{
                padding: '11px 26px',
                background: isFollowing
                  ? 'var(--color-card)'
                  : 'var(--color-accent)',
                color: isFollowing
                  ? 'var(--color-ink)'
                  : 'var(--color-on-ink)',
                border: isFollowing
                  ? '1px solid var(--color-line-strong)'
                  : '1px solid var(--color-accent)',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {isSelf && (
            <Link
              to="/settings/profile"
              style={{
                display: 'inline-block',
                padding: '11px 26px',
                background: 'var(--color-card)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line-strong)',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-line)',
          paddingTop: 32,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: 'var(--color-ink)',
          }}
        >
          Builds
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-muted)',
            marginBottom: 32,
          }}
        >
          {projects.length} published project{projects.length === 1 ? '' : 's'}
        </p>

        {projects.length === 0 && (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              border: '1px dashed var(--color-line-strong)',
              borderRadius: 10,
              background: 'var(--color-card)',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            No published projects yet.
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {projects.map((p) => (
              <BuildRow key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BuildRow({ project }: { project: Project }) {
  const url = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;

  return (
    <Link
      to={url}
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr auto',
        gap: 22,
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid var(--color-line)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      className="build-row"
    >
      <div
        style={{
          aspectRatio: '3 / 2',
          borderRadius: 8,
          background: 'var(--color-paper-muted)',
        }}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 6,
          }}
        >
          PROJECT {String(project.projectNumber).padStart(3, '0')}
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '-0.015em',
            lineHeight: 1.2,
            marginBottom: 6,
            color: 'var(--color-ink)',
          }}
        >
          {project.title}
        </h3>
        {project.shortDescription && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-muted)',
              lineHeight: 1.55,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.shortDescription}
          </p>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-muted)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {project.difficulty && (
          <div style={{ textTransform: 'capitalize', marginBottom: 4 }}>
            {project.difficulty}
          </div>
        )}
        {project.estimatedBuildTime && <div>{project.estimatedBuildTime}</div>}
        <div style={{ marginTop: 6 }}>
          ♥ {project.counts.likes} · 💬 {project.counts.comments}
        </div>
      </div>
    </Link>
  );
}
