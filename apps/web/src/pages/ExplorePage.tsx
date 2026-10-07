import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { usePublicProjects } from '@/features/projects/useProjects';
import { useCurrentUser } from '@/features/auth/useAuth';
import { ProjectCard } from '@/components/project/ProjectCard';

const GUEST_LIMIT = 30;

export function ExplorePage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  const [page, setPage] = useState(1);
  const isGuest = !authLoading && !user;
  const limit = isGuest ? GUEST_LIMIT : 20;

  const { data, isLoading, isError } = usePublicProjects({
    page,
    limit,
    categoryId: category || undefined,
  });

  const projects = data?.items ?? [];

  function handleProjectClick(projectId: string) {
    if (isGuest) {
      navigate('/login', { state: { from: `/explore` } });
      return;
    }
    // Navigate handled by Link in ProjectCard
  }

  return (
    <div className="idx-block">
      <div className="idx-container">
        <div className="idx-section-head">
          <div className="idx-section-head-left">
            <div className="idx-eyebrow">Explore</div>
            <h1 className="idx-section-title">
              {category ? `Domain: ${category}` : 'Explore engineering projects'}
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
              <div key={i} className="idx-project-card">
                <div className="idx-project-image" />
                <div className="idx-project-body">
                  <div style={{ height: 60 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="idx-empty-projects">
            <p>Could not load projects. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <div className="idx-empty-projects">
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12,
            }}>
              No projects yet
            </p>
            <p style={{ marginBottom: 24 }}>
              Be the first to publish an engineering record.
            </p>
            <Link to="/register?intent=creator" className="idx-btn idx-btn-primary">
              Become a Creator →
            </Link>
          </div>
        )}

        {!isLoading && !isError && projects.length > 0 && (
          <div className="idx-projects-grid">
            {projects.map((p) => {
              const cardUrl = `/ide/project-${String(p.projectNumber).padStart(3, '0')}/${p.slug}`;
              if (isGuest) {
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('/login', { state: { from: cardUrl } })}
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

        {!isLoading && projects.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button
              className="idx-btn idx-btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
              Page {page}
            </span>
            <button
              className="idx-btn idx-btn-outline"
              disabled={!data?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
