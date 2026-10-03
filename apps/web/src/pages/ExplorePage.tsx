import { Link } from 'react-router-dom';
import { ProjectCard } from '@/components/project/ProjectCard';
import { usePublicProjects, useCategories } from '@/features/projects/useProjects';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function ExplorePage() {
  const { user } = useCurrentUser();
  const [categoryId, setCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useCategories();
  const { data, isLoading, isError, error } = usePublicProjects({
    page,
    limit: 12,
    categoryId: categoryId || undefined,
  });

  const categories = categoriesData ?? [];
  const projects = data?.items ?? [];

  return (
    <div className="max-w-container mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-text-secondary">
            Discover engineering projects from builders across the platform.
          </p>
        </div>

        {isCreator(user) && (
          <Link to="/studio/new">
            <Button size="lg">New project</Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="category-filter" className="text-sm text-text-secondary mr-2">
          Filter by category:
        </label>
        <select
          id="category-filter"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="rounded-input border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-card border border-border bg-surface h-64 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-card border border-error bg-error/5 p-6 text-center">
          <p className="text-error mb-2">Could not load projects.</p>
          <p className="text-xs text-text-muted">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <p className="text-text-primary font-medium mb-1">No projects yet</p>
          <p className="text-sm text-text-secondary mb-6">
            {categoryId
              ? 'No published projects in this category.'
              : 'Be the first to publish an engineering project on IDEVRX.'}
          </p>
          {isCreator(user) ? (
            <Link to="/studio/new">
              <Button>Create a project</Button>
            </Link>
          ) : user ? (
            <Link to="/creator/apply">
              <Button variant="secondary">Apply to become a Creator</Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button>Create an account</Button>
            </Link>
          )}
        </div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          {data && (data.page > 1 || data.hasNextPage) && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="md"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="self-center text-sm text-text-secondary">
                Page {data.page}
              </span>
              <Button
                variant="secondary"
                size="md"
                disabled={!data.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
