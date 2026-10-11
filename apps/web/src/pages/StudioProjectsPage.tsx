import { Link, Navigate } from 'react-router-dom';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { useMyProjects } from '@/features/projects/useProjects';
import type { ProjectListItem } from '@/features/projects/projectApi';

export function StudioProjectsPage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data, isLoading } = useMyProjects({ limit: 50 });

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
  if (!isCreator(user)) return <Navigate to="/creator/apply" replace />;

  const projects = data?.items ?? [];

  return (
    <div className="idx-page" style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 24,
          marginBottom: 40,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="idx-eyebrow">Studio</div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.2vw, 48px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
              margin: '14px 0 10px',
              color: 'var(--color-ink)',
            }}
          >
            Creator Studio
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
              fontSize: 16,
            }}
          >
            Manage your drafts and published projects.
          </p>
        </div>
        <Link
          to="/studio/new"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
          }}
        >
          New project
        </Link>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 96,
                background: 'var(--color-paper-muted)',
                borderRadius: 10,
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed var(--color-line-strong)',
            borderRadius: 10,
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
            No projects yet
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
              marginBottom: 24,
            }}
          >
            Start your first engineering project.
          </p>
          <Link
            to="/studio/new"
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
            Create your first project
          </Link>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map((p) => (
            <StudioProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudioProjectRow({ project }: { project: ProjectListItem }) {
  const publicUrl = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;
  const isLive = project.status === 'published' || project.status === 'updated';

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
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
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            marginBottom: 4,
            color: 'var(--color-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
          }}
        >
          <span style={{ textTransform: 'capitalize' }}>{project.status}</span>
          {' · '}
          {project.visibility}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          to={`/studio/project/${project.id}`}
          style={{
            display: 'inline-block',
            padding: '9px 16px',
            border: '1px solid var(--color-line-strong)',
            background: 'var(--color-paper)',
            color: 'var(--color-ink)',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Edit
        </Link>
        {isLive && (
          <Link
            to={publicUrl}
            style={{
              display: 'inline-block',
              padding: '9px 16px',
              color: 'var(--color-accent)',
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}
