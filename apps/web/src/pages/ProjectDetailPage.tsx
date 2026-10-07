import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { useProject, useCategories } from '@/features/projects/useProjects';
import { useProjectFiles } from '@/features/files/useFiles';
import { useCurrentUser } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { FileCard } from '@/components/file/FileCard';

export function ProjectDetailPage() {
  const { projectNumber, slug } = useParams<{
    projectNumber: string;
    slug: string;
  }>();

  const { user, isLoading: authLoading } = useCurrentUser();
  const location = useLocation();

  const numeric = projectNumber?.replace(/^project-/, '') ?? '';
  const idOrNumber = /^\d+$/.test(numeric) ? numeric : slug ?? '';

  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useProject(idOrNumber || undefined);

  const { data: categoriesData } = useCategories();
  const { data: files } = useProjectFiles(project?.id);

  if (authLoading) return null;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-64 bg-muted rounded-card animate-pulse" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-reading mx-auto px-6 py-16 text-center">
        <p className="text-sm font-mono text-text-muted mb-2">404</p>

        <h1 className="text-2xl font-bold mb-3">
          Project not found
        </h1>

        <p className="text-text-secondary mb-6">
          {error instanceof Error
            ? error.message
            : "This project doesn't exist or isn't publicly visible."}
        </p>

        <Link to="/explore">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const category = categoriesData?.find(
    (c) => c.id === project.categoryId
  );

  const formattedNumber = `PROJECT ${String(
    project.projectNumber
  ).padStart(3, '0')}`;

  const isOwner = user.id === project.authorId;

  // Files are already visibility-filtered by the backend.
  // Show only 'ready' files with public visibility on the public page.
  const publicFiles = (files ?? []).filter(
    (f) =>
      f.processingStatus === 'ready' &&
      f.visibility === 'public'
  );

  // For owner, show all files even private ones.
  const displayFiles = isOwner ? (files ?? []) : publicFiles;

  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-mono text-brand-primary mb-2">
          {formattedNumber}
        </p>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {project.title}
        </h1>

        {project.shortDescription && (
          <p className="text-lg text-text-secondary max-w-reading">
            {project.shortDescription}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-card border border-border bg-surface p-6">
            <div className="aspect-[16/10] bg-muted rounded-button flex items-center justify-center text-text-muted text-sm">
              {project.coverFileId
                ? 'Cover image'
                : 'No cover image'}
            </div>
          </div>

          {project.youtubeUrl && (
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-text-muted mb-2">
                External video
              </p>

              <a
                href={project.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline break-all"
              >
                {project.youtubeUrl}
              </a>
            </div>
          )}

          {project.description ? (
            <div className="rounded-card border border-border bg-surface p-6">
              <h2 className="font-semibold mb-3">
                Description
              </h2>

              <p className="text-text-secondary whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          ) : (
            <div className="rounded-card border border-border bg-surface p-6 text-text-muted text-sm">
              This project does not have a full description yet.
            </div>
          )}

          {displayFiles.length > 0 && (
            <div className="rounded-card border border-border bg-surface p-6">
              <h2 className="font-semibold mb-4">
                Files{' '}
                {isOwner &&
                  files &&
                  files.length !== publicFiles.length && (
                    <span className="text-xs text-text-muted font-normal">
                      (showing {displayFiles.length}, including
                      your private files)
                    </span>
                  )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayFiles.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    projectId={project.id}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-card border border-dashed border-border bg-surface p-6 text-center">
            <p className="text-sm text-text-secondary">
              Steps, BOM, and gallery will appear here in later
              phases.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-text-muted">
              Details
            </h2>

            <dl className="space-y-2 text-sm">
              <Row label="Status" value={project.status} />
              <Row label="Version" value={project.version} />

              {category && (
                <Row label="Category" value={category.name} />
              )}

              {project.difficulty && (
                <Row
                  label="Difficulty"
                  value={project.difficulty}
                />
              )}

              {project.estimatedBuildTime && (
                <Row
                  label="Build time"
                  value={project.estimatedBuildTime}
                />
              )}

              {project.estimatedCost != null && (
                <Row
                  label="Estimated cost"
                  value={`${project.currency} ${project.estimatedCost}`}
                />
              )}

              {project.publishedAt && (
                <Row
                  label="Published"
                  value={new Date(
                    project.publishedAt
                  ).toLocaleDateString()}
                />
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary font-mono text-xs">
        {value}
      </dd>
    </div>
  );
}
