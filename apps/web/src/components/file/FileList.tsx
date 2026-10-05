import { FileCard } from './FileCard';
import { useDeleteFile, useProjectFiles } from '@/features/files/useFiles';

export function FileList({
  projectId,
  canEdit,
}: {
  projectId: string;
  canEdit: boolean;
}) {
  const { data: files, isLoading, isError } = useProjectFiles(projectId);
  const remove = useDeleteFile(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-card border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card border border-error bg-error/5 p-4 text-sm text-error">
        Could not load files.
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-secondary">
        No files yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {files.map((f) => (
        <FileCard
          key={f.id}
          file={f}
          projectId={projectId}
          canRemove={canEdit}
          onRemove={async () => {
            if (!confirm(`Remove "${f.originalFilename}"?`)) return;
            await remove.mutateAsync(f.id);
          }}
        />
      ))}
    </div>
  );
}
