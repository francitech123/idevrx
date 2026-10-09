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
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: 18,
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 12,
          color: '#0F172A',
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
              padding: '9px 0',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                width: 84,
                aspectRatio: '16/10',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0A1225 0%, #1E293B 100%)',
                flexShrink: 0,
              }}
            />
            <span style={{ minWidth: 0 }}>
              <b
                style={{
                  lineHeight: 1.3,
                  fontSize: 13,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.title}
              </b>
              <small
                style={{
                  color: '#64748B',
                  fontSize: 11,
                  display: 'block',
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
