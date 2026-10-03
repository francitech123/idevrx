import { Link } from 'react-router-dom';
import type { ProjectListItem } from '@/features/projects/projectApi';

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const url = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;

  return (
    <Link
      to={url}
      className="block rounded-card border border-border bg-surface overflow-hidden hover:border-brand-primary transition-colors"
    >
      <div className="aspect-[16/10] bg-muted flex items-center justify-center">
        {project.coverFileId ? (
          // Phase 3 will render the actual cover image via signed URL.
          // For now, show a placeholder.
          <span className="text-xs text-text-muted">Cover</span>
        ) : (
          <span className="text-xs text-text-muted">No cover</span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-mono text-brand-primary mb-1">
          PROJECT {String(project.projectNumber).padStart(3, '0')}
        </p>
        <h3 className="font-semibold text-text-primary mb-1 line-clamp-2">
          {project.title}
        </h3>
        {project.shortDescription && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {project.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-text-muted">
          {project.difficulty && (
            <span className="capitalize">{project.difficulty}</span>
          )}
          {project.estimatedBuildTime && <span>{project.estimatedBuildTime}</span>}
          {project.estimatedCost != null && (
            <span>
              {project.currency} {project.estimatedCost}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
