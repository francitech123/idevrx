import { Link } from 'react-router-dom';

interface RelatedProject {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  authorId: string;
  categoryId: string | null;
}

export function RelatedProjects({ projects }: { projects: RelatedProject[] }) {
  if (projects.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        padding: 20,
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '-0.012em',
          marginBottom: 14,
          color: 'var(--color-ink)',
        }}
      >
        More like this
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/ide/project-${String(p.projectNumber).padStart(3, '0')}/${p.slug}`}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: '10px 0',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                width: 84,
                aspectRatio: '3 / 2',
                borderRadius: 6,
                background: 'var(--color-paper-muted)',
                flexShrink: 0,
              }}
            />
            <span style={{ minWidth: 0 }}>
              <b
                style={{
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.25,
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: 'var(--color-ink)',
                }}
              >
                {p.title}
              </b>
              <small
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-muted)',
                  fontSize: 11,
                  display: 'block',
                  marginTop: 4,
                }}
              >
                Project {String(p.projectNumber).padStart(3, '0')}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
