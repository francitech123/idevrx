import { Link, Navigate } from 'react-router-dom';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { useMyProjects } from '@/features/projects/useProjects';
import { Button } from '@/components/ui/Button';
import type { ProjectListItem } from '@/features/projects/projectApi';

export function StudioProjectsPage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data, isLoading } = useMyProjects({ limit: 50 });

  if (authLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isCreator(user)) return <Navigate to="/creator/apply" replace />;

  const projects = data?.items ?? [];

  return (
    <div className="max-w-container mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Creator Studio</h1>
          <p className="text-text-secondary">
            Manage your drafts and published projects.
          </p>
        </div>
        <Link to="/studio/new">
          <Button size="lg">New project</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-card animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <p className="text-text-primary font-medium mb-1">No projects yet</p>
          <p className="text-sm text-text-secondary mb-6">
            Start your first engineering project.
          </p>
          <Link to="/studio/new">
            <Button>Create your first project</Button>
          </Link>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="space-y-3">
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
    <div className="rounded-card border border-border bg-surface p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-mono text-brand-primary mb-0.5">
          PROJECT {String(project.projectNumber).padStart(3, '0')}
        </p>
        <p className="font-semibold truncate">{project.title}</p>
        <p className="text-xs text-text-muted mt-0.5">
          <span className="capitalize">{project.status}</span>
          {' · '}
          {project.visibility}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to={`/studio/project/${project.id}`}>
          <Button variant="secondary" size="md">
            Edit
          </Button>
        </Link>
        {isLive && (
          <Link to={publicUrl}>
            <Button variant="ghost" size="md">
              View
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
