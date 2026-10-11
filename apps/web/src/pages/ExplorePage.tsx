import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { usePublicProjects } from '@/features/projects/useProjects';
import { useCurrentUser } from '@/features/auth/useAuth';
import { ProjectCard } from '@/components/project/ProjectCard';

const GUEST_LIMIT = 30;

export function ExplorePage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') ?? '';
  const query = searchParams.get('q') ?? '';

  const [page, setPage] = useState(1);
  const isGuest = !authLoading && !user;
  const limit = isGuest ? GUEST_LIMIT : 20;

  const { data, isLoading, isError } = usePublicProjects({
    page,
    limit,
    categoryId: category || undefined,
  });

  const projects = data?.items ?? [];

  const filtered = query.trim()
    ? projects.filter((p) =>
        (p.title + ' ' + p.shortDescription)
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : projects;

  return (
    <div className="idx-block">
      <div className="idx-container">
        <div className="idx-section-head">
          <div className="idx-section-head-left">
            <div className="idx-eyebrow">Explore</div>
            <h1 className="idx-section-title">
              {query
                ? `Results for "${query}"`
                : category
                ? `Domain: ${category}`
                : 'Explore engineering projects'}
            </h1>
            <p className="idx-section-sub">
              {isGuest
                ? 'Sign in to see the full catalog and open any project in depth.'
                : 'Discover documented, reproducible engineering work.'}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="idx-projects-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-line)',
                  background: 'var(--color-card)',
                }}
              >
                <div
                  style={{
                    aspectRatio: '3 / 2',
                    background: 'var(--color-paper-muted)',
                  }}
                />
                <div style={{ padding: 18, height: 100 }} />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="idx-empty-projects">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-muted)',
              }}
            >
              Could not load projects. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="idx-empty-projects">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                marginBottom: 12,
              }}
            >
              No projects yet
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-muted)',
                marginBottom: 22,
              }}
            >
              Be the first to publish an engineering record.
            </p>
            <Link
              to="/register?intent=creator"
              className="idx-btn idx-btn-primary"
            >
              Become a Creator →
            </Link>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="idx-projects-grid">
            {filtered.map((p) => {
              const cardUrl = `/ide/project-${String(p.projectNumber).padStart(3, '0')}/${p.slug}`;
              if (isGuest) {
                return (
                  <div
                    key={p.id}
                    onClick={() =>
                      navigate('/login', { state: { from: cardUrl } })
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <ProjectCard project={p} />
                  </div>
                );
              }
              return <ProjectCard key={p.id} project={p} />;
            })}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
              marginTop: 40,
              alignItems: 'center',
            }}
          >
            <button
              className="idx-btn idx-btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                opacity: page <= 1 ? 0.4 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--color-muted)',
              }}
            >
              Page {page}
            </span>
            <button
              className="idx-btn idx-btn-outline"
              disabled={!data?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              style={{
                opacity: !data?.hasNextPage ? 0.4 : 1,
                cursor: !data?.hasNextPage ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
